import express from 'express';
import {Player} from '../models/playerModel.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

//Get - Dohvati sve igrace
router.get('/', async (req, res) => {
    try {
        const players = await Player.find();
        res.status(200).json(players);
    } catch (error) {
        res.status(500).json({ message: 'Greska na serveru' });
    }
});

//Post - Dodaj novog igraca 
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {firstName, lastName, nickname} = req.body;
        const newPlayer = new Player({ firstName, lastName, nickname });
        await newPlayer.save();
        res.status(201).json(newPlayer);
    } catch (error) {
        res.status(500).json({ message: 'Greska na serveru' });
    }
});

//Put - AZuriraj igraca
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const player = await Player.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
        if (!player) {
            return res.status(404).json({ message: 'Igrac nije pronadjen' });
        }         
        res.status(200).json(player);
    } catch (error) {
        res.status(500).json({ message: 'Greska na serveru' });
    }
});

//Delete - Obrisi igraca
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const player = await Player.findByIdAndDelete(req.params.id);
        if (!player) {
            return res.status(404).json({ message: 'Igrac nije pronadjen' });
        }
        res.status(200).json({ message: 'Igrac je obrisan' });
    } catch (error) {
        res.status(500).json({ message: 'Greska na serveru' });
    }
});
export default router;