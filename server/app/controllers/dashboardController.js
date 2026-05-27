const { success, error } = require("../response/index");
const dashboardService = require("../services/dashboardService");

const getStats = async (req, res) => {
  try {
    const result = await dashboardService.getStats(req);
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

module.exports = { getStats };
