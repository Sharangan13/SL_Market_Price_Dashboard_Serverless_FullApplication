/**
 * src/app/api/items/categories/route.ts
 * GET /api/items/categories — returns unique category list.
 */
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT category FROM prices ORDER BY category`
    );
    return NextResponse.json(rows.map((r: { category: string }) => r.category));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
