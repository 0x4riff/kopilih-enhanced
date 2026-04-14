import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase environment variables are not configured.");
  }
  return createClient(url, key);
}

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("cafe_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ submissions: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch submissions." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { id, status, admin_note } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status." }, { status: 400 });
    }

    const { data: updated, error: updateError } = await supabase
      .from("cafe_submissions")
      .update({ status, admin_note: admin_note ?? null })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) throw updateError;

    if (status === "approved") {
      const { error: upsertError } = await supabase.from("cafes").upsert(
        {
          submission_id: updated.id,
          name: updated.name,
          slug: updated.slug,
          city: updated.city,
          neighborhood: updated.neighborhood ?? updated.city,
          address: updated.address,
          description: updated.description,
          long_description: `${updated.description} Cafe ini berasal dari submission user dan sudah di-approve admin melalui Supabase workflow.`,
          price_range: updated.price_range,
          rating: 4.4,
          review_count: 0,
          vibes: updated.vibes ?? [],
          amenities: updated.amenities ?? [],
          image_url: updated.image_url ?? null,
          maps_url: updated.maps_url ?? null,
          instagram_url: updated.instagram_url ?? null,
          featured: false,
          wifi_friendly: (updated.amenities ?? []).includes("WiFi cepat"),
          source: "community",
          status: "published",
        },
        { onConflict: "slug" }
      );

      if (upsertError) throw upsertError;
    }

    return NextResponse.json({ submission: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update submission." },
      { status: 500 }
    );
  }
}