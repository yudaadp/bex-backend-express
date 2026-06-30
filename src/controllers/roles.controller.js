const { z } = require("zod");
const roleService = require("../services/roles.service");

const activeSchema = z.enum(["Y", "N"]);

const createRoleSchema = z.object({
  roleName: z.string().trim().min(2).max(30),
  roleDesc: z.string().trim().max(220),
});

const updateRoleSchema = z
  .object({
    roleName: z.string().trim().min(2).max(30).optional(),
    roleDesc: z.string().trim().max(220).optional(),
    active: activeSchema.optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required"
  });

function actorUsername(req) {
  return req.user?.username || "bex";
}

function handleValidationError(error, res) {
  return res.status(400).json({
    message: "Invalid request body",
    errors: error.flatten().fieldErrors
  });
}

async function list(req, res, next) {
  try {
    const roles = await roleService.listRoles();

    return res.json({ roles });
  } catch (error) {
    return next(error);
  }
}

async function detail(req, res, next) {
  try {
    const role = await roleService.getRoleById(req.params.id);

    return res.json({ role });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const data = createRoleSchema.parse(req.body);
    const role = await roleService.createRole(data, actorUsername(req));

    return res.status(201).json({ role });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error, res);
    }

    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const data = updateRoleSchema.parse(req.body);
    const role = await roleService.updateRole(req.params.id, data, actorUsername(req));

    return res.json({ role });
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
