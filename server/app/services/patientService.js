const httpStatus = require("http-status").status;
const patientRepository = require("../repositories/patientRepository");
const { userType: userTypeConst } = require("../constant/constant");

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

    const limit = parseInt(pageSize) || 10;

    return {
      error: false,
      data: {
        data: patients,
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

    const patientCode = await patientRepository.getNextPatientCode(hospitalId);

    const newPatient = await patientRepository.createPatient({
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

    return {
      error: false,
      data: { patient: newPatient },
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

module.exports = { getPatients, createPatient, updatePatient, deletePatient };
