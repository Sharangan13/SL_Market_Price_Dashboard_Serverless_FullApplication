/**
 * src/lib/api.ts
 *
 * All API calls now target the same-origin Next.js API routes (/api/...).
 * No NEXT_PUBLIC_API_URL env var needed — no cross-origin requests, no CORS.
 */

async function safeFetch<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`API error ${res.status} for: ${url}`);
      return null;
    }
    const data: T = await res.json();
    if (process.env.NODE_ENV === 'development') {
      console.log(`[api] ${url}`, data);
    }
    return data;
  } catch (err) {
    console.error(`[api] fetch failed: ${url}`, err);
    return null;
  }
}

export function fetchItems() {
  return safeFetch<{ item: string; category: string; unit: string }[]>('/api/items');
}

export function fetchCategories() {
  return safeFetch<string[]>('/api/items/categories');
}

export function fetchSummary(category = '') {
  const url = category
    ? `/api/prices/summary?category=${encodeURIComponent(category)}`
    : '/api/prices/summary';
  return safeFetch<Record<string, unknown>[]>(url);
}

export function fetchPrices({
  item,
  markets,
  startDate,
  endDate,
  groupBy,
}: {
  item: string;
  markets?: string[];
  startDate?: string;
  endDate?: string;
  groupBy?: string;
}) {
  const params = new URLSearchParams({ item, groupBy: groupBy || 'day' });
  if (markets?.length) params.set('market', markets.join(','));
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  return safeFetch<{
    item: string;
    unit: string | null;
    markets: string[];
    data: Record<string, unknown>[];
  }>(`/api/prices?${params}`);
}

export async function fetchItemMeta(itemName: string) {
  const data = await fetchItems();
  if (!Array.isArray(data)) return null;
  return data.find((i) => i.item === itemName) ?? null;
}

export async function fetchItemSummary(itemName: string) {
  const data = await fetchSummary();
  if (!Array.isArray(data)) return null;
  return (data as Record<string, unknown>[]).find((r) => r.item === itemName) ?? null;
}
