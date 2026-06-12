const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.ipzkriwfcghlqfaqenaj:detskekrucky2026@aws-0-eu-west-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;