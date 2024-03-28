import ReceptionModel from "../models/Reception.js";
import HospitalModel from "../models/Hospitals.js";
import bcryptjs from "bcryptjs";                    
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
  const { name, phoneNumber, password,userRole,hospitalName } = req.body;
  const hashedPass = bcryptjs.hashSync(password, 10);
  const newUser = new ReceptionModel({ name, phoneNumber, password: hashedPass,userRole,hospitalName });

  try {
    await newUser.save();
    res.status(201).json("User created");
  } catch (e) {
    next(e);
  }
};

export const signin = async (req, res, next) => {
  const { phoneNumber, password, hospitalName } = req.body;

  try {
    const validUser = await ReceptionModel.findOne({ phoneNumber });

    if (!validUser) {
      return next(errorHandler(401, "User not found"));
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);

    if (!validPassword) {
      return next(errorHandler(401, "Wrong Creds!"));
    }

    // Check if hospitalName matches
    if (validUser.hospitalName !== hospitalName) {
      return next(errorHandler(401, "Hospital name does not match"));
    }

    const token = jwt.sign({ id: validUser._id }, "mern");

    const { password: pass, ...rest } = validUser._doc;
    res
      .cookie("access_token", token, { httpOnly: true })
      .status(200)
      .json(rest);
  } catch (e) {
    next(e);
  }
};


export const signOut = async (req, res, next) => {
  try {
    res.clearCookie("access_token");
    res.status(200).json("Signed Out");
  } catch (error) {
    next(error);
  }
};

export const signinHospital = async (req, res, next) => {
  const { name, accessCode } = req.body;

  try {
    const validHospital = await HospitalModel.findOne({ name });
    

    if (!validHospital) {
      return next(errorHandler(401, "Hospital not Listed"));
    }

    const validPassword = validHospital.accessCode ===accessCode;

    if (!validPassword) {
      return next(errorHandler(401, "Wrong Creds!"));
    }

    const token = jwt.sign({ id: validHospital._id }, "mern");

    const { accessCode: pass, ...rest } = validHospital._doc;
    res
      .cookie("access_token_hospital", token, { httpOnly: true })
      .status(200)
      .json(rest);
  } catch (e) {
    next(e);
  }
};

export const getHospitals = async (req, res,next) => {
  
  try {
    const users = await HospitalModel.find();
    if (!users) {
      return next(errorHandler(404, "Users not found!"));
    }
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const signOutHospital = async (req, res, next) => {
  try {
    res.clearCookie("access_token_hospital");
    res.status(200).json("Signed Out");
  } catch (error) {
    next(error);
  }
};