const { Pool, types } = require('pg');

// Return DATE columns as plain 'YYYY-MM-DD' strings. Converting them to JS Dates shifts them by the
// server's timezone, which made deadlines show one day early and broke "today" comparisons.
types.setTypeParser(1082, v => v);
require('dotenv').config();

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'espeho_erp',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      }
);

pool.on('error', (err) => {
  // An idle client dropping (e.g. DB restart) must not take the whole server down — pg reconnects on next query
  console.error('Unexpected error on idle client', err.message);
});

module.exports = pool;
