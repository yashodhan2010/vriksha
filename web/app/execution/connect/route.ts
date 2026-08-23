import { NextResponse } from "next/server";
import { createExecutionApiToken, getExecutionUser } from "@/lib/execution-auth";

function getPublicBaseUrl() {
  return process.env.VRIKSHA_PUBLIC_BASE_URL || "https://www.vriksha-capital.com";
}

function getValidatedRedirectUri(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    const isLocalHttp =
      url.protocol === "http:"
      && (url.hostname === "127.0.0.1" || url.hostname === "localhost");

    return isLocalHttp ? url : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const redirectUri = getValidatedRedirectUri(requestUrl.searchParams.get("redirect_uri"));

  if (!redirectUri) {
    return NextResponse.json(
      { error: "A local http://127.0.0.1 or http://localhost redirect_uri is required." },
      { status: 400 }
    );
  }

  const user = await getExecutionUser();
  if (!user) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("next", `${requestUrl.pathname}${requestUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { token } = await createExecutionApiToken(user.id);
    redirectUri.searchParams.set("vriksha_token", token);
    redirectUri.searchParams.set("vriksha_base_url", getPublicBaseUrl());

    return NextResponse.redirect(redirectUri);
  } catch {
    return NextResponse.json({ error: "Could not create execution token." }, { status: 500 });
  }
}
