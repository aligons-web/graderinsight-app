import { config } from 'dotenv';
config();
import { Pool } from 'pg';

// Railway provides DATABASE_URL automatically when you attach a Postgres plugin.
// In Replit dev, set this env var to your Railway database's public connection string.
const DATABASE_URL = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    'Missing DATABASE_URL environment variable. ' +
    'Set it to your Railway PostgreSQL connection string.'
  );
}

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }   // Railway requires SSL in production
    : false,                           // local / Replit dev can skip SSL
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Lightweight health check — called once at startup
pool.on('error', (err) => {
  console.error('Unexpected PG pool error:', err);
});

/**
 * Helper: run a single query and return rows.
 * Works as a drop-in for most supabaseAdmin.from(...).select(...) patterns.
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

/**
 * Helper: run a query and return the first row or null.
 */
export async function queryOne<T = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const result = await pool.query(text, params);
  return (result.rows[0] as T) ?? null;
}

/**
 * Helper: run a query and return the row count affected.
 */
export async function execute(
  text: string,
  params?: any[]
): Promise<number> {
  const result = await pool.query(text, params);
  return result.rowCount ?? 0;
}

/**
 * Helper: run a count query.
 */
export async function queryCount(
  text: string,
  params?: any[]
): Promise<number> {
  const result = await pool.query(text, params);
  return parseInt(result.rows[0]?.count ?? '0', 10);
}