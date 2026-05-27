const httpStatus = require("http-status").status;
const mongoose = require("mongoose");
const { db } = require("../models/index");
const visitRepository = require("../repositories/visitRepository");
const prescriptionRepository = require("../repositories/prescriptionRepository");
const User = require("../models/user");
const { sendVisitSummaryEmail } = require("../utils/visitMailer");
const {
  userType: userTypeConst,
  visitStatus: visitStatusConst,
} = require("../constant/constant");

const getVisits = async (req) => {
  try {
    const { page, pageSize, status, date, doctorId, patientId, search } =
      req.query;
    const currentUser = req.data;

    const hospitalId = currentUser.hospital?._id;
    if (!hospitalId) {
      return {
        error: true,
        data: {},
        msgCode: "HOSPITAL_NOT_FOUND",
        status: httpStatus.BAD_REQUEST,
      };
    }

    const filter = { hospital: hospitalId };

    if (patientId) {
      filter.patient = new mongoose.Types.ObjectId(patientId);
    } else if (currentUser.userType === userTypeConst.DOCTOR) {
      filter.doctor = currentUser._id;
    } else if (doctorId) {
      filter.doctor = doctorId;
    }

    if (status === "active") {
      filter.status = {
        $in: [visitStatusConst.WAITING, visitStatusConst.IN_CONSULTATION],
      };
    } else if (status) {
      filter.status = status;
    }

    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.createdAt = { $gte: targetDate, $lt: nextDay };
    }

    const { visits, total } = await visitRepository.findVisits({
      filter,
      search: search || "",
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20,
      sortByDate: !!patientId,
    });

    const limit = parseInt(pageSize) || 20;

    return {
      error: false,
      data: {
        data: visits,
        total,
        page: parseInt(page) || 1,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
      msgCode: "VISITS_FETCHED",
      status: httpStatus.OK,
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      data: {},
      msgCode: "INTERNAL_SERVER_ERROR",
      status: httpStatus.INTERNAL_SERVER_ERROR,
    };
  }
};

const createVisit = async (req) => {
  try {
    const { patientId, symptoms } = req.body;
    const currentUser = req.data;

    const hospitalId = currentUser.hospital?._id;
    if (!hospitalId) {
      return {
        error: true,
        data: {},
        msgCode: "HOSPITAL_NOT_FOUND",
        status: httpStatus.BAD_REQUEST,
      };
    }

    const existingVisit = await visitRepository.findActiveVisitByPatient(
      patientId,
      hospitalId,
    );
    if (existingVisit) {
      return {
        error: true,
        data: {},
        msgCode: "VISIT_ALREADY_ACTIVE",
        status: httpStatus.CONFLICT,
      };
    }

    const doctor = await User.findOne({
      hospital: hospitalId,
      userType: userTypeConst.DOCTOR,
      isActive: true,
    });
    if (!doctor) {
      return {
        error: true,
        data: {},
        msgCode: "DOCTOR_NOT_FOUND",
        status: httpStatus.BAD_REQUEST,
      };
    }

    const visitNumber = await visitRepository.getNextVisitNumber(hospitalId);
    const tokenNumber = await visitRepository.getNextTokenNumber(hospitalId);

    const newVisit = await visitRepository.createVisit({
      hospital: hospitalId,
      patient: patientId,
      doctor: doctor._id,
      visitNumber,
      tokenNumber,
      symptoms: symptoms || "",
      status: visitStatusConst.WAITING,
      createdBy: currentUser._id,
    });

    const populated = await visitRepository.findVisitById(newVisit._id);

    return {
      error: false,
      data: { visit: populated },
      msgCode: "VISIT_CREATED",
      status: httpStatus.CREATED,
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      data: {},
      msgCode: "INTERNAL_SERVER_ERROR",
      status: httpStatus.INTERNAL_SERVER_ERROR,
    };
  }
};

const updateVisitStatus = async (req) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const currentUser = req.data;

    const visit = await visitRepository.findVisitById(id);
    if (!visit) {
      return {
        error: true,
        data: {},
        msgCode: "VISIT_NOT_FOUND",
        status: httpStatus.NOT_FOUND,
      };
    }

    if (String(visit.hospital) !== String(currentUser.hospital?._id)) {
      return {
        error: true,
        data: {},
        msgCode: "FORBIDDEN",
        status: httpStatus.FORBIDDEN,
      };
    }

    if (
      currentUser.userType === userTypeConst.DOCTOR &&
      String(visit.doctor._id) !== String(currentUser._id)
    ) {
      return {
        error: true,
        data: {},
        msgCode: "FORBIDDEN",
        status: httpStatus.FORBIDDEN,
      };
    }

    const validTransitions = {
      [visitStatusConst.WAITING]: [
        visitStatusConst.IN_CONSULTATION,
        visitStatusConst.CANCELLED,
      ],
      [visitStatusConst.IN_CONSULTATION]: [
        visitStatusConst.COMPLETED,
        visitStatusConst.CANCELLED,
      ],
    };

    if (!validTransitions[visit.status]?.includes(status)) {
      return {
        error: true,
        data: {},
        msgCode: "INVALID_STATUS_TRANSITION",
        status: httpStatus.BAD_REQUEST,
      };
    }

    if (status === visitStatusConst.IN_CONSULTATION) {
      const ongoing = await visitRepository.findActiveConsultationByDoctor(
        visit.doctor._id,
        id,
      );
      if (ongoing) {
        return {
          error: true,
          data: {},
          msgCode: "DOCTOR_ALREADY_IN_CONSULTATION",
          status: httpStatus.CONFLICT,
        };
      }
    }

    const updateData = { status };
    if (
      status === visitStatusConst.COMPLETED ||
      status === visitStatusConst.CANCELLED
    ) {
      updateData.closedAt = new Date();
    }

    const updated = await visitRepository.updateVisitById(id, updateData);

    return {
      error: false,
      data: { visit: updated },
      msgCode: "VISIT_UPDATED",
      status: httpStatus.OK,
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      data: {},
      msgCode: "INTERNAL_SERVER_ERROR",
      status: httpStatus.INTERNAL_SERVER_ERROR,
    };
  }
};

const getVisitById = async (req) => {
  try {
    const { id } = req.params;
    const currentUser = req.data;

    const visit = await visitRepository.findVisitById(id);
    if (!visit) {
      return {
        error: true,
        data: {},
        msgCode: "VISIT_NOT_FOUND",
        status: httpStatus.NOT_FOUND,
      };
    }

    if (String(visit.hospital) !== String(currentUser.hospital?._id)) {
      return {
        error: true,
        data: {},
        msgCode: "FORBIDDEN",
        status: httpStatus.FORBIDDEN,
      };
    }

    return {
      error: false,
      data: { visit },
      msgCode: "VISIT_FETCHED",
      status: httpStatus.OK,
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      data: {},
      msgCode: "INTERNAL_SERVER_ERROR",
      status: httpStatus.INTERNAL_SERVER_ERROR,
    };
  }
};

const updateVisit = async (req) => {
  const transaction = await db.transaction();
  try {
    const { id } = req.params;
    const { symptoms, diagnosis, followUpDate, status, medicines } = req.body;
    const currentUser = req.data;

    const visit = await visitRepository.findVisitById(id);
    if (!visit) {
      return {
        error: true,
        data: {},
        msgCode: "VISIT_NOT_FOUND",
        status: httpStatus.NOT_FOUND,
        transaction,
      };
    }

    if (String(visit.hospital) !== String(currentUser.hospital?._id)) {
      return {
        error: true,
        data: {},
        msgCode: "FORBIDDEN",
        status: httpStatus.FORBIDDEN,
        transaction,
      };
    }

    if (
      currentUser.userType === userTypeConst.DOCTOR &&
      String(visit.doctor._id) !== String(currentUser._id)
    ) {
      return {
        error: true,
        data: {},
        msgCode: "FORBIDDEN",
        status: httpStatus.FORBIDDEN,
        transaction,
      };
    }

    const updateData = {
      symptoms: symptoms ?? visit.symptoms,
      diagnosis: diagnosis ?? visit.diagnosis,
      followUpDate:
        followUpDate !== undefined ? followUpDate : visit.followUpDate,
    };

    if (status) {
      const validTransitions = {
        [visitStatusConst.WAITING]: [
          visitStatusConst.IN_CONSULTATION,
          visitStatusConst.CANCELLED,
        ],
        [visitStatusConst.IN_CONSULTATION]: [
          visitStatusConst.COMPLETED,
          visitStatusConst.CANCELLED,
        ],
      };

      if (!validTransitions[visit.status]?.includes(status)) {
        return {
          error: true,
          data: {},
          msgCode: "INVALID_STATUS_TRANSITION",
          status: httpStatus.BAD_REQUEST,
          transaction,
        };
      }

      updateData.status = status;
      if (
        status === visitStatusConst.COMPLETED ||
        status === visitStatusConst.CANCELLED
      ) {
        updateData.closedAt = new Date();
      }
    }

    const savePrescription =
      status === visitStatusConst.COMPLETED &&
      medicines &&
      medicines.length > 0;

    if (savePrescription) {
      const invalidMedicine = medicines.find(
        (m) =>
          !m.frequency ||
          (m.frequency.morning === 0 &&
            m.frequency.afternoon === 0 &&
            m.frequency.night === 0),
      );
      if (invalidMedicine) {
        return {
          error: true,
          data: {},
          msgCode: "MEDICINE_FREQUENCY_REQUIRED",
          status: httpStatus.BAD_REQUEST,
          transaction,
        };
      }
    }

    const updated = await visitRepository.updateVisitById(
      id,
      updateData,
      transaction,
    );

    if (savePrescription) {
      const prescription = await prescriptionRepository.upsertPrescription(
        {
          hospital: visit.hospital,
          visit: visit._id,
          patient: visit.patient._id,
          doctor: visit.doctor._id,
        },
        transaction,
      );
      await prescriptionRepository.replaceMedicines(
        prescription._id,
        medicines,
        transaction,
      );

      sendVisitSummaryEmail(
        { ...visit, diagnosis: updateData.diagnosis, symptoms: updateData.symptoms, followUpDate: updateData.followUpDate },
        medicines,
      );
    }

    return {
      error: false,
      data: { visit: updated },
      msgCode: "VISIT_UPDATED",
      status: httpStatus.OK,
      transaction,
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      data: {},
      msgCode: "INTERNAL_SERVER_ERROR",
      status: httpStatus.INTERNAL_SERVER_ERROR,
      transaction,
    };
  }
};

module.exports = {
  getVisits,
  createVisit,
  updateVisitStatus,
  getVisitById,
  updateVisit,
};
