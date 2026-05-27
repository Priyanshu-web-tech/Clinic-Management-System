const httpStatus = require("http-status").status;

const { db } = require("../models/index");
const hospitalRepository = require("../repositories/hospitalRepository");

const updateHospital = async (req) => {
  const transaction = await db.transaction();
  try {
    const { name, address } = req.body;
    const hospitalId = req.data.hospital?._id;

    if (!hospitalId) {
      return {
        error: true,
        data: {},
        msgCode: "HOSPITAL_NOT_FOUND",
        status: httpStatus.NOT_FOUND,
        transaction,
      };
    }

    const updateData = { name };
    if (address !== undefined) updateData.address = address;

    await hospitalRepository.updateHospital(updateData, { _id: hospitalId }, transaction);

    const updated = await hospitalRepository.findById(hospitalId, "name address", transaction);

    return {
      error: false,
      data: {
        hospital: {
          _id: updated._id,
          name: updated.name,
          address: updated.address,
        },
      },
      msgCode: "HOSPITAL_UPDATED",
      status: httpStatus.OK,
      transaction,
    };
  } catch (err) {
    console.log(err);
    if (err.code === 11000 && err.keyPattern?.name) {
      return {
        error: true,
        data: {},
        msgCode: "HOSPITAL_ALREADY_EXISTS",
        status: httpStatus.CONFLICT,
        transaction,
      };
    }
    return {
      error: true,
      data: err,
      msgCode: "INTERNAL_SERVER_ERROR",
      status: httpStatus.INTERNAL_SERVER_ERROR,
      transaction,
    };
  }
};

module.exports = { updateHospital };
