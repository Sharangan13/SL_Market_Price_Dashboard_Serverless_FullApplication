/**
 * src/app/api/items/route.ts
 * GET /api/items — returns all distinct items with category and unit.
 */
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT item, category, unit
      FROM prices
      ORDER BY category, item
    `);
    return NextResponse.json(rows);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
