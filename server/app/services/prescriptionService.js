const httpStatus = require("http-status").status;
const mongoose = require("mongoose");
const prescriptionRepository = require("../repositories/prescriptionRepository");
const { userType: userTypeConst } = require("../constant/constant");

const getPrescriptions = async (req) => {
  try {
    const { page, pageSize, date, search, patientId } = req.query;
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
    }

    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.createdAt = { $gte: targetDate, $lt: nextDay };
    }

    if (search) {
      const Patient = require("../models/patient");
      const regex = new RegExp(search, "i");
      const matchingPatients = await Patient.find({
        $or: [{ firstName: regex }, { lastName: regex }, { patientCode: regex }],
      }).select("_id");
      filter.patient = { $in: matchingPatients.map((p) => p._id) };
    }

    const { prescriptions, total } = await prescriptionRepository.findPrescriptions({
      filter,
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20,
    });

    const limit = parseInt(pageSize) || 20;

    return {
      error: false,
      data: {
        data: prescriptions,
        total,
        page: parseInt(page) || 1,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
      msgCode: "PRESCRIPTIONS_FETCHED",
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

module.exports = { getPrescriptions };
