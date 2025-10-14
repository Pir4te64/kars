import type { Session } from "@supabase/supabase-js"
import type { NextRequest, NextResponse } from "next/server"

type CookieCarrier = {
  get(name: string): { value: string } | undefined
}

const COOKIE_PREFIX = "karzback"
export const ACCESS_TOKEN_COOKIE = `${COOKIE_PREFIX}-sb-access-token`
export const REFRESH_TOKEN_COOKIE = `${COOKIE_PREFIX}-sb-refresh-token`
export const EXPIRES_AT_COOKIE = `${COOKIE_PREFIX}-sb-expires-at`

const BASE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
}

const ONE_WEEK = 60 * 60 * 24 * 7

export function applySessionCookies(res: NextResponse, session: Session) {
  res.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: session.access_token,
    ...BASE_OPTIONS,
    maxAge: session.expires_in ?? 60 * 60,
  })

  if (session.refresh_token) {
    res.cookies.set({
      name: REFRESH_TOKEN_COOKIE,
      value: session.refresh_token,
      ...BASE_OPTIONS,
      maxAge: ONE_WEEK,
    })
  }

  if (session.expires_at) {
    res.cookies.set({
      name: EXPIRES_AT_COOKIE,
      value: String(session.expires_at),
      ...BASE_OPTIONS,
      maxAge: session.expires_in ?? 60 * 60,
    })
  }
}

export function clearSessionCookies(res: NextResponse) {
  res.cookies.delete(ACCESS_TOKEN_COOKIE)
  res.cookies.delete(REFRESH_TOKEN_COOKIE)
  res.cookies.delete(EXPIRES_AT_COOKIE)
}

export function readSessionCookies(
  req: NextRequest | { cookies: CookieCarrier }
) {
  const cookies = "cookies" in req ? req.cookies : (req as NextRequest).cookies
  const accessToken = cookies.get(ACCESS_TOKEN_COOKIE)?.value ?? null
  const refreshToken = cookies.get(REFRESH_TOKEN_COOKIE)?.value ?? null
  const expiresAtRaw = cookies.get(EXPIRES_AT_COOKIE)?.value ?? null
  const expiresAt = expiresAtRaw ? Number.parseInt(expiresAtRaw, 10) : null

  return { accessToken, refreshToken, expiresAt }
}
