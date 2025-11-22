import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import "./db.js";
import Note from "./models/notes.js";

//Auth
import bcrypt from "bcrypt";
import User from "./models/user.js";


const app = express();
const port = 3000;

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//Auth middleware
function isLoggedIn(req, res, next) {
    if (!req.session.userId) {
        return res.redirect("/login");
    }
    next();
}



// EJS settings
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


//Auth
import session from "express-session";

app.use(session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: false
}));

app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    // 1. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Save user
    const user = new User({
        name,
        email,
        password: hashedPassword
    });

    await user.save();

    return res.redirect("/login");

});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) return res.send("User not found");

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send("Incorrect password");

    // 3. Create session
    req.session.userId = user._id;

    return res.redirect("/");
    
});

app.get("/notes", isLoggedIn, (req, res) => {
    res.send("Your notes...");
});
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});
app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/login", (req, res) => {
    res.render("login");
});

//
app.get('/', isLoggedIn, async (req, res) => {
    const notes=await Note.find({ userId: req.session.userId }).sort({createdAt:-1});
    res.render("index", {siteName:"Notes app", notes})

});
app.get('/add', isLoggedIn, async (req, res) => {
   res.render("add");
});

app.post('/add', isLoggedIn, async (req, res) => {
   const{title, content}=req.body;
   await Note.create({title, content,userId: req.session.userId})
   res.redirect("/")

});
app.get('/note/:id', isLoggedIn, async (req, res) => {
    const id=req.params.id;
    let note = await Note.findOne({ _id: id, userId: req.session.userId });
   res.render("view",{note});
});
app.get('/delete/:id', isLoggedIn, async (req, res) => {
    const id=req.params.id;
    await Note.findOneAndDelete({ _id: id, userId: req.session.userId });
   res.redirect("/")
});
app.get('/edit/:id', isLoggedIn, async (req, res) => {
    const id=req.params.id;
    let note = await Note.findOne({ _id: id, userId: req.session.userId });
    res.render("edit", {note})

});
app.post('/edit/:id', isLoggedIn, async (req, res) => {
    const id=req.params.id;
   const{title, content}=req.body;
await Note.findOneAndUpdate(
    { _id: id, userId: req.session.userId },
    { title, content }
);

res.redirect("/")
});
app.post('/search', isLoggedIn, async (req, res) => { 
   const search=req.body.search;
   let results=await Note.find({userId: req.session.userId
,title: { $regex: search, $options: "i" }})
   if(!results){
    res.send("No results found")
   }
   res.render("search", {query: search, results})
});
app.listen(port, () => {
    console.log("Server running at http://localhost:" + port);
});
