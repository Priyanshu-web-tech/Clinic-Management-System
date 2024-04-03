import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdOpenInNew } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { RiDeleteBinLine } from "react-icons/ri";
import { Alert } from "../utils";

function Notes() {
  const { currentUser } = useSelector((state) => state.user);

  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [prevNotes, setPrevNotes] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const showAlertMessage = (message, duration = 3000) => {
    setAlertMessage(message);
    setShowAlert(true);

    setTimeout(() => {
      setShowAlert(false);
    }, duration);
  };

  useEffect(() => {
    fetchNote();
  }, []);

  const fetchNote = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/notes`, {
        withCredentials: true, // This ensures cookies are sent
      });
      const filteredNotes = response.data.filter((note) => {
        return note.phone === currentUser.phoneNumber;
      });
      setPrevNotes(filteredNotes);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const saveNote = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/notes`,
        {
          content: note,
          phone: currentUser.phoneNumber,
        },
        {
          withCredentials: true, // This ensures cookies are sent
        }
      );
      setSavedNote(note);
      fetchNote();
      showAlertMessage("Note is Saved, You can check it Now!");
      setNote(""); // Clear the note form field
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  const openNoteModal = () => {
    setShowModal(true);
  };

  const closeNoteModal = () => {
    setShowModal(false);
  };

  const deleteNote = (noteId) => {
    axios
      .delete(`${import.meta.env.VITE_BASE_URL}/api/notes/${noteId}`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true 
      })
      .then((response) => {
        if (response.data.acknowledged === true) {
          console.log("Note Deleted Successfully");
          fetchNote();
        }
      })
      .catch((error) => {
        console.error("Error Deleting Note:", error);
      });
  };
  return (
    <div  className="">
      {showAlert && <Alert message={alertMessage} />}
      <h1 className="text-3xl font-bold mb-4">Note</h1>
      <div className="mb-4">
        <textarea
          className="w-full border rounded-md py-2 px-3"
          placeholder="Write your notes..."
          rows={8}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button
          className="bg-pale-white w-full text-dark hover:bg-dark hover:text-pale-white border py-2 px-4 rounded-md hover:bg-gray-800 transition-colors duration-300"
          onClick={saveNote}
        >
          Save
        </button>
        <button
          className="bg-pale-white text-dark p-4 rounded-md border hover:bg-dark hover:text-white transition-colors duration-300"
          onClick={openNoteModal}
        >
          <MdOpenInNew />
        </button>
      </div>
      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
          <div className="border bg-white z-50 p-4 rounded-lg w-96 h-96 overflow-auto">
            <button
              className="bg-dark text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors duration-300"
              onClick={closeNoteModal}
            >
              <IoMdClose />
            </button>
            <div className="mt-4">
              <h2 className="text-3xl font-bold">Notes:</h2>
              <hr />
              {prevNotes.map((note, index) => (
                <div key={index} className="relative">
                  <p className="text-lg my-2 border rounded-md bg-pale-white px-2 py-1">
                    {note.content}
                  </p>
                  <button
                    className="absolute top-0 right-0 mt-1 mr-1 p-1 rounded-full bg-red text-white"
                    onClick={() => deleteNote(note._id)}
                  >
                    <RiDeleteBinLine />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notes;
