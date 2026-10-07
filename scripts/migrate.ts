import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Client } from 'pg';

// Load environment variables from .env if present
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

async function runMigration() {
  console.log('--------------------------------------------------');
  console.log(' EmergencySense: Supabase Migration Runner');
  console.log('--------------------------------------------------');

  const migrationFilePath = path.resolve(__dirname, '../supabase/migrations/001_initial_schema.sql');

  if (!fs.existsSync(migrationFilePath)) {
    console.error(`[ERROR] Migration file not found: ${migrationFilePath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationFilePath, 'utf-8');
  console.log(`[INFO] Loaded migration SQL file (${sql.length} bytes).`);

  if (DATABASE_URL) {
    console.log('[INFO] Connecting directly via DATABASE_URL / PostgreSQL...');
    const client = new Client({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      console.log('[INFO] Connected successfully to PostgreSQL database.');
      console.log('[INFO] Executing migration statements...');
      await client.query(sql);
      console.log(' [SUCCESS] Migration executed and schema successfully created!');
      await client.end();
      return;
    } catch (err: any) {
      console.error('[ERROR] Failed executing migration via pg Client:', err.message);
      await client.end();
      process.exit(1);
    }
  }

  // If no direct Postgres connection string is provided, attempt using Supabase URL & Service Role Key
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    console.log(`[INFO] Supabase URL detected: ${SUPABASE_URL}`);
    console.log('[INFO] Service role key detected.');
    
    // Attempt standard Supabase management API or REST SQL execution if configured
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ query: sql })
      });

      if (response.ok) {
        console.log(' [SUCCESS] Migration executed via Supabase RPC endpoint!');
        return;
      }
    } catch (fetchErr: any) {
      // Continue to instructions below
    }
  }

  console.log('\n[NOTICE] To apply this migration to your Supabase project:');
  console.log('Option 1 (Automated): Provide DATABASE_URL in your .env file:');
  console.log('  DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres');
  console.log('  and re-run: npm run migrate\n');
  console.log('Option 2 (Supabase Dashboard):');
  console.log('  1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/_/sql');
  console.log(`  2. Paste and run the contents of: supabase/migrations/001_initial_schema.sql`);
  console.log('--------------------------------------------------\n');
}

runMigration().catch((err) => {
  console.error('[UNCAUGHT ERROR]:', err);
  process.exit(1);
});
