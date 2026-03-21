import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("brands")
    .select("id, name")
    .order("name");

  if (error) return NextResponse.json([], { status: 500 });

  // Formato compatible con lo que espera useCarInfo
  return NextResponse.json(
    data.map((b) => ({ id: b.id, name: b.name, logo_url: null }))
  );
}
