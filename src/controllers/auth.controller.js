const bcrypt = require("bcryptjs");
const { z } = require("zod");
const db = require("../db");
const { signToken } = require("../utils/jwt");

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72)
});

const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1)
});

function buildAuthResponse(user) {
  const token = signToken({
    sub: user.id,
    email: user.email
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.created_at
    }
  };
}

async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);
    const existingUser = await db.query("SELECT id FROM users WHERE email = $1", [
      data.email.toLowerCase()
    ]);

    if (existingUser.rowCount > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const result = await db.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [data.name, data.email.toLowerCase(), passwordHash]
    );

    return res.status(201).json(buildAuthResponse(result.rows[0]));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid request body",
        errors: error.flatten().fieldErrors
      });
    }

    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await db.query(
      "SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1",
      [data.email.toLowerCase()]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];
    const passwordMatches = await bcrypt.compare(data.password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.json(buildAuthResponse(user));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid request body",
        errors: error.flatten().fieldErrors
      });
    }

    return next(error);
  }
}

async function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = {
  register,
  login,
  me
};
