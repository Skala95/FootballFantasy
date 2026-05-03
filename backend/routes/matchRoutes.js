import express from 'express';
import { Match } from '../models/matchModel.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { calculateFantasyPoints, updatePlayerStats } from '../utils/fantasyPoints.js';

const router = express.Router();

//Get - dohvatanje svih mečeva
router.get('/', async (req, res) => {
    try {
        const matches = await Match.find()
            .populate('team1')
            .populate('team2')
            .populate('stats.player');
        res.status(200).json(matches);
    } catch (error) {
        res.status(500).json({ message: 'Greska na serveru' });
    }
});

// Post - kreiranje novog termina
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {date, season, team1, team2} = req.body;

        const matchDate = new Date(date);
        const registrationDeadline = new Date(matchDate.getTime() - 15 * 60 * 1000);

        const seasonStr = String(season);
        const lastMatch = await Match.findOne({ season: seasonStr }).sort({ matchNumber: -1 });
        const nextMatchNumber = lastMatch ? lastMatch.matchNumber + 1 : 1;

        const newMatch = new Match({date: matchDate, registrationDeadline, season: seasonStr, matchNumber: nextMatchNumber, team1, team2});
        await newMatch.save();
        res.status(201).json(newMatch);
    } catch (error) {
        if (error.code === 11000) {
        return res.status(400).json({ message: 'Termin sa tim brojem već postoji za tu sezonu.' });
    }
        res.status(500).json({ message: 'Greška na serveru' });
    }
});

// Put - azuriranje termina
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const oldMatch = await Match.findById(req.params.id);
        if (!oldMatch) return res.status(404).json({ message: 'Termin nije pronađen' });
        const wasFinished = oldMatch.status === 'finished';

        console.log('wasFinished:', wasFinished, '| req.body.status:', req.body.status);

        const match = await Match.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' })
            .populate('team1')
            .populate('team2')
            .populate('stats.player');
            
        if (match.status === 'finished' && !wasFinished) {
            await calculateFantasyPoints(match);
            await updatePlayerStats(match);
        }

        res.status(200).json(match);
    } catch (error) {
        res.status(500).json({ message: 'Greška na serveru' });
    }
});

// Put - promeni status termina
router.put('/:id/status', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const match = await Match.findByIdAndUpdate(
            req.params.id,
            { status },
            { returnDocument: 'after' }
        );
        if (!match) return res.status(404).json({ message: 'Termin nije pronadjen' });
        res.status(200).json(match);
    } catch (error) {
        res.status(500).json({ message: 'Greska na serveru' });
    }
});

// Delete - brisanje termina
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const match = await Match.findByIdAndDelete(req.params.id);
        if (!match) return res.status(404).json({ message: 'Termin nije pronadjen' });
        res.status(200).json({ message: 'Termin obrisan' });
    } catch (error) {
        res.status(500).json({ message: 'Greska na serveru' });
    }
});

// Get - dohvati termine po sezoni
router.get('/season/:season', async (req, res) => {
    try {
        const matches = await Match.find({ season: req.params.season })
            .populate('team1')
            .populate('team2');
        res.status(200).json(matches);
    } catch (error) {
        res.status(500).json({ message: 'Greska na serveru' });
    }
});


export default router;