import { NextResponse } from "next/server";
import { google } from "googleapis";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // For simplicity, we'll store the tokens in a cookie.
    // In a production app, you'd want to encrypt and store these in your database,
    // associated with the user.
    cookies().set("google_auth_tokens", JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    // Redirect the user back to the Google Sheets page.
    return NextResponse.redirect(new URL("/", request.url).toString());
  } catch (error) {
    console.error("Error exchanging authorization code for tokens:", error);
    return NextResponse.json({ error: "Failed to authenticate with Google" }, { status: 500 });
  }
}
