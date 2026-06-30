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
    errorCode: "ERROR_VALIDATION",
    message: "At least one field is required"
  });

function actorUsername(req) {
  return req.user?.username || "bex";
}

function handleValidationError(error, res) {
  return res.status(400).json({
    errorCode: "ERROR_VALIDATION",
    message: "Invalid request body",
    errors: error.flatten().fieldErrors
  });
}

// async function list(req, res, next) {
//   try {
//     const data = await roleService.listRoles();
//
//     return res.json({ data });
//   } catch (error) {
//     return next(error);
//   }
// }

async function list(req, res, next) {
  try {
    const {
      draw,
      start = 0,
      length = 10,
      search,
      active
    } = req.query;

    const searchValue = search && search.value ? search.value : '';

    const result = await roleService.listRolesDt({
      start: parseInt(start, 10),
      length: parseInt(length, 10),
      searchValue,
      active
    });

    return res.json({
      draw: parseInt(draw, 10) || 1,
      recordsTotal: result.recordsTotal,
      recordsFiltered: result.recordsFiltered,
      data: result.data
    });

  } catch (error) {
    return next(error);
  }
}

async function detail(req, res, next) {
  try {
    const data = await roleService.getRoleById(req.params.id);

    return res.json({ data });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const dataReq = createRoleSchema.parse(req.body);
    const data = await roleService.createRole(dataReq, actorUsername(req));

    return res.status(201).json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error, res);
    }

    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const dataReq = updateRoleSchema.parse(req.body);
    const data = await roleService.updateRole(req.params.id, dataReq, actorUsername(req));

    return res.json({ data });
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
