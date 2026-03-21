import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ brandId: string; groupId: string }> }
) {
  const { groupId } = await params;

  const { data, error } = await supabase
    .from("models")
    .select("id, name, codia, description, year_from, year_to, group_id")
    .eq("group_id", groupId)
    .order("name");

  if (error) return NextResponse.json([], { status: 500 });

  // Formato compatible con InfoAuto
  return NextResponse.json(
    data.map((m) => ({
      id: m.id,
      name: m.name,
      codia: m.codia,
      description: m.description || m.name,
      year_from: m.year_from,
      year_to: m.year_to,
      prices_from: m.year_from,
      prices_to: m.year_to,
    }))
  );
}
