import express from "express";
const router = express.Router();
import { createNote, deleteNote, getAllNotes } from "../controllers/noteController.js";

router.get("/", getAllNotes);
router.post("/", createNote);
router.delete("/:id", deleteNote);

export default router;