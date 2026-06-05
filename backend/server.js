const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'https://cm2026flex2.onrender.com', credentials: true }));
app.use(express.json());

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// POST Matches (Bulk)
app.post('/api/matches', async (req, res) => {
  const matches = req.body;
  try {
    const query = 'INSERT INTO matches (team_home, team_away, start_time, status) VALUES ' + 
                  matches.map((_, i) => `($${i*4+1}, $${i*4+2}, $${i*4+3}, $${i*4+4})`).join(', ');
    const values = matches.flatMap(m => [m.team_home, m.team_away, m.start_time, m.status]);
    await pool.query(query, values);
    res.json({ message: 'Matches imported' });
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

// GET Leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM participants ORDER BY total_points DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Profile (Participants table acts as profile)
app.get('/api/profile/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM participants WHERE id = $1', [req.params.id]);
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET User Predictions
app.get('/api/predictions/:participant_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT match_id, predicted_home, predicted_away FROM predictions WHERE participant_id = $1', [req.params.participant_id]);
    res.json(result.rows);
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
