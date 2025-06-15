const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/Auth');

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

app.listen(8000, () => console.log('Server running on port 8000'));
