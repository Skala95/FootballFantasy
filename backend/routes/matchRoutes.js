import express from 'express';
import { Match } from '../models/matchModel.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { calculateFantasyPoints, updatePlayerStats , recalculateStats, removeMatchStats} from '../utils/fantasyPoints.js';

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
        if (registrationDeadline <= new Date()) {
            return res.status(400).json({ message: 'Datum termina mora biti najmanje 15 minuta u budućnosti.' });
        }

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

        if (req.body.stats) {
            const team1Ids = new Set((req.body.team1 || oldMatch.team1).map(id => id.toString()));
            const team2Ids = new Set((req.body.team2 || oldMatch.team2).map(id => id.toString()));

            let team1Goals = 0, team1Assists = 0, team2Goals = 0, team2Assists = 0;

            for (const s of req.body.stats) {
                const pid = s.player.toString();
                if (team1Ids.has(pid)) {
                    if (s.stats === 'goal') team1Goals++;
                    else if (s.stats === 'assist') team1Assists++;
                } else if (team2Ids.has(pid)) {
                    if (s.stats === 'goal') team2Goals++;
                    else if (s.stats === 'assist') team2Assists++;
                }
            }

            if (team1Assists > team1Goals)
                return res.status(400).json({ message: 'Tim 1: broj asistencija ne može biti veći od broja golova.' });
            if (team2Assists > team2Goals)
                return res.status(400).json({ message: 'Tim 2: broj asistencija ne može biti veći od broja golova.' });
        }

        console.log('wasFinished:', wasFinished, '| req.body.status:', req.body.status);

        const match = await Match.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' })
            .populate('team1')
            .populate('team2')
            .populate('stats.player');
            
        if (match.status === 'finished' && !wasFinished) {
            await calculateFantasyPoints(match);
            await updatePlayerStats(match);
        }
        else if(match.status == 'finished' && wasFinished){
            await recalculateStats(match);
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
        res.status(500).json({ message: 'Greška na serveru' });
    }
});

// Delete - brisanje termina
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const match = await Match.findById(req.params.id)
            .populate('team1')
            .populate('team2')
            .populate('stats.player');
        if (!match) return res.status(404).json({ message: 'Termin nije pronadjen' });

        await removeMatchStats(match);
        await Match.findByIdAndDelete(req.params.id);

        // Smanji matchNumber za 1 svim narednim terminima u istoj sezoni
        const laterMatches = await Match.find({
            season: match.season,
            matchNumber: { $gt: match.matchNumber }
        }).sort({ matchNumber: 1 }); 

        for (const m of laterMatches) {
            m.matchNumber -= 1;
            await m.save();
        }

        res.status(200).json({ message: 'Termin obrisan' });
    } catch (error) {
        res.status(500).json({ message: 'Greška na serveru' });
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