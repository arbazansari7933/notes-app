import express from "express";
import { auth } from "../middleware/auth.js";

import {
    getNotes,
    addNote,
    viewNote,
    deleteNote,
    editNotePage,
    editNote,
    searchNotes
} from "../controllers/notesController.js";

const router = express.Router();

// Homepage - show notes
router.get("/", auth, getNotes);

// Add note page
router.get("/add", auth, (req, res) => res.render("add"));

// Add note (save)
router.post("/add", auth, addNote);

// View single note
router.get("/note/:id", auth, viewNote);

// Delete note
router.get("/delete/:id", auth, deleteNote);

// Edit page
router.get("/edit/:id", auth, editNotePage);

// Save edited note
router.post("/edit/:id", auth, editNote);

// Search notes
router.post("/search", auth, searchNotes);

export default router;
