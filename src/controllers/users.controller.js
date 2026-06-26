const { z } = require("zod");
const usersService = require("../services/users.service");

const activeSchema = z.enum(["Y", "N"]);

const createUserSchema = z.object({
  username: z.string().trim().min(4).max(10),
  nama: z.string().trim().min(4).max(60),
  email: z.string().trim().email().max(120),
  password: z.string().min(8).max(25),
  roleId: z.number().int().positive().optional(),
  active: activeSchema.optional()
});

const updateUserSchema = z
  .object({
    username: z.string().trim().min(4).max(10).optional(),
    nama: z.string().trim().min(4).max(60).optional(),
    email: z.string().trim().email().max(120).optional(),
    password: z.string().min(8).max(25).optional(),
    roleId: z.number().int().positive().optional(),
    active: activeSchema.optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required"
  });

function actorUsername(req) {
  return req.user?.username || "system";
}

function handleValidationError(error, res) {
  return res.status(400).json({
    message: "Invalid request body",
    errors: error.flatten().fieldErrors
  });
}

async function list(req, res, next) {
  try {
    const users = await usersService.listUsers();

    return res.json({ users });
  } catch (error) {
    return next(error);
  }
}

async function detail(req, res, next) {
  try {
    const user = await usersService.getUserById(req.params.id);

    return res.json({ user });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const data = createUserSchema.parse(req.body);
    const user = await usersService.createUser(data, actorUsername(req));

    return res.status(201).json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error, res);
    }

    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const data = updateUserSchema.parse(req.body);
    const user = await usersService.updateUser(req.params.id, data, actorUsername(req));

    return res.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error, res);
    }

    return next(error);
  }
}

module.exports = {
  create,
  detail,
  list,
  update
};
