import { db } from "@/src/db";
import { oauthAccounts, users } from "@/src/db/schema";
import { google } from "@/src/lib/auth/oauth";
import { createSession, setSessionCookie } from "@/src/lib/auth/session";
import { generateUsername } from "@/src/lib/auth/username";
import { decodeIdToken } from "arctic";
import { and, eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const cookieStore = await cookies();
  const url = req.nextUrl;

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookieStore.get("google_oauth_state")?.value;
  const codeVerifier = cookieStore.get("google_code_verifier")?.value;

  const failRedirect = NextResponse.redirect(
    new URL("/login?error=oauth_failed", req.url),
  );

  if (!code || !state || !storedState || !codeVerifier) {
    return failRedirect;
  }

  if (state !== storedState) {
    return failRedirect;
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);

    const idToken = tokens.idToken();

    const claims = decodeIdToken(idToken) as {
      sub: string;
      email: string;
      name?: string;
      picture?: string;
      email_verified: boolean;
    };

    const {
      sub: providerAccountId,
      email,
      name,
      picture,
      email_verified,
    } = claims;

    if (!email || !email_verified) {
      return NextResponse.redirect(
        new URL("/login?error=email_not_verified", req.url),
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [existingOAuth] = await db
      .select({
        userId: oauthAccounts.userId,
      })
      .from(oauthAccounts)
      .where(
        and(
          eq(oauthAccounts.provider, "google"),
          eq(oauthAccounts.providerAccountId, providerAccountId),
        ),
      )
      .limit(1);

    let userId: string;

    if (existingOAuth) {
      userId = existingOAuth.userId;

      await db
        .update(oauthAccounts)
        .set({
          email: normalizedEmail,
          accessToken: tokens.accessToken(),
        })
        .where(
          and(
            eq(oauthAccounts.provider, "google"),
            eq(oauthAccounts.providerAccountId, providerAccountId),
          ),
        );
    } else {
      const [existingUser] = await db
        .select({
          id: users.id,
        })
        .from(users)
        .where(sql`lower(${users.email}) = ${normalizedEmail}`)
        .limit(1);

      if (existingUser) {
        userId = existingUser.id;

        await db.transaction(async (tx) => {
          await tx
            .update(users)
            .set({
              avatarUrl: picture ?? undefined,
              displayName: name ?? undefined,
              emailVerifiedAt: sql`coalesce(${users.emailVerifiedAt}, now())`,
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

          await tx.insert(oauthAccounts).values({
            userId,
            provider: "google",
            providerAccountId,
            email: normalizedEmail,
            accessToken: tokens.accessToken(),
          });
        });
      } else {
        const result = await db.transaction(async (tx) => {
          const [user] = await tx
            .insert(users)
            .values({
              username: await generateUsername(name ?? "user", normalizedEmail),
              email: normalizedEmail,
              passwordHash: null,
              displayName: name ?? null,
              avatarUrl: picture ?? null,
              emailVerifiedAt: new Date(),
            })
            .returning({
              id: users.id,
            });

          await tx.insert(oauthAccounts).values({
            userId: user.id,
            provider: "google",
            providerAccountId,
            email: normalizedEmail,
            accessToken: tokens.accessToken(),
          });

          return user;
        });

        userId = result.id;
      }
    }

    const { token, expiresAt } = await createSession(userId);

    await setSessionCookie(token, expiresAt);

    cookieStore.delete("google_oauth_state");
    cookieStore.delete("google_code_verifier");

    return NextResponse.redirect(new URL("/", req.url));
  } catch (err) {
    console.error("Google OAuth callback failed", err);
    return failRedirect;
  }
};
