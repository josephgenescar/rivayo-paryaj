// Quick schema import script
// Usage: set DATABASE_URL and FORCE_DB_IMPORT=true then run `node scripts/import_schema.js`
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const force = process.env.FORCE_DB_IMPORT === 'true';

  if (!databaseUrl) {
    console.error('FATAL: DATABASE_URL pa defini. Mete li nan anviwònman an.');
    process.exit(1);
  }
  if (!force) {
    console.error('Sekirite: pou kouri import schema a mete FORCE_DB_IMPORT=true');
    console.error('Egzanp (Windows PowerShell): $env:FORCE_DB_IMPORT="true"; $env:DATABASE_URL="<url>"; node scripts/import_schema.js');
    process.exit(1);
  }

  const sqlPath = path.resolve(__dirname, '..', '..', 'database', 'schema.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('schema.sql pa jwenn nan path:', sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = new Client({ connectionString: databaseUrl, ssl: process.env.PGSSLMODE === 'no-verify' ? { rejectUnauthorized: false } : { rejectUnauthorized: true } });
  try {
    await client.connect();
    console.log('Konekte nan bazdone, ap kouri schema...');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Schema enpòte avèk siksè.');
  } catch (err) {
    console.error('Erè pandan import schema:', err.message || err);
    try { await client.query('ROLLBACK'); } catch (e) {}
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
