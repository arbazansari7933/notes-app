import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export function connectDB(){
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch((err) => console.log("DB Error:", err));
}