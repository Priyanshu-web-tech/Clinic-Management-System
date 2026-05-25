const router = require("express").Router();
const schema = require("../../validation/validation");
const controller = require("../../controllers/userController");
const {
  validate,
  verifyAuthToken,
  authorizeRoles,
} = require("../../middlewares/index");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Staff and user management
 */

/**
 * @swagger
 * /v1/users:
 *   get:
 *     summary: Get paginated list of users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by name, email, or phone number
 *       - in: query
 *         name: designation
 *         schema: { type: string, enum: [receptionist, chemist] }
 *         description: Filter by staff designation
 *     responses:
 *       200:
 *         description: Users fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 result:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items: { type: object }
 *                       description: Array of staff users
 *                     total: { type: integer }
 *                     page: { type: integer }
 *                     pageSize: { type: integer }
 *                     totalPages: { type: integer }
 */
router.get(
  "/",
  verifyAuthToken,
  authorizeRoles("admin", "doctor"),
  controller.getUsers,
);

/**
 * @swagger
 * /v1/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, designation]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               designation: { type: string, enum: [receptionist, chemist] }
 *     responses:
 *       201:
 *         description: User created successfully.
 */
router.post(
  "/",
  verifyAuthToken,
  authorizeRoles("admin", "doctor"),
  validate(schema.createUser),
  controller.createUser,
);

/**
 * @swagger
 * /v1/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, designation]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               phone: { type: string }
 *               designation: { type: string, enum: [receptionist, chemist] }
 *     responses:
 *       200:
 *         description: User updated successfully.
 */
router.put(
  "/:id",
  verifyAuthToken,
  authorizeRoles("admin", "doctor"),
  validate(schema.updateUser),
  controller.updateUser,
);

/**
 * @swagger
 * /v1/users/{id}:
 *   delete:
 *     summary: Soft-delete a user (deactivate)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User deactivated successfully.
 */
router.delete(
  "/:id",
  verifyAuthToken,
  authorizeRoles("admin", "doctor"),
  controller.deleteUser,
);

module.exports = router;
