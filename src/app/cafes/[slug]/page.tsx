import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CafeDetailClient } from "@/components/cafe-detail-client";
import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import { mapCafeRowToCoffeeShop } from "@/lib/supabase-mappers";
import { coffeeShops } from "@/lib/data";

export async function generateStaticParams() {
  return coffeeShops.map((shop) => ({ slug: shop.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const shop = coffeeShops.find((item) => item.slug === slug);
  if (!shop) {
    return {
      title: "Cafe detail | Kopilih Enhanced",
    };
  }
  return {
    title: `${shop.name} | Kopilih Enhanced`,
    description: shop.description,
  };
}

export default async function CafeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CafeDetailClient slug={slug} />;
}

export async function fetchCafeBySlug(slug: string) {
  if (!hasSupabaseEnv()) {
    return coffeeShops.find((s) => s.slug === slug) ?? null;
  }

  try {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase
      .from("cafes")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (!data) return null;
    return mapCafeRowToCoffeeShop(data);
  } catch {
    return coffeeShops.find((s) => s.slug === slug) ?? null;
  }
}