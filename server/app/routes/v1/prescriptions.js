const router = require("express").Router();
const controller = require("../../controllers/prescriptionController");
const { verifyAuthToken } = require("../../middlewares/index");
const { authorizePrescriptionAccess } = require("../../middlewares/rbac");

/**
 * @swagger
 * tags:
 *   name: Prescriptions
 *   description: Prescription management
 */

/**
 * @swagger
 * /v1/prescriptions:
 *   get:
 *     summary: Get paginated list of prescriptions
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *         description: Filter by date (defaults to all)
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by patient name or patient code
 *       - in: query
 *         name: patientId
 *         schema: { type: string }
 *         description: Filter by patient ID
 *     responses:
 *       200:
 *         description: Prescriptions fetched successfully.
 */
router.get("/", verifyAuthToken, authorizePrescriptionAccess, controller.getPrescriptions);

module.exports = router;
