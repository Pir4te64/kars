import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await params;

  const { data, error } = await supabase
    .from("groups")
    .select("id, name, brand_id, prices_from, prices_to")
    .eq("brand_id", brandId)
    .order("name");

  if (error) return NextResponse.json([], { status: 500 });

  // Formato compatible con InfoAuto
  return NextResponse.json(
    data.map((g) => ({
      id: g.id,
      name: g.name,
      brand_id: g.brand_id,
      year_from: g.prices_from,
      year_to: g.prices_to,
    }))
  );
}
