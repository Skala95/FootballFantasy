import {BACKEND_PORT, MongoDB_URL} from'./config.js';

import mongoose from 'mongoose';
import express from 'express'; 
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import playerRoutes from './routes/playerRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import fantasyTeamRoutes from './routes/fantasyTeamRoutes.js';
import cron from 'node-cron';
import {Match} from './models/matchModel.js';


const app = express();

app.get('/', (request, response) => {
    console.log(request);
    return response.status(234).send('Hello World!');
});


app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/fantasy-teams', fantasyTeamRoutes);

mongoose.connect(MongoDB_URL)
    .then(() => {
        console.log('Connected to MongoDB');

        cron.schedule('* * * * *', async () => {
            console.log('Pokrece se cron job svakog minuta');
            try {
                const now = new Date();
                const results = await Match.updateMany(
                    { status: 'open', registrationDeadline: { $lte: now } },
                    { $set: { status: 'closed' } }
                );
                if (results.modifiedCount > 0) {
                    console.log(`Zatvoreno ${results.modifiedCount} meceva koji su imali rok za prijavu do ${now}`);
                }
            } catch (error) {
                console.error('Greska pri zatvaranju meceva', error);
            }
        });

        app.listen(BACKEND_PORT, () => {
            console.log(`Server is running on port ${BACKEND_PORT}`);
    });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });