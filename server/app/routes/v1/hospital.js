const router = require("express").Router();
const schema = require("../../validation/validation");
const controller = require("../../controllers/hospitalController");
const { validate, verifyAuthToken, authorizeRoles } = require("../../middlewares/index");

/**
 * @swagger
 * tags:
 *   name: Hospital
 *   description: Hospital management
 */

/**
 * @swagger
 * /v1/hospital:
 *   put:
 *     summary: Update hospital details
 *     description: Update the name and address of the authenticated doctor's hospital.
 *     tags:
 *       - Hospital
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: City General Hospital
 *               address:
 *                 type: string
 *                 example: 123 Main St, City
 *                 description: Optional.
 *     responses:
 *       200:
 *         description: Hospital updated successfully.
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
 *                     hospital:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         address:
 *                           type: string
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid token.
 *       403:
 *         description: Access denied. Only doctors can edit hospital details.
 *       404:
 *         description: Hospital not found.
 */
router.put("/", verifyAuthToken, authorizeRoles("doctor"), validate(schema.updateHospital), controller.updateHospital);

module.exports = router;
