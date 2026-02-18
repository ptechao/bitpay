// 前言：此檔案定義了共用的資料庫連線配置，使用 Knex.js 作為查詢建構器，並整合 pg (node-postgres) 連線池。
// 該配置將被所有後端微服務共用，確保資料庫連線的一致性和高效管理。

const knex = require("knex");

const knexConfig = {
  client: "pg",
  connection: {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT ? parseInt(process.env.PG_PORT, 10) : 5432,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
  },
  pool: {
    min: process.env.PG_POOL_MIN ? parseInt(process.env.PG_POOL_MIN, 10) : 2,
    max: process.env.PG_POOL_MAX ? parseInt(process.env.PG_POOL_MAX, 10) : 10,
    acquireTimeoutMillis: process.env.PG_POOL_ACQUIRE_TIMEOUT ? parseInt(process.env.PG_POOL_ACQUIRE_TIMEOUT, 10) : 30000,
    idleTimeoutMillis: process.env.PG_POOL_IDLE_TIMEOUT ? parseInt(process.env.PG_POOL_IDLE_TIMEOUT, 10) : 10000,
  },
  migrations: {
    tableName: "knex_migrations",
  },
  seeds: {
    directory: "./seeds",
  },
};

const db = knex(knexConfig);

module.exports = db;
