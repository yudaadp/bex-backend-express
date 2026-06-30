const express = require("express");
const rolesController = require("../controllers/roles.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @openapi
 * /api/roles:
 *   get:
 *     summary: Lihat daftar role
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar role.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 roles:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/RoleResponse"
 *       401:
 *         description: Token tidak ada, tidak valid, atau kedaluwarsa.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get("/", requireAuth, rolesController.list);

/**
 * @openapi
 * /api/roles/{id}:
 *   get:
 *     summary: Lihat detail role
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: int
 *     responses:
 *       200:
 *         description: Detail role.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 role:
 *                   $ref: "#/components/schemas/RoleResponse"
 *       404:
 *         description: Role tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get("/:id", requireAuth, rolesController.detail);

/**
 * @openapi
 * /api/roles:
 *   post:
 *     summary: Buat role
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleName
 *             properties:
 *               roleName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 30
 *                 example: staff
 *               roleDesc:
 *                 type: string
 *                 maxLength: 220
 *                 example: Role for staff
 *     responses:
 *       201:
 *         description: Role berhasil dibuat.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: "#/components/schemas/RoleResponse"
 *       400:
 *         description: Request body tidak valid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/FieldErrorResponse"
 *       409:
 *         description: Role name sudah terdaftar.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.post("/", requireAuth, rolesController.create);

/**
 * @openapi
 * /api/roles/{id}:
 *   put:
 *     summary: Update role
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: int
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleName
 *             properties:
 *               roleName:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 30
 *               roleDesc:
 *                 type: string
 *                 maxLength: 220
 *               active:
 *                 type: string
 *                 enum: ["Y", "N"]
 *     responses:
 *       200:
 *         description: Role berhasil diupdate.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: "#/components/schemas/RoleResponse"
 *       400:
 *         description: Request body tidak valid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/FieldErrorResponse"
 *       404:
 *         description: User tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       409:
 *         description: Role name sudah terdaftar.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.put("/:id", requireAuth, rolesController.update);

module.exports = router;
