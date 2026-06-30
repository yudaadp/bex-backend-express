const bcrypt = require("bcryptjs");
const db = require("../db");
const { signRefreshToken, signToken, verifyToken } = require("../utils/jwt");
const {decode} = require("jsonwebtoken");

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function buildAuthResponse(user) {
  const token = signToken({
    type: "access",
    sub: user.id,
    username: user.username,
    email: user.email,
    role: user.role_id
  });
  const refreshToken = signRefreshToken({
    type: "refresh",
    sub: user.id
  });

  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      roleId: user.role_id
    }
  };
}

async function registerUser(data) {
  const email = data.email.toLowerCase();
  const existingUser = await db.query("SELECT id FROM users WHERE email = $1", [email]);

  if (existingUser.rowCount > 0) {
    throw createHttpError(409, "Email already registered");
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const result = await db.query(
    `INSERT INTO users (username, name, email, password, role_id)
     VALUES ($1, $2, $3, $4, 2)
     RETURNING id, username, name, email, role_id`,
    [data.username, data.name, email, passwordHash]
  );

  return buildAuthResponse(result.rows[0]);
}

async function loginUser(data) {
  const result = await db.query(
    "SELECT id, username, name, email, password, role_id, active FROM users WHERE email = $1",
    [data.email.toLowerCase()]
  );

  if (result.rowCount === 0) {
    throw createHttpError(401, "Invalid email or password");
  }

  const user = result.rows[0];
  const passwordMatches = await bcrypt.compare(data.password, user.password);

  if (user.active === "N") {
    throw createHttpError(403, "User is not active, please contact administrator");
  }

  if (!passwordMatches) {
    throw createHttpError(401, "Invalid email or password");
  }



  return buildAuthResponse(user);
}

async function refreshToken(token) {
  let payload;

  try {
    payload = verifyToken(token);
  } catch (error) {
    throw createHttpError(401, "Invalid or expired refresh token");
  }

  if (payload.type !== "refresh") {
    throw createHttpError(401, "Invalid refresh token");
  }

  const result = await db.query(
    "SELECT id, username, name, email, role_id, active FROM users WHERE id = $1",
    [payload.sub]
  );

  if (result.rowCount === 0) {
    throw createHttpError(401, "Invalid refresh token");
  }

  if (result.rows[0].active === "N") {
    throw createHttpError(403, "User is not active, please contact administrator");
  }

  return buildAuthResponse(result.rows[0]);
}

module.exports = {
  refreshToken,
  registerUser,
  loginUser
};
