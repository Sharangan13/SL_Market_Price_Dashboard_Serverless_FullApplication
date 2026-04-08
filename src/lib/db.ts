import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function createPool(): Pool {
  console.log('[DB] Creating new pool...'); // Debug
  const p = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  // Test the connection immediately
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

// Re-use pool across hot reloads in dev; create fresh in production
const pool: Pool = global._pgPool ?? createPool();
if (process.env.NODE_ENV !== 'production') {
  global._pgPool = pool;
  console.log('[DB] Using global pool cache');
}

export default pool;