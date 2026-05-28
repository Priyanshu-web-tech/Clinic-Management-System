const { success, error } = require("../response/index");
const visitService = require("../services/visitService");
const { broadcastVisitUpdate } = require("../utils/sseManager");

const getVisits = async (req, res) => {
  try {
    const result = await visitService.getVisits(req);
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

const createVisit = async (req, res) => {
  try {
    const result = await visitService.createVisit(req);
    if (result.error) throw result;
    await success(
      req,
      res,
      { msgCode: result.msgCode, data: result.data },
      result.status,
    );
    broadcastVisitUpdate(req.data?.hospital?._id);
  } catch (err) {
    return error(
      req,
      res,
      { msgCode: err.msgCode, data: err.data || {} },
      err.status,
    );
  }
};

const updateVisitStatus = async (req, res) => {
  try {
    const result = await visitService.updateVisitStatus(req);
    if (result.error) throw result;
    await success(
      req,
      res,
      { msgCode: result.msgCode, data: result.data },
      result.status,
    );
    broadcastVisitUpdate(req.data?.hospital?._id);
  } catch (err) {
    return error(
      req,
      res,
      { msgCode: err.msgCode, data: err.data || {} },
      err.status,
    );
  }
};

const getVisitById = async (req, res) => {
  try {
    const result = await visitService.getVisitById(req);
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

const updateVisit = async (req, res) => {
  try {
    const result = await visitService.updateVisit(req);
    if (result.error) throw result;
    // success() commits the transaction before returning
    await success(
      req,
      res,
      { msgCode: result.msgCode, data: result.data },
      result.status,
      result.transaction,
    );
    broadcastVisitUpdate(req.data?.hospital?._id);
  } catch (err) {
    return error(
      req,
      res,
      { msgCode: err.msgCode, data: err.data || {} },
      err.status,
      err.transaction,
    );
  }
};

const cancelUnattendedVisits = async (req, res) => {
  try {
    const result = await visitService.cancelUnattendedVisits();
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

module.exports = { getVisits, createVisit, updateVisitStatus, getVisitById, updateVisit, cancelUnattendedVisits };
