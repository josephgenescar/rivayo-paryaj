// ====================================================
// RIVAYO PARYAJ - Backend API (Node.js + Express)
// ====================================================
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const cron = require("node-cron");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: [
    "https://rivayo-paryaj.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options("*", cors());
app.use(express.json());

// ---- DATABASE CONNECTION ----
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// ---- JWT MIDDLEWARE ----
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token manke" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "rivayo_secret_2024");
    next();
  } catch {
    res.status(401).json({ error: "Token pa valid" });
  }
};

// ====================================================
// HEALTH CHECK
// ====================================================
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "RIVAYO PARYAJ API", version: "1.0.0", timestamp: new Date().toISOString() });
});

// ====================================================
// AUTH ROUTES
// ====================================================
app.post("/api/auth/register", async (req, res) => {
  const { phone, pin, name } = req.body;
  if (!phone || !pin || !name) return res.status(400).json({ error: "Tout champ yo obligatwa" });
  if (pin.length < 4) return res.status(400).json({ error: "PIN dwe gen omwen 4 chif" });
  try {
    const existing = await db.query("SELECT id FROM users WHERE phone = $1", [phone]);
    if (existing.rows.length > 0) return res.status(409).json({ error: "Nimewo sa deja enskri" });
    const hashedPin = await bcrypt.hash(pin, 10);
    const result = await db.query(
      `INSERT INTO users (name, phone, pin_hash, real_balance, bonus_balance, is_verified)
       VALUES ($1, $2, $3, 0, 50, false) RETURNING id, name, phone, real_balance, bonus_balance`,
      [name, phone, hashedPin]
    );
    const user = result.rows[0];
    await db.query(
      `INSERT INTO transactions (user_id, type, amount, description, status) VALUES ($1, 'bonus', 50, 'Bonus byenveni', 'completed')`,
      [user.id]
    );
    const token = jwt.sign({ userId: user.id, phone: user.phone }, process.env.JWT_SECRET || "rivayo_secret_2024", { expiresIn: "30d" });
    res.status(201).json({
      message: "Kont kreye! Ou resevwa 50 HTG bonus!",
      token,
      user: { id: user.id, name: user.name, phone: user.phone, realBalance: parseFloat(user.real_balance), bonusBalance: parseFloat(user.bonus_balance) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erè sèvè" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { phone, pin } = req.body;
  try {
    const result = await db.query(
      `SELECT id, name, phone, pin_hash, real_balance, bonus_balance, is_active FROM users WHERE phone = $1`, [phone]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Nimewo sa pa egziste" });
    const user = result.rows[0];
    if (!user.is_active) return res.status(403).json({ error: "Kont ou bloke. Kontakte sipò." });
    const validPin = await bcrypt.compare(pin, user.pin_hash);
    if (!validPin) return res.status(401).json({ error: "PIN pa kòrèk" });
    const token = jwt.sign({ userId: user.id, phone: user.phone }, process.env.JWT_SECRET || "rivayo_secret_2024", { expiresIn: "30d" });
    res.json({ token, user: { id: user.id, name: user.name, phone: user.phone, realBalance: parseFloat(user.real_balance), bonusBalance: parseFloat(user.bonus_balance) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erè sèvè" });
  }
});

// ====================================================
// MATCHES ROUTES
// ====================================================
app.get("/api/matches", async (req, res) => {
  try {
    const { sport, live } = req.query;
    let query = `SELECT m.*, o.home_odd, o.draw_odd, o.away_odd FROM matches m LEFT JOIN odds o ON o.match_id = m.id AND o.is_active = true WHERE m.status IN ('scheduled', 'live')`;
    const params = [];
    if (sport) { params.push(sport); query += ` AND m.sport = $${params.length}`; }
    if (live === "true") { query += " AND m.status = 'live'"; }
    query += " ORDER BY m.match_date ASC";
    const result = await db.query(query, params);
    res.json({ matches: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erè sèvè" });
  }
});

// ====================================================
// BETTING ROUTES
// ====================================================
app.post("/api/bets/place", authMiddleware, async (req, res) => {
  const { selections, amount, useBonus } = req.body;
  const userId = req.user.userId;
  if (!selections || selections.length === 0) return res.status(400).json({ error: "Chwazi omwen yon match" });
  if (!amount || amount < 25) return res.status(400).json({ error: "Minimòm mise a se 25 HTG" });
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const userRes = await client.query("SELECT real_balance, bonus_balance FROM users WHERE id = $1 FOR UPDATE", [userId]);
    const user = userRes.rows[0];
    const balance = useBonus ? parseFloat(user.bonus_balance) : parseFloat(user.real_balance);
    if (balance < amount) { await client.query("ROLLBACK"); return res.status(400).json({ error: "Balans pa sifi" }); }
    let totalOdd = 1;
    const validatedSelections = [];
    for (const sel of selections) {
      const oddRes = await client.query("SELECT home_odd, draw_odd, away_odd FROM odds WHERE match_id = $1 AND is_active = true", [sel.matchId]);
      if (oddRes.rows.length === 0) { await client.query("ROLLBACK"); return res.status(400).json({ error: `Match ${sel.matchId} pa disponib` }); }
      const odds = oddRes.rows[0];
      const selectedOdd = sel.type === "home" ? odds.home_odd : sel.type === "draw" ? odds.draw_odd : odds.away_odd;
      if (!selectedOdd) { await client.query("ROLLBACK"); return res.status(400).json({ error: "Opsyon pa valid" }); }
      totalOdd *= parseFloat(selectedOdd);
      validatedSelections.push({ ...sel, odd: parseFloat(selectedOdd) });
    }
    const potentialWin = Math.round(amount * totalOdd);
    if (useBonus) {
      await client.query("UPDATE users SET bonus_balance = bonus_balance - $1 WHERE id = $2", [amount, userId]);
    } else {
      await client.query("UPDATE users SET real_balance = real_balance - $1 WHERE id = $2", [amount, userId]);
    }
    const betRes = await client.query(
      `INSERT INTO bets (user_id, amount, total_odd, potential_win, status, used_bonus, selections) VALUES ($1, $2, $3, $4, 'pending', $5, $6) RETURNING id, created_at`,
      [userId, amount, totalOdd.toFixed(2), potentialWin, useBonus, JSON.stringify(validatedSelections)]
    );
    await client.query(`INSERT INTO transactions (user_id, type, amount, description, status, reference_id) VALUES ($1, 'bet', $2, 'Paryaj poze', 'completed', $3)`, [userId, amount, betRes.rows[0].id]);
    await client.query("COMMIT");
    res.status(201).json({ message: "Paryaj poze!", bet: { id: betRes.rows[0].id, amount, totalOdd: totalOdd.toFixed(2), potentialWin, status: "pending" } });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Erè sèvè" });
  } finally {
    client.release();
  }
});

app.get("/api/bets/my", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(`SELECT id, amount, total_odd, potential_win, status, used_bonus, selections, created_at FROM bets WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`, [req.user.userId]);
    res.json({ bets: result.rows });
  } catch (err) { res.status(500).json({ error: "Erè sèvè" }); }
});

// ====================================================
// WALLET ROUTES
// ====================================================
app.post("/api/wallet/deposit/moncash", authMiddleware, async (req, res) => {
  const { amount, moncashPhone } = req.body;
  const userId = req.user.userId;
  if (!amount || amount < 50) return res.status(400).json({ error: "Minimòm depo a se 50 HTG" });
  try {
    const transRef = `MC-${Date.now()}-${userId}`;
    await db.query(`INSERT INTO transactions (user_id, type, amount, description, status, reference_id) VALUES ($1, 'deposit', $2, 'Depo MonCash', 'pending', $3)`, [userId, amount, transRef]);
    res.json({ message: "Depo an pandan.", transactionRef: transRef, simulatedConfirm: `/api/wallet/confirm/${transRef}` });
  } catch (err) { res.status(500).json({ error: "Erè sèvè" }); }
});

app.post("/api/wallet/confirm/:ref", async (req, res) => {
  const { ref } = req.params;
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const transRes = await client.query("SELECT * FROM transactions WHERE reference_id = $1 AND status = 'pending' FOR UPDATE", [ref]);
    if (transRes.rows.length === 0) { await client.query("ROLLBACK"); return res.status(404).json({ error: "Tranzaksyon pa jwenn" }); }
    const trans = transRes.rows[0];
    await client.query("UPDATE transactions SET status = 'completed' WHERE reference_id = $1", [ref]);
    await client.query("UPDATE users SET real_balance = real_balance + $1 WHERE id = $2", [trans.amount, trans.user_id]);
    await client.query("COMMIT");
    res.json({ message: "Depo konfime!" });
  } catch (err) { await client.query("ROLLBACK"); res.status(500).json({ error: "Erè sèvè" }); }
  finally { client.release(); }
});

app.post("/api/wallet/withdraw", authMiddleware, async (req, res) => {
  const { amount } = req.body;
  const userId = req.user.userId;
  if (!amount || amount < 100) return res.status(400).json({ error: "Minimòm retrè a se 100 HTG" });
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const userRes = await client.query("SELECT real_balance FROM users WHERE id = $1 FOR UPDATE", [userId]);
    if (parseFloat(userRes.rows[0].real_balance) < amount) { await client.query("ROLLBACK"); return res.status(400).json({ error: "Balans pa sifi" }); }
    await client.query("UPDATE users SET real_balance = real_balance - $1 WHERE id = $2", [amount, userId]);
    const ref = `WD-${Date.now()}-${userId}`;
    await client.query(`INSERT INTO transactions (user_id, type, amount, description, status, reference_id) VALUES ($1, 'withdrawal', $2, 'Retrè MonCash', 'pending', $3)`, [userId, amount, ref]);
    await client.query("COMMIT");
    res.json({ message: "Demann retrè resevwa. 1-24 zèdtan.", reference: ref });
  } catch (err) { await client.query("ROLLBACK"); res.status(500).json({ error: "Erè sèvè" }); }
  finally { client.release(); }
});

app.get("/api/wallet/history", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(`SELECT type, amount, description, status, created_at FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30`, [req.user.userId]);
    res.json({ transactions: result.rows });
  } catch (err) { res.status(500).json({ error: "Erè sèvè" }); }
});

// ====================================================
// ADMIN ROUTES
// ====================================================
const adminRoutes = require("./admin");
app.use("/api/admin", authMiddleware, adminRoutes);

// ====================================================
// API FOOTBALL - Match Live
// ====================================================
app.get("/api/football/live", async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://free-api-live-football-data.p.rapidapi.com/football-current-live",
      { headers: { "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com", "x-rapidapi-key": process.env.RAPIDAPI_KEY } }
    );
    res.json({ matches: data });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Pa ka jwenn match live" });
  }
});

app.get("/api/football/today", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await axios.get(
      `https://free-api-live-football-data.p.rapidapi.com/football-get-matches-by-date?date=${today}`,
      { headers: { "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com", "x-rapidapi-key": process.env.RAPIDAPI_KEY } }
    );
    res.json({ matches: data });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Pa ka jwenn match jodi a" });
  }
});

// ====================================================
// CASHBACK SCHEDULER
// ====================================================
const { runWeeklyCashback } = require("./cashback");
cron.schedule("0 6 * * 1", () => {
  console.log("⏰ [CRON] Lendi — Cashback otomatik kòmanse...");
  runWeeklyCashback();
}, { timezone: "America/Port-au-Prince" });

// ====================================================
// START SERVER
// ====================================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🎯 RIVAYO PARYAJ API ap koure sou pò ${PORT}`);
  console.log(`✅ [CASHBACK] Sèvis cashback ap tann... (Kouri chak Lendi 06:00 AM)`);
  console.log(`💡 Pou kouri manyèlman kounye a, tape: node -e "require('./cashback').runNow()"`);
});

module.exports = app;
