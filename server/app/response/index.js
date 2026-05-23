const httpStatus = require("http-status");
const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);
const { getLoggingMethod } = require("../utils/getLoggingMethod");
const { loggerToConsole, loggerToFile } = require("../utils/logger");

const lngMsg = {};
fs.readdirSync(path.join(__dirname, "lng"))
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-5) === ".json"
    );
  })
  .forEach((file) => {
    const fileName = file.slice(0, -5);
    const lng = require(path.join(__dirname, "lng", file));
    lngMsg[fileName] = lng;
  });

exports.success = async (req, res, result, code, dbTrans) => {
  const lng = req.headers["accept-language"] || "en";
  try {
    const response = {
      success: true,
      status_code: code,
      message:
        (lngMsg[lng]
          ? lngMsg[lng][result.msgCode]
          : lngMsg["en"][result.msgCode]) || httpStatus[code],
      result: result.data ? result.data : {},
      time: Date.now(),
    };

    if (dbTrans !== undefined) {
      await dbTrans.commit();
    }
    return res.status(code).json(response);
  } catch (error) {
    const logLevel = getLoggingMethod(error.status);
    loggerToConsole[logLevel](JSON.stringify(error));
    loggerToFile[logLevel](JSON.stringify(error));

    if (dbTrans !== undefined) {
      await dbTrans.rollback();
    }
    return res.json({
      success: false,
      status_code: httpStatus.status.INTERNAL_SERVER_ERROR,
      message: lngMsg[lng]
        ? lngMsg[lng]["INTERNAL_SERVER_ERROR"]
        : lngMsg["en"]["INTERNAL_SERVER_ERROR"],
      result: {},
      time: Date.now(),
    });
  }
};

exports.error = async (req, res, error, code, dbTrans) => {
  const lng = req.headers["accept-language"] || "en";
  try {
    //logging crash
    const logLevel = getLoggingMethod(code);
    const data = {
      endPoint: req.originalUrl,
      req: req.body,
      error: error,
      status: code,
    };
    loggerToConsole[logLevel](JSON.stringify(data));
    loggerToFile[logLevel](JSON.stringify(data));
    if (error.msgCode.includes("temporarily locked")) {
      const response = {
        success: false,
        status_code: code,
        message: error.msgCode,
        result: error.data ? error.data : {},
        time: Date.now(),
      };
      if (dbTrans !== undefined) {
        await dbTrans.rollback();
      }
      return res.status(code).json(response);
    } else {
      const response = {
        success: false,
        status_code: code,
        message:
          (lngMsg[lng]
            ? lngMsg[lng][error.msgCode]
            : lngMsg["en"][error.msgCode]) || httpStatus[code],
        result: error.data ? error.data : {},
        time: Date.now(),
      };
      if (dbTrans !== undefined) {
        await dbTrans.rollback();
      }
      return res.status(code).json(response);
    }
  } catch (err) {
    if (dbTrans !== undefined) {
      await dbTrans.rollback();
    }
    const logLevel = getLoggingMethod(err.status);
    loggerToConsole[logLevel](JSON.stringify(err));
    loggerToFile[logLevel](JSON.stringify(err));
    
    return res.status(500).json({
      success: false,
      status_code: httpStatus.status.INTERNAL_SERVER_ERROR,
      message: lngMsg[lng]
        ? lngMsg[lng]["INTERNAL_SERVER_ERROR"]
        : lngMsg["en"]["INTERNAL_SERVER_ERROR"],
      result: {},
      time: Date.now(),
    });
  }
};
