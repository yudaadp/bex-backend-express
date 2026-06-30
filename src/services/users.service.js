const bcrypt = require("bcryptjs");
const db = require("../db");

const USER_RESPONSE_FIELDS = `
  u.id,
  u.username,
  u.name AS nama,
  u.email,
  u.active,
  r.role_name,
  u.created_at,
  u.created_by
`;

const INSERT_RESPONSE_FIELDS = `
  id,
  username,
  name AS nama,
  email,
  active,
  role_id,
  created_at,
  created_by
`;

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function ensureUniqueUser({ username, email, excludeId }) {
  const conditions = [];
  const values = [];

  if (username) {
    values.push(username);
    conditions.push(`username = $${values.length}`);
  }

  if (email) {
    values.push(email);
    conditions.push(`email = $${values.length}`);
  }

  if (conditions.length === 0) {
    return;
  }

  let query = `SELECT username, email FROM users WHERE (${conditions.join(" OR ")})`;

  if (excludeId) {
    values.push(excludeId);
    query += ` AND id <> $${values.length}`;
  }

  const result = await db.query(query, values);

  if (result.rowCount === 0) {
    return;
  }

  const duplicate = result.rows[0];

  if (username && duplicate.username === username) {
    throw createHttpError(409, "Username already registered");
  }

  if (email && duplicate.email === email) {
    throw createHttpError(409, "Email already registered");
  }
}

async function listUsers() {
  const result = await db.query(
    `SELECT ${USER_RESPONSE_FIELDS}
     FROM users u INNER JOIN roles r on r.id = u.role_id
     ORDER BY u.created_at DESC`
  );

  return result.rows;
}

async function getUserById(id) {
  const result = await db.query(
    `SELECT ${USER_RESPONSE_FIELDS}
     FROM users u INNER JOIN roles r on r.id = u.role_id
     WHERE u.id = $1`,
    [id]
  );

  if (result.rowCount === 0) {
    throw createHttpError(404, "User not found");
  }

  return result.rows[0];
}

async function createUser(data, actorUsername) {
  const email = data.email.toLowerCase();

  await ensureUniqueUser({
    username: data.username,
    email
  });

  const passwordHash = await bcrypt.hash(data.password, 12);
  const result = await db.query(
    `INSERT INTO users (username, name, email, password, role_id, active, created_by, last_update_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
     RETURNING ${INSERT_RESPONSE_FIELDS}`,
    [
      data.username,
      data.nama,
      email,
      passwordHash,
      data.roleId || 2,
      data.active || "Y",
      actorUsername
    ]
  );

  return result.rows[0];
}

async function updateUser(id, data, actorUsername) {
  const existing = await db.query("SELECT id FROM users WHERE id = $1", [id]);

  if (existing.rowCount === 0) {
    throw createHttpError(404, "User not found");
  }

  const email = data.email ? data.email.toLowerCase() : undefined;

  await ensureUniqueUser({
    username: data.username,
    email,
    excludeId: id
  });

  const updates = [];
  const values = [];

  function addUpdate(column, value) {
    values.push(value);
    updates.push(`${column} = $${values.length}`);
  }

  if (data.username !== undefined) addUpdate("username", data.username);
  if (data.nama !== undefined) addUpdate("name", data.nama);
  if (email !== undefined) addUpdate("email", email);
  if (data.active !== undefined) addUpdate("active", data.active);
  if (data.roleId !== undefined) addUpdate("role_id", data.roleId);

  if (data.password !== undefined) {
    const passwordHash = await bcrypt.hash(data.password, 12);
    addUpdate("password", passwordHash);
  }

  addUpdate("last_update_by", actorUsername);
  updates.push("updated_at = NOW()");
  values.push(id);

  const result = await db.query(
      `WITH updated_user AS (
     UPDATE users
     SET ${updates.join(", ")}
     WHERE id = $${values.length}
     RETURNING *
   )
   SELECT ${USER_RESPONSE_FIELDS}
   FROM updated_user u
   JOIN roles r ON u.role_id = r.id`,
      values
  );

  return result.rows[0];
}

module.exports = {
  createUser,
  getUserById,
  listUsers,
  updateUser
};
