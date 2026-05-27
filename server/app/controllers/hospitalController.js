const { success, error } = require("../response/index");
const hospitalService = require("../services/hospitalService");

const updateHospital = async (req, res) => {
  try {
    const result = await hospitalService.updateHospital(req);

    if (result.error) {
      throw result;
    }

    return success(
      req,
      res,
      { msgCode: result.msgCode, data: result.data },
      result.status,
      result.transaction,
    );
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

module.exports = { updateHospital };
