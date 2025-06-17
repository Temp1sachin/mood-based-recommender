const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/Auth');
const EmoMovies = require('./routes/Movies')
const playlist= require('./routes/Playlist')

const app = express();
app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>
{
    return res.json({"status": "ok"})
})
mongoose.connect('mongodb://localhost:27017/moodapp')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/detect',EmoMovies);
app.use('/playlist',playlist);

app.listen(8000, () => console.log('Server running on port 8000'));
