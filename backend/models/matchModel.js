import mongoose from "mongoose";

const statScheme = new mongoose.Schema({
    player : { type: mongoose.Schema.Types.ObjectId, ref: 'Player' , required: true },
    stats: { type: String, enum: ['goal', 'assist', 'ownGoal'] }
});

const matchSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    season: { type: String, required: true },
    matchNumber: { type: Number, required: true },
    team1: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
    team2: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
    stats: [statScheme],
    status: { type: String, enum: ['open', 'closed', 'finished'], default: 'open' }
});

matchSchema.index({ season: 1, matchNumber: 1 }, { unique: true });

export const Match = mongoose.model('Match', matchSchema);