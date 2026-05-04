import express from "express";
import {FantasyTeam} from '../models/fantasyTeamModel.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { Match } from "../models/matchModel.js";

const router = express.Router();

// POST Kreiranje fantazi tima
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { matchId, selectedPlayers, captain } = req.body;
        const match = await Match.findById(matchId);
        if (!match) return res.status(404).json({ message: 'Termin nije pronađen' });
        if (match.status !== 'open') return res.status(400).json({ message: 'Prijave za termin su gotove' });

        // Proverava da li je korisnik admin
        if (req.user.role === 'admin') {
            return res.status(403).json({ message: 'Administratori ne mogu prijavljivati fantasy timove' });
        }

        // Provera da li je rok za prijavu istekao
        if(new Date() > new Date(match.registrationDeadline)) {
            return res.status(400).json({ message: 'Rok za prijavu je istekao' });
        }

        // Proveri da li je korisnik već kreirao fantazi tim za ovaj termin
        const existingTeam = await FantasyTeam.findOne({ user: req.user.id, match: matchId });
        if (existingTeam) {
            return res.status(400).json({ message: 'Korisnik je već kreirao fantazi tim za ovaj termin' });
        }

        // Proverava da li je izabrano 6 igrača
        if (selectedPlayers.length !== 6) {
            return res.status(400).json({ message: 'Morate izabrati tačno 6 igrača' });
        }   

        // Proverava da li je kapiten među izabranim igračima
        if (!selectedPlayers.includes(captain)) {
            return res.status(400).json({ message: 'Kapiten mora biti među izabranim igračima' });
        }

        

        // Kreiranje fantazi tima
        const fantasyTeam = new FantasyTeam({
            user: req.user.id,
            match: matchId,
            selectedPlayers: selectedPlayers,
            captain
        });

        await fantasyTeam.save();
        res.status(201).json(fantasyTeam);

    } catch (error) {
        res.status(500).json({ message: 'Greška prilikom kreiranja fantazi tima' });
    }
});

// GET leaderboard
router.get('/leaderboard', authMiddleware, async (req, res) => {
    try {
        const { User } = await import('../models/userModel.js');
        const users = await User.find({ role: { $ne: 'admin' } }).select('firstName lastName');
        const teams = await FantasyTeam.find().populate('user', 'firstName lastName').populate('match', 'season matchNumber status');
 
        const userMap = {};
        teams .forEach(team => {    
            if(team.match?.status !== 'finished') return; 
                const userId = team.user._id.toString();
            if (!userMap[userId]) {
                userMap[userId] = {
                    totalPoints: 0,
                    matchCount: 0,
                };
            }   
            userMap[userId].totalPoints += team.totalPoints;
            userMap[userId].matchCount += 1;
        });

        const leaderboard = users.map(u => {
            const data = userMap[u._id.toString()];
            return {
                userId: u._id,
                firstName: u.firstName,
                lastName: u.lastName,
                totalPoints: data?.totalPoints || 0,
                matchCount: data?.matchCount || 0,
                averagePoints: data ? +(data.totalPoints / data.matchCount).toFixed(2) : 0
            };
        }).sort((a, b) => b.totalPoints - a.totalPoints);
        res.status(200).json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: 'Greška prilikom dohvatanja leaderboarda' });
    }
});

// GET dohvatanje fantazi timove ulogovanog korisnika
router.get('/:matchId', authMiddleware, async (req, res) => {
    try {
        const fantasyTeam = await FantasyTeam.findOne({ user: req.user.id, match: req.params.matchId })
            .populate('match')
            .populate('selectedPlayers')
            .populate('captain');
        res.status(200).json(fantasyTeam);
    } catch (error) {
        res.status(500).json({ message: 'Greška prilikom dohvatanja fantazi tima' });
    }
});

// PUT azuriranje fantazi tima
router.put('/:id', authMiddleware, async (req, res) => {
    try {  
        const { selectedPlayers, captain } = req.body;
        const userId = req.user.id;

        const fantasyTeam = await FantasyTeam.findById(req.params.id);
        if (!fantasyTeam) return res.status(404).json({ message: 'Tim nije pronađen' });
        if (fantasyTeam.user.toString() !== userId) return res.status(403).json({ message: 'Nemate dozvolu da menjate ovaj fantazi tim' });
   
    
        const match = await Match.findById(fantasyTeam.match);
        if (!match) return res.status(404).json({ message: 'Termin nije pronađen' });
        if (match.status !== 'open') return res.status(400).json({ message: 'Prijave za termin su gotove' });
    
    
        // Provera da li je rok za prijavu istekao
        if(new Date() > new Date(match.registrationDeadline)) {
            return res.status(400).json({ message: 'Rok za prijavu je istekao' });
        }   

        // Proverava da li je izabrano 6 igrača
        if (selectedPlayers.length !== 6) {
            return res.status(400).json({ message: 'Morate izabrati tačno 6 igrača' });
        }

        // Proverava da li je kapiten izabran
        if (!selectedPlayers.includes(captain)) {
            return res.status(400).json({ message: 'Kapiten mora biti među izabranim igračima' });
        }

        // Ažuriranje fantazi tima
        fantasyTeam.selectedPlayers = selectedPlayers;
        fantasyTeam.captain = captain;
        await fantasyTeam.save();
        res.status(200).json(fantasyTeam);

    } catch (error) {
        res.status(500).json({ message: 'Greška prilikom ažuriranja fantazi tima' });
    }
});

export default router;