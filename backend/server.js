const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'https://cm2026flex2.onrender.com' }));
app.use(express.json());

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// GET Matches
app.get('/api/matches', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM matches ORDER BY start_time');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Prediction
app.post('/api/predictions', async (req, res) => {
  const { participant_id, match_id, predicted_home, predicted_away } = req.body;
  try {
    await pool.query(
      'INSERT INTO predictions (participant_id, match_id, predicted_home, predicted_away) VALUES ($1, $2, $3, $4) ON CONFLICT (participant_id, match_id) DO UPDATE SET predicted_home = $3, predicted_away = $4',
      [participant_id, match_id, predicted_home, predicted_away]
    );
    res.json({ message: 'Prediction saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Participants
app.get('/api/participants', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM participants ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Participant
app.post('/api/participants', async (req, res) => {
  const { name } = req.body;
  try {
    await pool.query('INSERT INTO participants (name) VALUES ($1)', [name]);
    res.json({ message: 'Participant added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
