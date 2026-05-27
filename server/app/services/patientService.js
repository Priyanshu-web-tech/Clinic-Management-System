const httpStatus = require("http-status").status;
const patientRepository = require("../repositories/patientRepository");
const Visit = require("../models/visit");
const { userType: userTypeConst, visitStatus: visitStatusConst } = require("../constant/constant");

const getPatients = async (req) => {
  try {
    const { page, pageSize, search, gender, bloodGroup } = req.query;
    const currentUser = req.data;

    const filter = { isActive: true };

    if (currentUser.userType !== userTypeConst.ADMIN) {
      filter.hospital = currentUser.hospital?._id;
    }

    if (gender) filter.gender = gender;
    if (bloodGroup) filter.bloodGroup = bloodGroup;

    const { patients, total } = await patientRepository.findPatients({
      filter,
      search,
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 10,
    });

    const patientIds = patients.map((p) => p._id);
    const activeVisits = await Visit.find({
      patient: { $in: patientIds },
      status: { $in: [visitStatusConst.WAITING, visitStatusConst.IN_CONSULTATION] },
    }).select("patient status");

    const activeVisitMap = {};
    activeVisits.forEach((v) => {
      activeVisitMap[String(v.patient)] = v.status;
    });

    const patientsWithStatus = patients.map((p) => ({
      ...p.toObject(),
      activeVisitStatus: activeVisitMap[String(p._id)] ?? null,
    }));

    const limit = parseInt(pageSize) || 10;

    return {
      error: false,
      data: {
        data: patientsWithStatus,
        total,
        page: parseInt(page) || 1,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
      msgCode: "PATIENTS_FETCHED",
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

const createPatient = async (req) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      gender,
      dateOfBirth,
      bloodGroup,
      allergies,
      chronicDiseases,
    } = req.body;
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

    const existing = await patientRepository.findPatientByFingerprint(hospitalId, {
      phone,
      firstName,
      lastName,
      dateOfBirth,
    });

    if (existing && existing.isActive) {
      return {
        error: true,
        data: {},
        msgCode: "PATIENT_ALREADY_EXISTS",
        status: httpStatus.CONFLICT,
      };
    }

    let savedPatient;

    if (existing && !existing.isActive) {
      // Reactivate soft-deleted patient, keep their patientCode and visit history
      savedPatient = await patientRepository.updatePatientById(existing._id, {
        firstName,
        lastName: lastName || "",
        phone,
        gender,
        dateOfBirth,
        bloodGroup: bloodGroup || null,
        allergies: allergies || [],
        chronicDiseases: chronicDiseases || [],
        isActive: true,
      });
    } else {
      const patientCode = await patientRepository.getNextPatientCode(hospitalId);
      savedPatient = await patientRepository.createPatient({
        hospital: hospitalId,
        patientCode,
        firstName,
        lastName: lastName || "",
        phone,
        gender,
        dateOfBirth,
        bloodGroup: bloodGroup || null,
        allergies: allergies || [],
        chronicDiseases: chronicDiseases || [],
        isActive: true,
      });
    }

    return {
      error: false,
      data: { patient: savedPatient },
      msgCode: "PATIENT_CREATED",
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

const updatePatient = async (req) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      phone,
      gender,
      dateOfBirth,
      bloodGroup,
      allergies,
      chronicDiseases,
    } = req.body;
    const currentUser = req.data;

    const target = await patientRepository.findPatientById(id);
    if (!target) {
      return {
        error: true,
        data: {},
        msgCode: "PATIENT_NOT_FOUND",
        status: httpStatus.NOT_FOUND,
      };
    }

    if (
      currentUser.userType !== userTypeConst.ADMIN &&
      String(target.hospital) !== String(currentUser.hospital?._id)
    ) {
      return {
        error: true,
        data: {},
        msgCode: "FORBIDDEN",
        status: httpStatus.FORBIDDEN,
      };
    }

    const duplicate = await patientRepository.findPatientByFingerprint(
      target.hospital,
      { phone, firstName, lastName, dateOfBirth },
      id,
    );

    if (duplicate && duplicate.isActive) {
      return {
        error: true,
        data: {},
        msgCode: "PATIENT_ALREADY_EXISTS",
        status: httpStatus.CONFLICT,
      };
    }

    const updated = await patientRepository.updatePatientById(id, {
      firstName,
      lastName: lastName || "",
      phone,
      gender,
      dateOfBirth,
      bloodGroup: bloodGroup || null,
      allergies: allergies || [],
      chronicDiseases: chronicDiseases || [],
    });

    return {
      error: false,
      data: { patient: updated },
      msgCode: "PATIENT_UPDATED",
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

const deletePatient = async (req) => {
  try {
    const { id } = req.params;
    const currentUser = req.data;

    const target = await patientRepository.findPatientById(id);
    if (!target) {
      return {
        error: true,
        data: {},
        msgCode: "PATIENT_NOT_FOUND",
        status: httpStatus.NOT_FOUND,
      };
    }

    if (
      currentUser.userType !== userTypeConst.ADMIN &&
      String(target.hospital) !== String(currentUser.hospital?._id)
    ) {
      return {
        error: true,
        data: {},
        msgCode: "FORBIDDEN",
        status: httpStatus.FORBIDDEN,
      };
    }

    const activeVisit = await Visit.findOne({
      patient: id,
      hospital: target.hospital,
      status: { $in: [visitStatusConst.WAITING, visitStatusConst.IN_CONSULTATION] },
    });

    if (activeVisit) {
      return {
        error: true,
        data: {},
        msgCode: "PATIENT_HAS_ACTIVE_VISIT",
        status: httpStatus.CONFLICT,
      };
    }

    await patientRepository.updatePatientById(id, { isActive: false });

    return {
      error: false,
      data: {},
      msgCode: "PATIENT_DELETED",
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

const getPatientById = async (req) => {
  try {
    const { id } = req.params;
    const currentUser = req.data;

    const patient = await patientRepository.findPatientById(id);
    if (!patient || !patient.isActive) {
      return {
        error: true,
        data: {},
        msgCode: "PATIENT_NOT_FOUND",
        status: httpStatus.NOT_FOUND,
      };
    }

    if (
      currentUser.userType !== userTypeConst.ADMIN &&
      String(patient.hospital) !== String(currentUser.hospital?._id)
    ) {
      return {
        error: true,
        data: {},
        msgCode: "FORBIDDEN",
        status: httpStatus.FORBIDDEN,
      };
    }

    return {
      error: false,
      data: { patient },
      msgCode: "PATIENT_FETCHED",
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

module.exports = { getPatients, getPatientById, createPatient, updatePatient, deletePatient };
