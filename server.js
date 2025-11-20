import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import "./db.js";
import Note from "./models/notes.js";
const app = express();
const port = 3000;

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// EJS settings
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get('/', async (req, res) => {
    const notes=await Note.find().sort({createdAt:-1});
    res.render("index", {siteName:"Notes app", notes})

});
app.get('/add', async (req, res) => {
   res.render("add");
});

app.post('/add', async (req, res) => {
   const{title, content}=req.body;
   await Note.create({title, content})
   res.redirect("/")

});
app.get('/note/:id', async (req, res) => {
    const id=req.params.id;
    let note=await Note.findById(id);
   res.render("view",{note});
});
app.get('/delete/:id', async (req, res) => {
    const id=req.params.id;
    let note=await Note.findOneAndDelete(id);
   res.redirect("/")
});
app.get('/edit/:id', async (req, res) => {
    const id=req.params.id;
    let note=await Note.findById(id);
    res.render("edit", {note})

});
app.post('/edit/:id', async (req, res) => {
    const id=req.params.id;
   const{title, content}=req.body;
   await Note.findByIdAndUpdate(id, {title, content})
   res.redirect("/")
});
app.post('/search', async (req, res) => { 
   const search=req.body.search;
   let results=await Note.find({title: { $regex: search, $options: "i" }})
   if(!results){
    res.send("No results found")
   }
   res.render("search", {query: search, results})
});
app.listen(port, () => {
    console.log("Server running at http://localhost:" + port);
});
