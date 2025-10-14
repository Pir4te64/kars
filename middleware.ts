import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  applySessionCookies,
  clearSessionCookies,
  readSessionCookies,
} from "@/lib/auth/cookies";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const ADMIN_HOME_PATH = "/admin/posts";
const PROTECTED_PREFIX = "/admin";
const LOGIN_PATH = "/login";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const response = NextResponse.next();

  const { accessToken, refreshToken } = readSessionCookies(request);
  let sessionValid = false;

  if (accessToken) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (!error && data.user) {
      sessionValid = true;
    } else if (refreshToken) {
      const { data: refreshed, error: refreshError } =
        await supabase.auth.refreshSession({
          refresh_token: refreshToken,
        });

      if (!refreshError && refreshed.session) {
        sessionValid = true;
        applySessionCookies(response, refreshed.session);
      } else {
        clearSessionCookies(response);
      }
    } else {
      clearSessionCookies(response);
    }
  }

  const isProtectedRoute = pathname.startsWith(PROTECTED_PREFIX);
  const isLoginRoute = pathname === LOGIN_PATH;

  if (isProtectedRoute && !sessionValid) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = LOGIN_PATH;
    if (pathname !== LOGIN_PATH) {
      redirectUrl.searchParams.set("redirect_to", `${pathname}${search}`);
    }
    return NextResponse.redirect(redirectUrl);
  }

  if (isLoginRoute && sessionValid) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = ADMIN_HOME_PATH;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
