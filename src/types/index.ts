/**
 * src/types/index.ts
 * Shared domain types used across API routes and UI components.
 */

export interface ItemRow {
  item: string;
  category: string;
  unit: string;
}

export interface PriceDataPoint {
  date: string;
  unit: string;
  [market: string]: string | number | null;
}

export interface PricesResponse {
  item: string;
  unit: string | null;
  markets: string[];
  data: PriceDataPoint[];
}

export interface SummaryRow {
  item: string;
  category: string;
  unit: string;
  report_date: string;
  // latest prices
  pettah_ws:      number | null;
  dambulla_ws:    number | null;
  pettah_rt:      number | null;
  dambulla_rt:    number | null;
  narahenpita_rt: number | null;
  // 30-day averages
  avg_pettah_ws:      number | null;
  avg_dambulla_ws:    number | null;
  avg_pettah_rt:      number | null;
  avg_dambulla_rt:    number | null;
  avg_narahenpita_rt: number | null;
  // diffs & pct changes
  [key: string]: string | number | null;
}
