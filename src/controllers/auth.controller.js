const { z } = require("zod");
const authService = require("../services/auth.service");

const registerSchema = z.object({
  username: z.string().trim().min(4).max(10),
  name: z.string().trim().min(4).max(60),
  email: z.string().trim().email().max(120),
  password: z.string().min(8).max(25)
});

const loginSchema = z.object({
  email: z.string().trim().email().max(120),
  password: z.string().min(1)
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1)
});

async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);
    const authResponse = await authService.registerUser(data);

    return res.status(201).json(authResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        errorCode: "ERROR_VALIDATION",
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
    const authResponse = await authService.loginUser(data);

    return res.json(authResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        errorCode: "ERROR_VALIDATION",
        message: "Invalid request body",
        errors: error.flatten().fieldErrors
      });
    }

    return next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const data = refreshTokenSchema.parse(req.body);
    const authResponse = await authService.refreshToken(data.refreshToken);

    return res.json(authResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        errorCode: "ERROR_VALIDATION",
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
  refresh,
  me
};
