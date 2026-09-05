import { db } from "@/src/db";
import { oauthAccounts, users } from "@/src/db/schema";
import { google } from "@/src/lib/auth/oauth";
import { createSession } from "@/src/lib/auth/session";
import { generateUsername } from "@/src/lib/auth/username";
import { decodeIdToken } from "arctic";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const cookieStore = await cookies();
  const url = req.nextUrl;

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookieStore.get("google_oauth_state")?.value;
  const codeVerifier = cookieStore.get("google_code_verifier")?.value;

  //   Always redirect to login on any validation failure
  const failRedirect = NextResponse.redirect(
    new URL("/login?error=oauth_failed", req.url),
  );

  if (!code || !state || !storedState || !codeVerifier) return failRedirect;
  if (state !== storedState) return failRedirect;

  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);

    // Google puts the profile inside a signed JWT called the id_token
    const idToken = tokens.idToken();
    const claims = decodeIdToken(idToken) as {
      sub: string; // Google's unique user ID
      email: string;
      name: string;
      picture: string;
      email_verified: boolean;
    };

    const { sub: providerAccountId, email, name } = claims;
    // Look up existing OAuth link
    const [existingOAuth] = await db
      .select({ userId: oauthAccounts.userId })
      .from(oauthAccounts)
      .where(
        and(
          eq(oauthAccounts.provider, "google"),
          eq(oauthAccounts.providerAccountId, providerAccountId),
        ),
      );
    let userId: string;

    if (existingOAuth) {
      userId = existingOAuth.userId;
    } else {
      // New user — create both rows atomically
      const result = await db.transaction(async (tx) => {
        const [user] = await tx
          .insert(users)
          .values({
            username: await generateUsername(name, email),
            email: email.toLowerCase(),
            passwordHash: null,
            emailVerifiedAt: new Date(), // Google already verified it
          })
          .returning({ id: users.id });

        await tx.insert(oauthAccounts).values({
          userId: user.id,
          provider: "google",
          providerAccountId,
          email,
          accessToken: tokens.accessToken(),
        });

        return user;
      });
      userId = result.id;
    }
    // Issue session using existing session logic
    await createSession(userId);
    // Clean up the OAuth cookies
    cookieStore.delete("google_oauth_state");
    cookieStore.delete("google_code_verifier");

    return NextResponse.redirect(new URL("/", req.url));
  } catch (err) {
    console.error("Google OAuth callback failed", err);
    return failRedirect;
  }
};
