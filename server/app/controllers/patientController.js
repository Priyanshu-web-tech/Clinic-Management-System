const { success, error } = require("../response/index");
const patientService = require("../services/patientService");

const getPatients = async (req, res) => {
  try {
    const result = await patientService.getPatients(req);
    if (result.error) throw result;
    return success(
      req,
      res,
      { msgCode: result.msgCode, data: result.data },
      result.status,
    );
  } catch (err) {
    return error(
      req,
      res,
      { msgCode: err.msgCode, data: err.data || {} },
      err.status,
    );
  }
};

const createPatient = async (req, res) => {
  try {
    const result = await patientService.createPatient(req);
    if (result.error) throw result;
    return success(
      req,
      res,
      { msgCode: result.msgCode, data: result.data },
      result.status,
    );
  } catch (err) {
    return error(
      req,
      res,
      { msgCode: err.msgCode, data: err.data || {} },
      err.status,
    );
  }
};

const updatePatient = async (req, res) => {
  try {
    const result = await patientService.updatePatient(req);
    if (result.error) throw result;
    return success(
      req,
      res,
      { msgCode: result.msgCode, data: result.data },
      result.status,
    );
  } catch (err) {
    return error(
      req,
      res,
      { msgCode: err.msgCode, data: err.data || {} },
      err.status,
    );
  }
};

const deletePatient = async (req, res) => {
  try {
    const result = await patientService.deletePatient(req);
    if (result.error) throw result;
    return success(
      req,
      res,
      { msgCode: result.msgCode, data: result.data },
      result.status,
    );
  } catch (err) {
    return error(
      req,
      res,
      { msgCode: err.msgCode, data: err.data || {} },
      err.status,
    );
  }
};

module.exports = { getPatients, createPatient, updatePatient, deletePatient };
