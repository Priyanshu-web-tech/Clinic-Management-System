const router = require("express").Router();
const controller = require("../../controllers/dashboardController");
const { verifyAuthToken } = require("../../middlewares/index");

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard statistics
 */

/**
 * @swagger
 * /v1/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics for the authenticated user
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Returns clinic statistics scoped to the authenticated user's role:
 *       - **Doctor** – today's own visit counts (waiting, in_consultation, completed, cancelled), total patients, total staff, and 7-day visit trend.
 *       - **Receptionist / Admin** – today's all-hospital visit counts, total patients, and 7-day visit trend.
 *       - **Chemist** – today's prescriptions, all-time prescription count, and total patients.
 *
 *       Visit counts for chemists are always 0. `totalStaff` and `totalPrescriptions` are 0 for non-doctor/non-chemist roles respectively.
 *       `visitTrend` is always an empty array for chemists.
 *     responses:
 *       200:
 *         description: Dashboard stats fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status_code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Dashboard stats fetched successfully.
 *                 result:
 *                   type: object
 *                   properties:
 *                     waitingVisits:
 *                       type: integer
 *                       description: Visits with status "waiting" today.
 *                       example: 4
 *                     inConsultationVisits:
 *                       type: integer
 *                       description: Visits with status "in_consultation" today.
 *                       example: 1
 *                     completedVisits:
 *                       type: integer
 *                       description: Visits with status "completed" today.
 *                       example: 7
 *                     cancelledVisits:
 *                       type: integer
 *                       description: Visits with status "cancelled" today.
 *                       example: 2
 *                     totalPatients:
 *                       type: integer
 *                       description: Total active patients in the hospital.
 *                       example: 120
 *                     todayPrescriptions:
 *                       type: integer
 *                       description: Prescriptions issued today (chemist-focused).
 *                       example: 5
 *                     totalPrescriptions:
 *                       type: integer
 *                       description: All-time prescriptions. Non-zero for chemist only.
 *                       example: 340
 *                     totalStaff:
 *                       type: integer
 *                       description: Active staff members. Non-zero for doctor only.
 *                       example: 3
 *                     visitTrend:
 *                       type: array
 *                       description: Daily completed and cancelled visit counts for the last 7 days. Empty array for chemists.
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                             description: Calendar date in YYYY-MM-DD format (UTC).
 *                             example: "2026-05-24"
 *                           completed:
 *                             type: integer
 *                             description: Number of completed visits on this date.
 *                             example: 7
 *                           cancelled:
 *                             type: integer
 *                             description: Number of cancelled visits on this date.
 *                             example: 2
 *       400:
 *         description: Hospital not found for the authenticated user.
 *       401:
 *         description: Unauthorized – missing or invalid token.
 */
router.get("/stats", verifyAuthToken, controller.getStats);

module.exports = router;
