import { db } from "@/src/db";
import { oauthAccounts, users } from "@/src/db/schema";
import { github } from "@/src/lib/auth/oauth";
import { createSession } from "@/src/lib/auth/session";
import { generateUsername } from "@/src/lib/auth/username";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const cookieStore = await cookies();
  const url = req.nextUrl;

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookieStore.get("github_oauth_state")?.value;

  const failRedirect = NextResponse.redirect(
    new URL("/login?error=oauth_failed", req.url),
  );

  if (!code || !state || !storedState) return failRedirect;
  if (state !== storedState) return failRedirect;

  try {
    const tokens = await github.validateAuthorizationCode(code);

    // Github doesn't use an id_token, so call their API directly
    const githubUserRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
        "User-Agent": "Askora",
      },
    });

    const githubUser = (await githubUserRes.json()) as {
      id: number;
      login: string;
      name: string | null;
      email: string | null;
    };

    // Github users can hide their email, so fetch it separately if needed

    let email = githubUser.email;
    if (!email) {
      const emailsRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
          "User-Agent": "Askora",
        },
      });
      const emails = (await emailsRes.json()) as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
      }>;
      email = emails.find((e) => e.primary && e.verified)?.email ?? null;
    }
    if (!email) {
      return NextResponse.redirect(new URL("/login?error=no_email", req.url));
    }

    const providerAccountId = String(githubUser.id);

    const [existingOAuth] = await db
      .select({ userId: oauthAccounts.userId })
      .from(oauthAccounts)
      .where(
        and(
          eq(oauthAccounts.provider, "github"),
          eq(oauthAccounts.providerAccountId, providerAccountId),
        ),
      );

    let userId: string;

    if (existingOAuth) {
      userId = existingOAuth.userId;
    } else {
      const result = await db.transaction(async (tx) => {
        const [user] = await tx
          .insert(users)
          .values({
            username: await generateUsername(
              githubUser.name ?? githubUser.login,
              email!,
            ),
            email: email!.toLowerCase(),
            passwordHash: null,
            emailVerifiedAt: new Date(),
          })
          .returning({ id: users.id });

        await tx.insert(oauthAccounts).values({
          userId: user.id,
          provider: "github",
          providerAccountId,
          email,
          accessToken: tokens.accessToken(),
        });

        return user;
      });
      userId = result.id;
    }
    await createSession(userId);

    cookieStore.delete("github_oauth_state");

    return NextResponse.redirect(new URL("/", req.url));
  } catch (err) {
    console.error("GitHub OAuth callback failed", err);
    return failRedirect;
  }
};
