import { google } from "@/src/lib/auth/oauth";
import { generateCodeVerifier, generateState } from "arctic";
import { googleFontsMetadata } from "next/dist/compiled/@next/font/dist/google/google-fonts-metadata";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const GET = async () => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier(); // PKCE - extra security layer

  const url = google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "email",
    "profile",
  ]);

  const cookieStore = await cookies();

  cookieStore.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
    sameSite: "lax",
  });

  cookieStore.set("google_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    path: "/",
    sameSite: "lax",
  });

  return NextResponse.redirect(url);
};
