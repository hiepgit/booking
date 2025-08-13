import * as dotenv from 'dotenv';
export function loadEnv() {
  dotenv.config({ path: new URL('../../.env', import.meta.url).pathname });
  // fallback: try local .env inside backend package
  dotenv.config();
  if (!process.env.DATABASE_URL) {
    console.warn('[env] DATABASE_URL missing. Did you create packages/backend/.env ?');
  }
}
