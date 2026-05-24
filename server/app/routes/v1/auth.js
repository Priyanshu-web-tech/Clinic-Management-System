const router = require("express").Router();
const schema = require("../../validation/validation");
const controller = require("../../controllers/authController");
const { validate, verifyAuthToken, verifyOtpToken } = require("../../middlewares/index");

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
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         userType:
 *                           type: string
 *                           enum: [admin, doctor, staff, chemist]
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
 *     summary: Register a new doctor
 *     description: Creates a hospital and a doctor account linked to it. Role is hardcoded as "doctor". Returns JWT tokens on success.
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
 *               - hospitalName
 *             properties:
 *               hospitalName:
 *                 type: string
 *                 example: City General Hospital
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: doctor@docmate.com
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *                 description: Optional. Must be exactly 10 digits if provided.
 *               address:
 *                 type: string
 *                 example: 123 Main St, City
 *                 description: Optional. Hospital address.
 *               password:
 *                 type: string
 *                 example: Password@123
 *                 description: Min 8 chars, must include uppercase, lowercase, number, and special character.
 *     responses:
 *       201:
 *         description: Doctor and hospital registered successfully.
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
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         userType:
 *                           type: string
 *                           example: doctor
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
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     userType:
 *                       type: string
 *                       enum: [admin, doctor, staff, chemist]
 *       401:
 *         description: Missing or invalid token.
 */
router.get("/me", verifyAuthToken, controller.getProfile);

/**
 * @swagger
 * /v1/auth/forgot-password:
 *   post:
 *     summary: Request password reset OTP
 *     description: Sends a one-time password to the user's registered email address. Sets an OTP-TOKEN cookie on success.
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
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: doctor@docmate.com
 *     responses:
 *       200:
 *         description: OTP sent to email.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Account suspended, deleted, or rate-limited.
 *       404:
 *         description: User not found.
 */
router.post("/forgot-password", validate(schema.forgotPassword), controller.forgotPassword);

/**
 * @swagger
 * /v1/auth/verify-otp:
 *   post:
 *     summary: Verify OTP for password reset
 *     description: Verifies the OTP sent to the user's email. Requires a valid OTP-TOKEN cookie. Sets a VERIFY-TOKEN cookie on success.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "999666"
 *     responses:
 *       200:
 *         description: OTP verified successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Invalid or expired OTP.
 */
router.post("/verify-otp", verifyOtpToken, validate(schema.verifyOtp), controller.verifyOtp);

/**
 * @swagger
 * /v1/auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     description: Resets the user's password. Requires a valid VERIFY-TOKEN cookie obtained after OTP verification.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - confirmPassword
 *             properties:
 *               password:
 *                 type: string
 *                 example: NewPassword@123
 *               confirmPassword:
 *                 type: string
 *                 example: NewPassword@123
 *     responses:
 *       200:
 *         description: Password reset successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Invalid or expired verify token.
 *       404:
 *         description: User not found.
 */
router.post("/reset-password", verifyOtpToken, validate(schema.resetPassword), controller.resetPassword);

/**
 * @swagger
 * /v1/auth/update-profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the authenticated user's first name and last name.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *                 description: Optional. Must be exactly 10 digits if provided.
 *     responses:
 *       200:
 *         description: Profile updated successfully.
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
 *                     user:
 *                       type: object
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid token.
 */
router.put("/update-profile", verifyAuthToken, validate(schema.updateProfile), controller.updateProfile);

/**
 * @swagger
 * /v1/auth/change-password:
 *   post:
 *     summary: Change user password
 *     description: Change the authenticated user's password. Requires the current password for verification.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: OldPassword@123
 *               newPassword:
 *                 type: string
 *                 example: NewPassword@123
 *               confirmPassword:
 *                 type: string
 *                 example: NewPassword@123
 *     responses:
 *       200:
 *         description: Password changed successfully.
 *       400:
 *         description: Validation error or new password same as current.
 *       401:
 *         description: Missing or invalid token, or incorrect current password.
 */
router.post("/change-password", verifyAuthToken, validate(schema.changePassword), controller.changePassword);

/**
 * @swagger
 * /v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Invalidates the current session and clears auth cookies.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully.
 *       401:
 *         description: Missing or invalid token.
 */
router.post("/logout", verifyAuthToken, controller.logout);

module.exports = router;
