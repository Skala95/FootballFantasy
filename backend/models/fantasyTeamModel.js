import mongoose from "mongoose";

const fantasyTeamSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    selectedPlayers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }] ,
    playerPoints: [{ player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }, points: { type: Number, default: 0 } }],
    captain: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    totalPoints: { type: Number, default: 0 }
}, {
    timestamps: true
});

export const FantasyTeam = mongoose.model('FantasyTeam', fantasyTeamSchema);