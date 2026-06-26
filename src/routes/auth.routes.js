const express = require("express");
const { authRateLimitMax, authRateLimitWindowMs } = require("../config/env");
const authController = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { createRateLimiter } = require("../middleware/rate-limit.middleware");

const router = express.Router();
const authRateLimiter = createRateLimiter({
  windowMs: authRateLimitWindowMs,
  max: authRateLimitMax,
  message: "Too many auth attempts, please try again later"
});

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register user baru
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - name
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 4
 *                 maxLength: 10
 *                 example: yudaadp
 *               name:
 *                 type: string
 *                 minLength: 2
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
 *     responses:
 *       201:
 *         description: User berhasil dibuat.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthResponse"
 *       400:
 *         description: Request body tidak valid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/FieldErrorResponse"
 *       409:
 *         description: Email sudah terdaftar.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       429:
 *         description: Terlalu banyak percobaan register.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.post("/register", authRateLimiter, authController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@bex.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login berhasil.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthResponse"
 *       400:
 *         description: Request body tidak valid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/FieldErrorResponse"
 *       401:
 *         description: Email atau password salah.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       429:
 *         description: Terlalu banyak percobaan login.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.post("/login", authRateLimiter, authController.login);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token berhasil diperbarui.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthResponse"
 *       400:
 *         description: Request body tidak valid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/FieldErrorResponse"
 *       401:
 *         description: Refresh token tidak valid atau kedaluwarsa.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       429:
 *         description: Terlalu banyak percobaan refresh token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.post("/refresh", authRateLimiter, authController.refresh);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Ambil user yang sedang login
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data user yang sedang login.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CurrentUserResponse"
 *       401:
 *         description: Token tidak ada, tidak valid, atau kedaluwarsa.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get("/me", authRateLimiter, requireAuth, authController.me);

module.exports = router;
