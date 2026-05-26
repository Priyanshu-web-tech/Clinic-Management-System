const router = require("express").Router();
const schema = require("../../validation/validation");
const controller = require("../../controllers/patientController");
const {
  validate,
  verifyAuthToken,
  authorizePatientAccess,
} = require("../../middlewares/index");

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient management
 */

/**
 * @swagger
 * /v1/patients:
 *   get:
 *     summary: Get paginated list of patients
 *     tags: [Patients]
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
 *         description: Search by name, phone, or patient code
 *       - in: query
 *         name: gender
 *         schema: { type: string, enum: [male, female, other] }
 *       - in: query
 *         name: bloodGroup
 *         schema: { type: string, enum: ["A+","A-","B+","B-","AB+","AB-","O+","O-"] }
 *     responses:
 *       200:
 *         description: Patients fetched successfully.
 */
router.get(
  "/",
  verifyAuthToken,
  authorizePatientAccess,
  controller.getPatients,
);

/**
 * @swagger
 * /v1/patients:
 *   post:
 *     summary: Create a new patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, phone, gender]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               phone: { type: string }
 *               gender: { type: string, enum: [male, female, other] }
 *               dateOfBirth: { type: string, format: date }
 *               bloodGroup: { type: string }
 *               allergies: { type: array, items: { type: string } }
 *               chronicDiseases: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Patient added successfully.
 */
router.post(
  "/",
  verifyAuthToken,
  authorizePatientAccess,
  validate(schema.createPatient),
  controller.createPatient,
);

/**
 * @swagger
 * /v1/patients/{id}:
 *   put:
 *     summary: Update a patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Patient updated successfully.
 */
router.put(
  "/:id",
  verifyAuthToken,
  authorizePatientAccess,
  validate(schema.updatePatient),
  controller.updatePatient,
);

/**
 * @swagger
 * /v1/patients/{id}:
 *   delete:
 *     summary: Soft-delete a patient (deactivate)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Patient removed successfully.
 */
router.delete(
  "/:id",
  verifyAuthToken,
  authorizePatientAccess,
  controller.deletePatient,
);

module.exports = router;
