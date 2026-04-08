/**
 * src/app/api/prices/route.ts
 * GET /api/prices
 *
 * Query params:
 *   item       (required)
 *   market     — comma-separated market keys
 *   startDate  — YYYY-MM-DD
 *   endDate    — YYYY-MM-DD
 *   groupBy    — day (default) | week | month
 */
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { VALID_MARKETS } from '@/lib/constants';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const item      = searchParams.get('item');
  const market    = searchParams.get('market');
  const startDate = searchParams.get('startDate');
  const endDate   = searchParams.get('endDate');
  const groupBy   = searchParams.get('groupBy') || 'day';

  if (!item) {
    return NextResponse.json({ error: 'item is required' }, { status: 400 });
  }

  const requestedMarkets = market
    ? market.split(',').filter((m) => VALID_MARKETS.includes(m as any))
    : [...VALID_MARKETS];

  const groupExpr: Record<string, string> = {
    day:   `report_date::text`,
    week:  `DATE_TRUNC('week', report_date::date)::date::text`,
    month: `DATE_TRUNC('month', report_date::date)::date::text`,
  };

  const dateExpr = groupExpr[groupBy] ?? groupExpr.day;

  const marketSelects = requestedMarkets
    .map((m) => `ROUND(AVG(${m})::numeric, 2) AS ${m}`)
    .join(', ');

  const params: (string)[] = [item];
  let idx = 2;
  const conditions: string[] = [`item = $1`];

  if (startDate) { conditions.push(`report_date >= $${idx++}`); params.push(startDate); }
  if (endDate)   { conditions.push(`report_date <= $${idx++}`); params.push(endDate);   }

  const sql = `
    SELECT
      ${dateExpr} AS date,
      MIN(unit)   AS unit,
      ${marketSelects}
    FROM prices
    WHERE ${conditions.join(' AND ')}
    GROUP BY ${dateExpr}
    ORDER BY ${dateExpr}
  `;

  try {
    const { rows } = await pool.query(sql, params);
    return NextResponse.json({
      item,
      unit:    rows[0]?.unit ?? null,
      markets: requestedMarkets,
      data:    rows,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[GET /api/prices]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
