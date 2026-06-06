require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3001;

// ─── DB CONNECTION ────────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET","POST","PUT","DELETE"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json());

// ─── DB INIT ──────────────────────────────────────────────────────────────────
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS participants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY,
        datetime TEXT NOT NULL,
        home TEXT NOT NULL,
        away TEXT NOT NULL,
        home_score INTEGER,
        away_score INTEGER,
        played BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS predictions (
        id SERIAL PRIMARY KEY,
        participant_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
        match_id INTEGER NOT NULL REFERENCES matches(id),
        home_score INTEGER NOT NULL,
        away_score INTEGER NOT NULL,
        UNIQUE(participant_id, match_id)
      );
    `);

    // Seed matches if empty
    const { rowCount } = await client.query("SELECT 1 FROM matches LIMIT 1");
    if (rowCount === 0) {
      await seedMatches(client);
      console.log("✅ Matches seeded");
    }

    console.log("✅ Database initialized");
  } finally {
    client.release();
  }
}

// ─── SEED MATCHES ─────────────────────────────────────────────────────────────
async function seedMatches(client) {
  const matches = [
    [1,"11 iunie, ora 22:00","Mexic","Africa de Sud"],
    [2,"12 iunie, ora 5:00","Coreea de Sud","Cehia"],
    [3,"12 iunie, ora 22:00","Canada","Bosnia"],
    [4,"13 iunie, ora 4:00","SUA","Paraguay"],
    [5,"13 iunie, ora 22:00","Qatar","Elveția"],
    [6,"14 iunie, ora 1:00","Brazilia","Maroc"],
    [7,"14 iunie, ora 4:00","Haiti","Scoția"],
    [8,"14 iunie, ora 7:00","Australia","Turcia"],
    [9,"14 iunie, ora 20:00","Germania","Curacao"],
    [10,"14 iunie, ora 23:00","Olanda","Japonia"],
    [11,"15 iunie, ora 2:00","Coasta de Fildeș","Ecuador"],
    [12,"15 iunie, ora 5:00","Suedia","Tunisia"],
    [13,"15 iunie, ora 19:00","Spania","Insulele Capului Verde"],
    [14,"15 iunie, ora 22:00","Belgia","Egipt"],
    [15,"16 iunie, ora 1:00","Arabia Saudită","Uruguay"],
    [16,"16 iunie, ora 4:00","Iran","Noua Zeelandă"],
    [17,"16 iunie, ora 22:00","Franța","Senegal"],
    [18,"17 iunie, ora 1:00","Irak","Norvegia"],
    [19,"17 iunie, ora 4:00","Argentina","Algeria"],
    [20,"17 iunie, ora 7:00","Austria","Iordania"],
    [21,"17 iunie, ora 20:00","Portugalia","RD Congo"],
    [22,"17 iunie, ora 23:00","Anglia","Croația"],
    [23,"18 iunie, ora 2:00","Ghana","Panama"],
    [24,"18 iunie, ora 5:00","Uzbekistan","Columbia"],
    [25,"18 iunie, ora 19:00","Cehia","Africa de Sud"],
    [26,"18 iunie, ora 22:00","Elveția","Bosnia"],
    [27,"19 iunie, ora 1:00","Canada","Qatar"],
    [28,"19 iunie, ora 4:00","Mexic","Coreea de Sud"],
    [29,"19 iunie, ora 22:00","SUA","Australia"],
    [30,"20 iunie, ora 1:00","Scoția","Maroc"],
    [31,"20 iunie, ora 3:30","Brazilia","Haiti"],
    [32,"20 iunie, ora 6:00","Turcia","Paraguay"],
    [33,"20 iunie, ora 20:00","Olanda","Suedia"],
    [34,"20 iunie, ora 23:00","Germania","Coasta de Fildeș"],
    [35,"21 iunie, ora 3:00","Ecuador","Curacao"],
    [36,"21 iunie, ora 7:00","Tunisia","Japonia"],
    [37,"21 iunie, ora 19:00","Spania","Arabia Saudită"],
    [38,"21 iunie, ora 22:00","Belgia","Iran"],
    [39,"22 iunie, ora 1:00","Uruguay","Insulele Capului Verde"],
    [40,"22 iunie, ora 4:00","Noua Zeelandă","Egipt"],
    [41,"22 iunie, ora 20:00","Argentina","Austria"],
    [42,"23 iunie, ora 0:00","Franța","Irak"],
    [43,"23 iunie, ora 3:00","Norvegia","Senegal"],
    [44,"23 iunie, ora 6:00","Iordania","Algeria"],
    [45,"23 iunie, ora 20:00","Portugalia","Uzbekistan"],
    [46,"23 iunie, ora 23:00","Anglia","Ghana"],
    [47,"24 iunie, ora 2:00","Panama","Croația"],
    [48,"24 iunie, ora 5:00","Columbia","RD Congo"],
    [49,"24 iunie, ora 22:00","Elveția","Canada"],
    [50,"24 iunie, ora 22:00","Bosnia","Qatar"],
    [51,"25 iunie, ora 1:00","Scoția","Brazilia"],
    [52,"25 iunie, ora 1:00","Maroc","Haiti"],
    [53,"25 iunie, ora 4:00","Africa de Sud","Coreea de Sud"],
    [54,"25 iunie, ora 4:00","Cehia","Mexic"],
    [55,"25 iunie, ora 23:00","Ecuador","Germania"],
    [56,"25 iunie, ora 23:00","Curacao","Coasta de Fildeș"],
    [57,"26 iunie, ora 2:00","Tunisia","Olanda"],
    [58,"26 iunie, ora 2:00","Japonia","Suedia"],
    [59,"26 iunie, ora 5:00","Paraguay","Australia"],
    [60,"26 iunie, ora 5:00","Turcia","SUA"],
    [61,"26 iunie, ora 22:00","Norvegia","Franța"],
    [62,"26 iunie, ora 22:00","Senegal","Irak"],
    [63,"27 iunie, ora 3:00","Uruguay","Spania"],
    [64,"27 iunie, ora 3:00","Insulele Capului Verde","Arabia Saudită"],
    [65,"27 iunie, ora 6:00","Noua Zeelandă","Belgia"],
    [66,"27 iunie, ora 6:00","Egipt","Iran"],
    [67,"28 iunie, ora 0:00","Panama","Anglia"],
    [68,"28 iunie, ora 0:00","Croația","Ghana"],
    [69,"28 iunie, ora 2:30","Columbia","Portugalia"],
    [70,"28 iunie, ora 2:30","RD Congo","Uzbekistan"],
    [71,"28 iunie, ora 5:00","Iordania","Argentina"],
    [72,"28 iunie, ora 5:00","Algeria","Austria"],
  ];

  for (const [id, datetime, home, away] of matches) {
    await client.query(
      "INSERT INTO matches (id, datetime, home, away) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING",
      [id, datetime, home, away]
    );
  }
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// GET all data in one call
app.get("/api/data", async (req, res) => {
  try {
    const [participants, matches, predictions] = await Promise.all([
      pool.query("SELECT * FROM participants ORDER BY created_at ASC"),
      pool.query("SELECT * FROM matches ORDER BY id ASC"),
      pool.query("SELECT * FROM predictions"),
    ]);

    // Build predictions map: { participantId: { matchId: { home, away } } }
    const predsMap = {};
    for (const row of predictions.rows) {
      if (!predsMap[row.participant_id]) predsMap[row.participant_id] = {};
      predsMap[row.participant_id][row.match_id] = {
        home: row.home_score,
        away: row.away_score,
      };
    }

    res.json({
      participants: participants.rows,
      matches: matches.rows.map(m => ({
        id: m.id,
        datetime: m.datetime,
        home: m.home,
        away: m.away,
        homeScore: m.home_score,
        awayScore: m.away_score,
        played: m.played,
      })),
      predictions: predsMap,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST add participant
app.post("/api/participants", async (req, res) => {
  const { id, name, color } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO participants (id, name, color) VALUES ($1,$2,$3) RETURNING *",
      [id, name, color]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Participant există deja" });
    res.status(500).json({ error: err.message });
  }
});

// DELETE participant
app.delete("/api/participants/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM participants WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST save predictions (bulk, locked after first save)
app.post("/api/predictions/:participantId", async (req, res) => {
  const { participantId } = req.params;
  const { predictions } = req.body; // { matchId: { home, away } }

  // Check if already locked
  const existing = await pool.query(
    "SELECT 1 FROM predictions WHERE participant_id=$1 LIMIT 1",
    [participantId]
  );
  if (existing.rowCount > 0) {
    return res.status(403).json({ error: "Predicțiile sunt deja blocate" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const [matchId, scores] of Object.entries(predictions)) {
      await client.query(
        "INSERT INTO predictions (participant_id, match_id, home_score, away_score) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING",
        [participantId, parseInt(matchId), scores.home, scores.away]
      );
    }
    await client.query("COMMIT");
    res.json({ ok: true, count: Object.keys(predictions).length });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PUT save match result
app.put("/api/matches/:id/result", async (req, res) => {
  const { homeScore, awayScore } = req.body;
  try {
    await pool.query(
      "UPDATE matches SET home_score=$1, away_score=$2, played=TRUE WHERE id=$3",
      [homeScore, awayScore, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── START ────────────────────────────────────────────────────────────────────
initDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}).catch(err => {
  console.error("DB init failed:", err);
  process.exit(1);
});
