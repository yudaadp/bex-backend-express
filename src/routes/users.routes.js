const express = require("express");
const usersController = require("../controllers/users.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Lihat daftar user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/UserResponse"
 *       401:
 *         description: Token tidak ada, tidak valid, atau kedaluwarsa.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get("/", requireAuth, usersController.list);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Lihat detail user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detail user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: "#/components/schemas/UserResponse"
 *       404:
 *         description: User tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get("/:id", requireAuth, usersController.detail);

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Buat user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - nama
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 4
 *                 maxLength: 10
 *                 example: demouser
 *               nama:
 *                 type: string
 *                 minLength: 4
 *                 maxLength: 60
 *                 example: Demo User
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 120
 *                 example: demo@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 25
 *                 format: password
 *                 example: password123
 *               roleId:
 *                 type: integer
 *                 example: 2
 *               active:
 *                 type: string
 *                 enum: ["Y", "N"]
 *                 example: "Y"
 *     responses:
 *       201:
 *         description: User berhasil dibuat.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: "#/components/schemas/UserResponse"
 *       400:
 *         description: Request body tidak valid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/FieldErrorResponse"
 *       409:
 *         description: Username atau email sudah terdaftar.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.post("/", requireAuth, usersController.create);

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 4
 *                 maxLength: 10
 *               nama:
 *                 type: string
 *                 minLength: 4
 *                 maxLength: 60
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 120
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 25
 *                 format: password
 *               roleId:
 *                 type: integer
 *               active:
 *                 type: string
 *                 enum: ["Y", "N"]
 *     responses:
 *       200:
 *         description: User berhasil diupdate.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: "#/components/schemas/UserResponse"
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
 *         description: Username atau email sudah terdaftar.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.put("/:id", requireAuth, usersController.update);

module.exports = router;
