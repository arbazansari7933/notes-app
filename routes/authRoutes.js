import express from "express";
import { signup, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/signup", (req, res) => res.render("signup"));
router.get("/login", (req, res) => res.render("login"));

export default router;
