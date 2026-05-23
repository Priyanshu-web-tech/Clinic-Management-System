const response = require("../response");
const httpStatus = require("http-status").status;

const validate =
  (schema, source = "body") =>
  async (req, res, next) => {
    const data = req[source];
    if (source === "params") {
      for (let value in data) {
        if (Number.isInteger(Number(data[value]))) {
          data[value] = Number(data[value]);
        }
      }
    }
    const { error } = schema.validate(data);
    const valid = error == null;
    if (valid) {
      return next();
    } else {
      const { details } = error;
      const message = details.map((i) => i.message).join(",");
      return response.error(
        req,
        res,
        { msgCode: message },
        httpStatus.BAD_REQUEST
      );
    }
  };

module.exports = {
  validate,
};
