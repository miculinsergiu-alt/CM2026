const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ 
  origin: 'https://cm2026flex2.onrender.com',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true 
}));
app.options('*', cors({ origin: 'https://cm2026flex2.onrender.com', credentials: true }));

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

// GET Participants (Leaderboard)
app.get('/api/participants', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM participants ORDER BY total_points DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Add Participant
app.post('/api/participants', async (req, res) => {
  try {
    await pool.query('INSERT INTO participants (name) VALUES ($1)', [req.body.name]);
    res.status(201).json({ message: 'Participant added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Save Predictions (Batch)
app.post('/api/predictions', async (req, res) => {
  const { participant_id, predictions } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const p of predictions) {
      await client.query(
        'INSERT INTO predictions (participant_id, match_id, predicted_home, predicted_away) VALUES ($1, $2, $3, $4) ON CONFLICT (participant_id, match_id) DO UPDATE SET predicted_home = $3, predicted_away = $4',
        [participant_id, p.match_id, p.predicted_home, p.predicted_away]
      );
    }
    await client.query('COMMIT');
    res.json({ message: 'Predictions saved' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// POST Validate Score & Recalculate Points
app.post('/api/validate-match', async (req, res) => {
  const { match_id, real_home, real_away } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Update match score
    await client.query('UPDATE matches SET score_home = $1, score_away = $2, status = \'finished\' WHERE id = $3', [real_home, real_away, match_id]);
    
    // Fetch all predictions
    const preds = await client.query('SELECT * FROM predictions WHERE match_id = $1', [match_id]);
    
    for (const p of preds.rows) {
      let points = 0;
      if (p.predicted_home === real_home && p.predicted_away === real_away) points = 3;
      else if (Math.sign(p.predicted_home - p.predicted_away) === Math.sign(real_home - real_away)) points = 1;
      else points = -1;
      
      await client.query('UPDATE predictions SET points_earned = $1 WHERE id = $2', [points, p.id]);
      await client.query('UPDATE participants SET total_points = total_points + $1 WHERE id = $2', [points, p.participant_id]);
    }
    
    await client.query('COMMIT');
    res.json({ message: 'Score validated and points updated' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.listen(3000, () => console.log('Backend running on port 3000'));
