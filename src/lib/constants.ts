/**
 * src/lib/constants.ts
 * Single source of truth for market keys used by both API routes and UI.
 */

export const VALID_MARKETS = [
  'pettah_ws',
  'dambulla_ws',
  'pettah_rt',
  'dambulla_rt',
  'narahenpita_rt',
] as const;

export type MarketKey = (typeof VALID_MARKETS)[number];
