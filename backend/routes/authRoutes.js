import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';
import authMiddleware from '../middleware/authMiddleware.js';


const router = express.Router();

// Registracija korisnika
router.post('/register', async (req, res) => {
    console.log('Primljen zahtev za registraciju:', req.body);
    try {
        const { firstName, lastName, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Korisnik već postoji' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            firstName,
            lastName,
            email,
            passwordHash: hashedPassword
        });
        await newUser.save();
        const token = jwt.sign({ id: newUser._id, role: newUser.role }, 'your_jwt_secret', { expiresIn: '1h' });
        console.log('Uspešna registracija!');
        res.status(201).json({ token });
    } catch (error) {
        console.error('GREŠKA PRI REGISTRACIJI:', error);
        res.status(500).json({ message: 'Greška na serveru' });
    }
});

// Login korisnika
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Pogrešni kredencijali' });
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Pogrešni kredencijali' });
        }
        const token = jwt.sign({ id: user._id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Greška na serveru' });
    }
});

router.get('/me', authMiddleware, async (req, res) => {
    console.log('GET /me pozvan! Token:', req.header('Authorization'));
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ message: 'Korisnik nije pronađen' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Greška na serveru' });
    }
});

export default router;