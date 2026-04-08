/**
 * src/app/api/prices/summary/route.ts
 * GET /api/prices/summary
 *
 * Returns for every item:
 *   - latest price for ALL markets
 *   - 30-day average for ALL markets
 *   - absolute diff (today vs 30d avg) for ALL markets
 *   - % change for ALL markets
 *
 * Query params:
 *   category — filter by category (optional)
 */
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { VALID_MARKETS } from '@/lib/constants';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get('category');

  const queryParams: string[] = [];

  // --- latest CTE ---
  const latestConditions: string[] = [];
  if (category) {
    queryParams.push(category);
    latestConditions.push(`category = $${queryParams.length}`);
  }
  const latestWhere = latestConditions.length
    ? `WHERE ${latestConditions.join(' AND ')}`
    : '';

  // --- avg30 CTE ---
  const avg30Conditions = [`report_date >= NOW() - INTERVAL '30 days'`];
  if (category) {
    queryParams.push(category);
    avg30Conditions.push(`category = $${queryParams.length}`);
  }
  const avg30Where = `WHERE ${avg30Conditions.join(' AND ')}`;

  const avgSelects = VALID_MARKETS.map(
    (m) => `ROUND(AVG(${m})::numeric, 2) AS avg_${m}`
  ).join(',\n        ');

  const sql = `
    WITH latest AS (
      SELECT DISTINCT ON (item)
        item, category, unit, report_date::text AS report_date,
        ${VALID_MARKETS.join(', ')}
      FROM prices
      ${latestWhere}
      ORDER BY item, report_date DESC
    ),
    avg30 AS (
      SELECT
        item,
        ${avgSelects}
      FROM prices
      ${avg30Where}
      GROUP BY item
    )
    SELECT
      l.*,
      ${VALID_MARKETS.map(
        (m) => `
        a.avg_${m},
        ROUND((l.${m} - a.avg_${m})::numeric, 2)                       AS diff_${m},
        CASE WHEN a.avg_${m} IS NOT NULL AND a.avg_${m} <> 0
          THEN ROUND(((l.${m} - a.avg_${m}) / a.avg_${m} * 100)::numeric, 2)
          ELSE NULL
        END                                                             AS pct_${m}`
      ).join(',')}
    FROM latest l
    LEFT JOIN avg30 a ON l.item = a.item
    ORDER BY l.category, l.item
  `;

  try {
    const { rows } = await pool.query(sql, queryParams);
    return NextResponse.json(rows);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[GET /api/prices/summary]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
