import Reception from "../models/Reception.js";
import bcryptjs from "bcryptjs";

export const updateReception = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return res.json({
      statusCode: 401,
      success: false,
      message: "You can only update your own account!",
    });
  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedReception = await Reception.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: req.body.name,
          phoneNumber: req.body.phoneNumber,
          password: req.body.password,
        },
      },
      { new: true }
    );

    const { password, ...rest } = updatedReception._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteReception = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return res.json({
      statusCode: 401,
      success: false,
      message: "You can only delete your own account!",
    });

  try {
    await Reception.findByIdAndDelete(req.params.id);
    res.clearCookie("access_token");
    res.clearCookie("access_token_hospital");
    res.status(200).json("User has been deleted!");
  } catch (error) {
    next(error);
  }
};
