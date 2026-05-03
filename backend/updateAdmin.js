import mongoose from 'mongoose';
import { User } from './models/userModel.js';
import { MongoDB_URL } from './config.js';

mongoose.connect(MongoDB_URL)
  .then(async () => {
    console.log('Povezan sa MongoDB');
    
    // Promeni email na email korisnika koga hoćeš da napraviš adminom
    const email = 'admin@example.com';
    
    const user = await User.findOneAndUpdate(
      { email: email },
      { role: 'admin' },
      { new: true }
    );
    
    if (user) {
      console.log('Korisnik je sada admin:', user);
    } else {
      console.log('Korisnik nije pronađen');
    }
    
    mongoose.connection.close();
  })
  .catch((error) => {
    console.error('Greška:', error);
  });