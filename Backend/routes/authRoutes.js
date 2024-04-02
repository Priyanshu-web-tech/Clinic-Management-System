import express from "express";
import { signup, signin,signOut,signinHospital, getHospitals, signOutHospital} from "../controllers/authController.js";
const router = express.Router();
router.post("/register", signup);
router.post("/login", signin);
router.get('/signout', signOut);

router.post("/loginHospital", signinHospital);
router.get("/getHospitals", getHospitals);
router.get('/signoutHospital', signOutHospital);


export default router;