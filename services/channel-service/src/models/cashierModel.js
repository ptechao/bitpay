const db = require('../config/db');

const findAll = async () => {
  const res = await db.raw('SELECT * FROM cashiers ORDER BY created_at DESC');
  return res.rows || [];
};

const findById = async (id) => {
  const res = await db.raw('SELECT * FROM cashiers WHERE id = $1', [id]);
  return res.rows[0];
};

const create = async (data) => {
  const res = await db.raw("INSERT INTO cashiers (name, code, config, status) VALUES ($1,$2,$3::jsonb,$4) RETURNING *", [data.name, data.code, JSON.stringify(data.config||{}), data.status||'active']);
  return res.rows[0];
};

const update = async (id, data) => {
  const res = await db.raw("UPDATE cashiers SET name=$1, code=$2, config=$3::jsonb, status=$4, updated_at=NOW() WHERE id=$5 RETURNING *", [data.name, data.code, JSON.stringify(data.config||{}), data.status||'active', id]);
  return res.rows[0];
};

const remove = async (id) => {
  await db.raw('DELETE FROM cashiers WHERE id = $1', [id]);
  return true;
};

module.exports = { findAll, findById, create, update, remove };
