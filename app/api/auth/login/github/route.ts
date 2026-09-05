import { github } from "@/src/lib/auth/oauth";
import { generateState } from "arctic";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const GET = async () => {
  const state = generateState();

  // GitHub doesn't support PKCE, so no code verifier needed
  const url = github.createAuthorizationURL(state, ["user:email"]);

  const cookieStore = await cookies();

  cookieStore.set("github_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    path: "/",
    sameSite: "lax",
  });

  return NextResponse.redirect(url);
};
