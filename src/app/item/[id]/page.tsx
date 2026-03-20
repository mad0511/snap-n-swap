import { notFound } from "next/navigation";
import { ItemDetail } from "@/components/item/item-detail";
import type { MockItem } from "@/lib/mock-data";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function fetchItem(id: string): Promise<MockItem | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/items/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchAllItems(): Promise<MockItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/items`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await fetchItem(id);
  if (!item) return { title: "Item Not Found" };
  return {
    title: `${item.title} — Snap'n'Swap`,
    description: item.description,
  };
}

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await fetchItem(id);

  if (!item) {
    notFound();
  }

  // Get related items: pick up to 4 random items that aren't the current one
  const allItems = (await fetchAllItems()).filter(
    (i: MockItem) => i.id !== id
  );
  const shuffled = allItems.sort(() => Math.random() - 0.5);
  const relatedItems = shuffled.slice(0, 4);

  return <ItemDetail item={item} relatedItems={relatedItems} />;
}
