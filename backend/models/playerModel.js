import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    nickname: { type: String, required: true, unique: true },
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    ownGoals: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    appearances: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    matchStats: [{
        match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
        goals: { type: Number, default: 0 },
        assists: { type: Number, default: 0 },
        ownGoals: { type: Number, default: 0 },
        win: { type: Number, default: 0 },
        loss: { type: Number, default: 0 },
        draw: { type: Number, default: 0 },
        points: { type: Number, default: 0 }
    }]
});

export const Player = mongoose.model("Player", playerSchema);
