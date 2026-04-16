import mongoose from "mongoose";

const userMessageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.model("UserMessage", userMessageSchema);