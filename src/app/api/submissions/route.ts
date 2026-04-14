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

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();

    const {
      name,
      city,
      neighborhood,
      address,
      description,
      price_range,
      vibes,
      amenities,
      image_url,
      maps_url,
      instagram_url,
    } = body;

    if (!name || !city || !neighborhood || !address || !description || !price_range) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const slug = `${name}-${city}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const { data, error } = await supabase
      .from("cafe_submissions")
      .insert({
        name,
        slug,
        city,
        neighborhood,
        address,
        description,
        price_range,
        vibes: vibes ?? [],
        amenities: amenities ?? [],
        image_url: image_url ?? null,
        maps_url: maps_url ?? null,
        instagram_url: instagram_url ?? null,
        status: "pending",
      })
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ submission: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create submission." },
      { status: 500 }
    );
  }
}