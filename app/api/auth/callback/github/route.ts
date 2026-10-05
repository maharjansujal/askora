import { db } from "@/src/db";
import { oauthAccounts, ranks, users } from "@/src/db/schema";
import { github } from "@/src/lib/auth/oauth";
import { createSession, setSessionCookie } from "@/src/lib/auth/session";
import { generateUsername } from "@/src/lib/auth/username";
import { uploadRemoteFile } from "@/src/lib/cloudinary";
import { and, eq, sql } from "drizzle-orm";
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

  if (!code || !state || !storedState) {
    return failRedirect;
  }

  if (state !== storedState) {
    return failRedirect;
  }

  try {
    const tokens = await github.validateAuthorizationCode(code);

    const accessToken = tokens.accessToken();

    const githubUserRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "Askora",
        Accept: "application/vnd.github+json",
      },
    });

    if (!githubUserRes.ok) {
      return failRedirect;
    }

    const githubUser = (await githubUserRes.json()) as {
      id: number;
      login: string;
      name: string | null;
      email: string | null;
      avatar_url: string | null;
    };

    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "Askora",
        Accept: "application/vnd.github+json",
      },
    });

    if (!emailsRes.ok) {
      return NextResponse.redirect(new URL("/login?error=no_email", req.url));
    }

    const emails = (await emailsRes.json()) as Array<{
      email: string;
      primary: boolean;
      verified: boolean;
    }>;

    const verifiedEmail =
      emails.find((email) => email.primary && email.verified) ??
      emails.find((email) => email.verified);

    if (!verifiedEmail) {
      return NextResponse.redirect(
        new URL("/login?error=email_not_verified", req.url),
      );
    }

    const normalizedEmail = verifiedEmail.email.trim().toLowerCase();
    const providerAccountId = String(githubUser.id);

    const [existingOAuth] = await db
      .select({
        userId: oauthAccounts.userId,
      })
      .from(oauthAccounts)
      .where(
        and(
          eq(oauthAccounts.provider, "github"),
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
          accessToken,
        })
        .where(
          and(
            eq(oauthAccounts.provider, "github"),
            eq(oauthAccounts.providerAccountId, providerAccountId),
          ),
        );
    } else {
      // NOTE: now also selecting avatarUrl — same reasoning as the Google
      // callback: this is what lets us decide whether to mirror the
      // provider's avatar to Cloudinary.
      const [existingUser] = await db
        .select({
          id: users.id,
          avatarUrl: users.avatarUrl,
        })
        .from(users)
        .where(sql`lower(${users.email}) = ${normalizedEmail}`)
        .limit(1);

      if (existingUser) {
        userId = existingUser.id;

        let avatarUpdate: { avatarUrl?: string; avatarPublicId?: string } = {};

        if (!existingUser.avatarUrl && githubUser.avatar_url) {
          try {
            const uploaded = await uploadRemoteFile(githubUser.avatar_url, {
              folder: "avatars",
              publicId: userId,
            });
            avatarUpdate = {
              avatarUrl: uploaded.fileUrl,
              avatarPublicId: uploaded.publicId,
            };
          } catch (err) {
            console.error("Cloudinary avatar upload failed (github)", err);
          }
        }

        await db.transaction(async (tx) => {
          await tx
            .update(users)
            .set({
              displayName: githubUser.name ?? undefined,
              emailVerifiedAt: sql`coalesce(${users.emailVerifiedAt}, now())`,
              updatedAt: new Date(),
              ...avatarUpdate,
            })
            .where(eq(users.id, userId));

          await tx.insert(oauthAccounts).values({
            userId,
            provider: "github",
            providerAccountId,
            email: normalizedEmail,
            accessToken,
          });
        });
      } else {
        // Brand-new user: always mirror the provider's avatar, if present.
        let avatarUrl: string | null = null;
        let avatarPublicId: string | null = null;

        const newUserId = crypto.randomUUID();

        if (githubUser.avatar_url) {
          try {
            const uploaded = await uploadRemoteFile(githubUser.avatar_url, {
              folder: "avatars",
              publicId: newUserId,
            });
            avatarUrl = uploaded.fileUrl;
            avatarPublicId = uploaded.publicId;
          } catch (err) {
            console.error(
              "Cloudinary avatar upload failed (github, new user)",
              err,
            );
          }
        }

        const result = await db.transaction(async (tx) => {
          const [newcomerRank] = await tx
            .select({ id: ranks.id })
            .from(ranks)
            .where(eq(ranks.level, 1))
            .limit(1);

          if (!newcomerRank) {
            throw new Error("Default rank (level 1) not found");
          }
          const [user] = await tx
            .insert(users)
            .values([
              {
                id: newUserId,
                username: await generateUsername(
                  githubUser.name ?? githubUser.login,
                  normalizedEmail,
                ),
                email: normalizedEmail,
                passwordHash: null,
                displayName: githubUser.name ?? "User",
                avatarUrl,
                avatarPublicId,
                rankId: newcomerRank.id,
                pointsBalance: 100,
                emailVerifiedAt: new Date(),
              },
            ])
            .returning({
              id: users.id,
            });

          await tx.insert(oauthAccounts).values({
            userId: user.id,
            provider: "github",
            providerAccountId,
            email: normalizedEmail,
            accessToken,
          });

          return user;
        });

        userId = result.id;
      }
    }

    const { token, expiresAt } = await createSession(userId);

    await setSessionCookie(token, expiresAt);

    cookieStore.delete("github_oauth_state");

    return NextResponse.redirect(new URL("/", req.url));
  } catch (err) {
    console.error("GitHub OAuth callback failed", err);
    return failRedirect;
  }
};
