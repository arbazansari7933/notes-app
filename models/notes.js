import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    title: String,
    content: String,
    userId: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("Note", noteSchema);
