import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token)
    return res.json({
      statusCode: 401,
      success: false,
      message: "Unauth Access!",
    });

  jwt.verify(token, process.env.JWT_KEY, (err, user) => {
    if (err)
      return res.json({
        statusCode: 403,
        success: false,
        message: "Forbidden!",
      });

    req.user = user;
    next();
  });
};

