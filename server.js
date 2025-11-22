import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import "./db.js";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";


import User from "./models/user.js";
import Note from "./models/notes.js";

const app = express();
const port = 3000;

const JWT_SECRET = "arbaz&!@#$%";

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser()); // important for reading token from cookies

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// --------------------- JWT AUTH MIDDLEWARE ---------------------
function auth(req, res, next) {
    const token = req.cookies.token; // read JWT stored in cookie
    if (!token) return res.redirect("/login");

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id; // attach userId to request
        next();
    } catch (error) {
        return res.redirect("/login");
    }
}
// ----------------------------------------------------------------


// ------------------------- SIGNUP -------------------------------
app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
        name,
        email,
        password: hashedPassword
    });

    return res.redirect("/login");
});
// ----------------------------------------------------------------


// -------------------------- LOGIN -------------------------------
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Incorrect password");

    // Create token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
        expiresIn: "1d"
    });

    // Store token inside HttpOnly cookie
    res.cookie("token", token, {
        httpOnly: true,
        secure: false, // change to true if using HTTPS
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    return res.redirect("/");
});
// ----------------------------------------------------------------


// -------------------------- LOGOUT ------------------------------
app.get("/logout", (req, res) => {
    res.clearCookie("token"); // Remove JWT cookie
    res.redirect("/login");
});
// ----------------------------------------------------------------


// ---------------------------- PAGES -----------------------------
app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/login", (req, res) => {
    res.render("login");
});
// ----------------------------------------------------------------


// ---------------------- PROTECTED ROUTES ------------------------
app.get("/", auth, async (req, res) => {
    const notes = await Note.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.render("index", { siteName: "Notes app", notes });
});

app.get("/add", auth, (req, res) => res.render("add"));

app.post("/add", auth, async (req, res) => {
    const { title, content } = req.body;
    await Note.create({ title, content, userId: req.userId });
    res.redirect("/");
});

app.get("/note/:id", auth, async (req, res) => {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    res.render("view", { note });
});

app.get("/delete/:id", auth, async (req, res) => {
    await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.redirect("/");
});

app.get("/edit/:id", auth, async (req, res) => {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    res.render("edit", { note });
});

app.post("/edit/:id", auth, async (req, res) => {
    const { title, content } = req.body;

    await Note.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        { title, content }
    );

    res.redirect("/");
});

app.post("/search", auth, async (req, res) => {
    const search = req.body.search;

    const results = await Note.find({
        userId: req.userId,
        title: { $regex: search, $options: "i" }
    });

    res.render("search", { query: search, results });
});
// ----------------------------------------------------------------


// -------------------------- SERVER ------------------------------
app.listen(port, () => {
    console.log("Server running at http://localhost:" + port);
});
// ----------------------------------------------------------------
