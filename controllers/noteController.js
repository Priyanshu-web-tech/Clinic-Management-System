import Note from "../models/Note.js";

export const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createNote = async (req, res) => {
  const { content, phone } = req.body;
  try {
    const note = new Note({ content, phone });
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    const response = {
      acknowledged: true,
      message: "Note has been deleted!",
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
