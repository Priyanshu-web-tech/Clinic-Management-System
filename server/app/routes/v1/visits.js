const router = require("express").Router();
const schema = require("../../validation/validation");
const controller = require("../../controllers/visitController");
const {
  validate,
  verifyAuthToken,
  authorizeAccess,
  verifyCronSecret,
} = require("../../middlewares/index");
const { designation: designationConst } = require("../../constant/constant");
const authorizeResourceAccess = authorizeAccess(designationConst.RECEPTIONIST);

/**
 * @swagger
 * tags:
 *   name: Visits
 *   description: Visit / queue management
 */

/**
 * @swagger
 * /v1/visits:
 *   get:
 *     summary: Get paginated list of visits (sorted by token number)
 *     tags: [Visits]
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
 *         name: status
 *         schema: { type: string, enum: [waiting, in_consultation, completed, cancelled] }
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *         description: Filter by date (defaults to today)
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by patient name or patient code
 *       - in: query
 *         name: doctorId
 *         schema: { type: string }
 *         description: Filter by doctor (admin only)
 *       - in: query
 *         name: patientId
 *         schema: { type: string }
 *         description: Filter by patient (used for patient visit history)
 *       - in: query
 *         name: excludeVisitId
 *         schema: { type: string }
 *         description: Exclude a specific visit by ID from results and count (used with patientId to hide the current visit in history modal)
 *     responses:
 *       200:
 *         description: Visits fetched successfully.
 */
router.get("/", verifyAuthToken, authorizeResourceAccess, controller.getVisits);

/**
 * @swagger
 * /v1/visits/{id}:
 *   get:
 *     summary: Get visit details
 *     tags: [Visits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Visit fetched successfully.
 */
router.get("/:id", verifyAuthToken, authorizeResourceAccess, controller.getVisitById);

/**
 * @swagger
 * /v1/visits/{id}:
 *   put:
 *     summary: Update visit details (symptoms, diagnosis, follow-up date, optional status)
 *     tags: [Visits]
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
 *             properties:
 *               symptoms: { type: string }
 *               diagnosis: { type: string }
 *               followUpDate: { type: string, format: date }
 *               status: { type: string, enum: [in_consultation, completed, cancelled] }
 *     responses:
 *       200:
 *         description: Visit updated successfully.
 */
router.put(
  "/:id",
  verifyAuthToken,
  authorizeResourceAccess,
  validate(schema.updateVisit),
  controller.updateVisit,
);

/**
 * @swagger
 * /v1/visits:
 *   post:
 *     summary: Create a new visit (move patient to queue)
 *     tags: [Visits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patientId]
 *             properties:
 *               patientId: { type: string }
 *     responses:
 *       201:
 *         description: Visit created successfully.
 */
router.post(
  "/",
  verifyAuthToken,
  authorizeResourceAccess,
  validate(schema.createVisit),
  controller.createVisit,
);

/**
 * @swagger
 * /v1/visits/{id}/status:
 *   patch:
 *     summary: Update visit status
 *     tags: [Visits]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [in_consultation, completed, cancelled]
 *     responses:
 *       200:
 *         description: Visit updated successfully.
 */
router.patch(
  "/:id/status",
  verifyAuthToken,
  authorizeResourceAccess,
  validate(schema.updateVisitStatus),
  controller.updateVisitStatus,
);

/**
 * @swagger
 * /v1/visits/cancel-unattended:
 *   patch:
 *     summary: Cancel all unattended visits (cron use only)
 *     tags: [Visits]
 *     description: Bulk-cancels every visit still in `waiting` or `in_consultation` status. Requires the `x-cron-secret` header — not for regular client use.
 *     parameters:
 *       - in: header
 *         name: x-cron-secret
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Visits cancelled successfully.
 *       401:
 *         description: Unauthorized — missing or invalid cron secret.
 */
router.patch("/cancel-unattended", verifyCronSecret, controller.cancelUnattendedVisits);

module.exports = router;
