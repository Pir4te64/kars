import { NextResponse } from "next/server"
import type { Session } from "@supabase/supabase-js"

import { applySessionCookies, clearSessionCookies } from "@/lib/auth/cookies"

type Payload = {
  event: string
  session: Session | null
}

export async function POST(request: Request) {
  const { event, session }: Payload = await request.json()
  const response = NextResponse.json({ success: true })

  if (!session || event === "SIGNED_OUT" || event === "USER_DELETED") {
    clearSessionCookies(response)
    return response
  }

  applySessionCookies(response, session)

  return response
}
