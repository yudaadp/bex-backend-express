const db = require("../db");

const ROLES_RESPONSE_FIELDS = `
  id,
  role_name,
  role_desc,
  active,
  created_at,
  created_by
`;

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function ensureUnique({ roleName, excludeId }) {
  const conditions = [];
  const values = [];

  if (roleName) {
    values.push(roleName);
    conditions.push(`role_name = $${values.length}`);
  }

  if (conditions.length === 0) {
    return;
  }

  let query = `SELECT role_name FROM roles WHERE (${conditions.join(" OR ")})`;

  if (excludeId) {
    values.push(excludeId);
    query += ` AND id <> $${values.length}`;
  }

  const result = await db.query(query, values);

  if (result.rowCount === 0) {
    return;
  }

  const duplicate = result.rows[0];

  if (roleName && duplicate.role_name === roleName) {
    throw createHttpError(409, "Role name already registered");
  }
}

async function listRoles() {
  const result = await db.query(
    `SELECT ${ROLES_RESPONSE_FIELDS}
     FROM roles
     ORDER BY created_at DESC`
  );

  return result.rows;
}

async function listRolesDt(params) {
  const { start, length, searchValue, active } = params;

  console.log(params);

  let baseQuery = `
    FROM roles 
    WHERE 1=1
  `;

  const queryValues = [];
  let paramIndex = 1;

  const totalQuery = await db.query(`SELECT COUNT(id) as total FROM roles`);
  const recordsTotal = parseInt(totalQuery.rows[0].total, 10);

  if (searchValue) {
    baseQuery += ` AND (role_name ILIKE $${paramIndex} OR role_desc ILIKE $${paramIndex})`;
    queryValues.push(`%${searchValue}%`);
    paramIndex++;
  }

  if (active) {
    baseQuery += ` AND active = $${paramIndex}`;
    queryValues.push(active);
    paramIndex++;
  }

  const filteredQuery = await db.query(`SELECT COUNT(id) as total ${baseQuery}`, queryValues);
  const recordsFiltered = parseInt(filteredQuery.rows[0].total, 10);

  baseQuery += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  queryValues.push(length, start);

  console.log(baseQuery);
  console.log(queryValues);

  const dataQuery = await db.query(
      `SELECT ${ROLES_RESPONSE_FIELDS} ${baseQuery}`,
      queryValues
  );

  return {
    recordsTotal,
    recordsFiltered,
    data: dataQuery.rows
  };
}


async function getRoleById(id) {
  const result = await db.query(
    `SELECT ${ROLES_RESPONSE_FIELDS}
     FROM roles WHERE id = $1`,
    [id]
  );

  if (result.rowCount === 0) {
    throw createHttpError(404, "Role not found");
  }

  return result.rows[0];
}

async function createRole(data, actorUsername) {

  await ensureUnique({
    roleName: data.roleName
  });

  const result = await db.query(
    `INSERT INTO roles (role_name, role_desc, created_by)
     VALUES ($1, $2, $3)
     RETURNING ${ROLES_RESPONSE_FIELDS}`,
    [
      data.roleName,
      data.roleDesc,
      actorUsername
    ]
  );

  return result.rows[0];
}

async function updateRole(id, data, actorUsername) {
  const existing = await db.query("SELECT id FROM roles WHERE id = $1", [id]);

  if (existing.rowCount === 0) {
    throw createHttpError(404, "Role not found");
  }

  if (data.roleName !== undefined) {
    await ensureUnique({
      roleName: data.roleName,
      excludeId: id,
    });
  }

  const updates = [];
  const values = [];

  function addUpdate(column, value) {
    values.push(value);
    updates.push(`${column} = $${values.length}`);
  }

  if (data.roleName !== undefined) addUpdate("role_name", data.roleName);
  if (data.roleDesc !== undefined) addUpdate("role_desc", data.roleDesc);
  if (data.active !== undefined) addUpdate("active", data.active);

  addUpdate("last_update_by", actorUsername);
  updates.push("updated_at = NOW()");
  values.push(id);

  const result = await db.query(
      `UPDATE roles
     SET ${updates.join(", ")}
     WHERE id = $${values.length}
     RETURNING ${ROLES_RESPONSE_FIELDS}`,
      values
  );

  return result.rows[0];
}

module.exports = {
  createRole,
  getRoleById,
  listRoles,
  listRolesDt,
  updateRole
};
