import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash : { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, {
    timestamps: true //Automatski dodaje createdAt i updatedAt polja
});


export const User = mongoose.model('User', userSchema);