import Note from "../models/notes.js";

// SHOW ALL NOTES
export const getNotes = async (req, res) => {
    const notes = await Note.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.render("index", { siteName: "Notes app", notes });
};

// ADD NEW NOTE
export const addNote = async (req, res) => {
    const { title, content } = req.body;
    await Note.create({
        title,
        content,
        userId: req.userId
    });
    res.redirect("/");
};

// VIEW SINGLE NOTE
export const viewNote = async (req, res) => {
    const note = await Note.findOne({
        _id: req.params.id,
        userId: req.userId
    });
    res.render("view", { note });
};

// DELETE NOTE
export const deleteNote = async (req, res) => {
    await Note.findOneAndDelete({
        _id: req.params.id,
        userId: req.userId
    });
    res.redirect("/");
};

// EDIT NOTE (LOAD PAGE)
export const editNotePage = async (req, res) => {
    const note = await Note.findOne({
        _id: req.params.id,
        userId: req.userId
    });
    res.render("edit", { note });
};

// EDIT NOTE (SAVE CHANGES)
export const editNote = async (req, res) => {
    const { title, content } = req.body;
    await Note.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        { title, content }
    );
    res.redirect("/");
};

// SEARCH NOTES
export const searchNotes = async (req, res) => {
    const search = req.body.search;

    const results = await Note.find({
        userId: req.userId,
        title: { $regex: search, $options: "i" }
    });

    res.render("search", { query: search, results });
};
