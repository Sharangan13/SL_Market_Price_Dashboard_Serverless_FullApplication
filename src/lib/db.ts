import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function createPool(): Pool {
  console.log('[DB] Creating new pool...');

  const p = new Pool({
    connectionString: process.env.DATABASE_URL, // ✅ use direct URL
    ssl: {
      rejectUnauthorized: false, // ✅ required for Supabase (important!)
    },
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000, // increase for serverless
  });

  // Test connection
  p.connect()
    .then(client => {
      console.log('[DB] Connection successful');
      client.release();
    })
    .catch(err => {
      console.error('[DB] Connection failed:', err);
    });

  return p;
}

const pool: Pool = global._pgPool ?? createPool();

if (process.env.NODE_ENV !== 'production') {
  global._pgPool = pool;
  console.log('[DB] Using global pool cache');
}

export default pool;