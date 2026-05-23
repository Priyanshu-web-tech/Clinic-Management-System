const router = require("express").Router();
const schema = require("../../validation/validation");
const controller = require("../../controllers/authController");
const { validate, verifyAuthToken } = require("../../middlewares/index");

/**
 * @swagger
 * /v1/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate a user with email and password. Returns JWT tokens set as cookies and in the response body.
 *     tags:
 *       - Authentication
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
 *                 example: doctor@docmate.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         first_name:
 *                           type: string
 *                         last_name:
 *                           type: string
 *                         user_type:
 *                           type: string
 *                           enum: [admin, doctor, staff, pharmacist]
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Invalid credentials or account suspended/deleted.
 *       404:
 *         description: User not found.
 */
router.post("/login", validate(schema.login), controller.login);

/**
 * @swagger
 * /v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new DocMate user account. Returns JWT tokens on success.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - userType
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: doctor@docmate.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *                 description: Min 8 chars, must include uppercase, lowercase, number, and special character.
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               userType:
 *                 type: string
 *                 enum: [admin, doctor, staff, pharmacist]
 *                 example: doctor
 *     responses:
 *       201:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         first_name:
 *                           type: string
 *                         last_name:
 *                           type: string
 *                         user_type:
 *                           type: string
 *                           enum: [admin, doctor, staff, pharmacist]
 *       400:
 *         description: Validation error.
 *       409:
 *         description: User already exists.
 *       500:
 *         description: Internal server error.
 */
router.post("/register", validate(schema.register), controller.register);

/**
 * @swagger
 * /v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Exchange a valid refresh token for a new access token and refresh token. Pass the token via the REFRESH-TOKEN cookie or Authorization Bearer header.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       401:
 *         description: Missing, invalid, or expired refresh token.
 */
router.post("/refresh", controller.refreshToken);

/**
 * @swagger
 * /v1/auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: Returns the authenticated user's profile. Requires a valid Bearer token or SESSION-TOKEN cookie.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile returned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     user_type:
 *                       type: string
 *                       enum: [admin, doctor, staff, pharmacist]
 *                     status:
 *                       type: string
 *                       enum: [active, deleted, deactivated]
 *       401:
 *         description: Missing or invalid token.
 */
router.get("/me", verifyAuthToken, controller.getProfile);

module.exports = router;
