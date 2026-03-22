// ============================================================
// RIVAYO PARYAJ - Wout Admin (Jere Match, Kou, Paryaj)
// Enpòte nan server.js: const adminRoutes = require('./admin')
// ============================================================
const express = require("express");
const router  = express.Router();
const { Pool } = require("pg");
require("dotenv").config();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// ── Middleware: Verifye admin ─────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin")
    return res.status(403).json({ error: "Aksè refize — Admin sèlman" });
  next();
};

// ============================================================
// JERE MATCH YO
// ============================================================

// GET /api/admin/matches — Tout match (enkli fini)
router.get("/matches", adminOnly, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT m.*, o.home_odd, o.draw_odd, o.away_odd
      FROM matches m
      LEFT JOIN odds o ON o.match_id = m.id AND o.is_active = true
      ORDER BY m.match_date DESC
      LIMIT 100
    `);
    res.json({ matches: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/matches — Ajoute yon nouvo match
router.post("/matches", adminOnly, async (req, res) => {
  const { sport, league, home_team, away_team, match_date,
          home_odd, draw_odd, away_odd } = req.body;

  if (!sport || !league || !home_team || !away_team || !match_date)
    return res.status(400).json({ error: "Tout champ yo obligatwa" });
  if (!home_odd || !away_odd)
    return res.status(400).json({ error: "Kou yo obligatwa (home_odd, away_odd)" });

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const matchRes = await client.query(`
      INSERT INTO matches (sport, league, home_team, away_team, match_date, status)
      VALUES ($1, $2, $3, $4, $5, 'scheduled')
      RETURNING id
    `, [sport, league, home_team, away_team, match_date]);

    const matchId = matchRes.rows[0].id;

    await client.query(`
      INSERT INTO odds (match_id, home_odd, draw_odd, away_odd, is_active)
      VALUES ($1, $2, $3, $4, true)
    `, [matchId, home_odd, draw_odd || null, away_odd]);

    await client.query("COMMIT");
    res.status(201).json({ message: "Match ajoute!", matchId });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PATCH /api/admin/matches/:id/score — Mete ajou sko an dirèk
router.patch("/matches/:id/score", adminOnly, async (req, res) => {
  const { id } = req.params;
  const { home_score, away_score, status } = req.body;
  try {
    await db.query(`
      UPDATE matches
      SET home_score = COALESCE($1, home_score),
          away_score = COALESCE($2, away_score),
          status     = COALESCE($3, status)
      WHERE id = $4
    `, [home_score, away_score, status, id]);
    res.json({ message: "Sko mete ajou!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/odds/:matchId — Chanje kou yon match
router.patch("/odds/:matchId", adminOnly, async (req, res) => {
  const { matchId } = req.params;
  const { home_odd, draw_odd, away_odd } = req.body;
  try {
    // Dezaktive ansyen kou yo
    await db.query("UPDATE odds SET is_active = false WHERE match_id = $1", [matchId]);
    // Kreye nouvo kou
    await db.query(`
      INSERT INTO odds (match_id, home_odd, draw_odd, away_odd, is_active)
      VALUES ($1, $2, $3, $4, true)
    `, [matchId, home_odd, draw_odd || null, away_odd]);
    res.json({ message: "Kou chanje avèk siksè!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/matches/:id/finish — Fini yon match epi rezoud paryaj yo
router.post("/matches/:id/finish", adminOnly, async (req, res) => {
  const { id }                  = req.params;
  const { home_score, away_score } = req.body;

  if (home_score === undefined || away_score === undefined)
    return res.status(400).json({ error: "home_score ak away_score obligatwa" });

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // 1. Mete ajou match la
    await client.query(`
      UPDATE matches
      SET home_score = $1, away_score = $2, status = 'finished'
      WHERE id = $3
    `, [home_score, away_score, id]);

    // 2. Dezaktive kou yo
    await client.query("UPDATE odds SET is_active = false WHERE match_id = $1", [id]);

    // 3. Detèmine rezilta a
    let matchResult;
    if (home_score > away_score)       matchResult = "home";
    else if (away_score > home_score)  matchResult = "away";
    else                               matchResult = "draw";

    // 4. Jwenn tout paryaj ki gen match sa ki annatant
    const betsRes = await client.query(`
      SELECT b.*
      FROM bets b
      WHERE b.status = 'pending'
        AND b.selections @> $1::jsonb
    `, [JSON.stringify([{ matchId: parseInt(id) }])]);

    let nbGenyen = 0, nbPèdi = 0, totalPeyeman = 0;

    for (const bet of betsRes.rows) {
      const selections = bet.selections;

      // Verifye si tout selebsyon yo genyen
      const selForThisMatch = selections.filter(s => s.matchId === parseInt(id));
      const allCorrect = selForThisMatch.every(s => s.type === matchResult);

      // Si paryaj akyimilasyon — verifye sèlman selebsyon match sa
      // Lòt match yo toujou "pending" — yo pral rezoud separeman
      const otherMatchesPending = selections.some(s =>
        s.matchId !== parseInt(id)
      );

      if (otherMatchesPending) {
        // Paryaj akyimilasyon — pa rezoud ankò, tann lòt match yo
        if (!allCorrect) {
          // Pèdi yon match = tout paryaj akyimilasyon pèdi
          await client.query(
            "UPDATE bets SET status = 'lost', settled_at = NOW() WHERE id = $1",
            [bet.id]
          );
          nbPèdi++;
        }
        // Si kòrèk — kite pending, lòt match yo ap rezoud pita
        continue;
      }

      // Paryaj senp (yon sèl match)
      if (allCorrect) {
        await client.query(`
          UPDATE bets SET status = 'won', settled_at = NOW() WHERE id = $1
        `, [bet.id]);

        // Peye paryajè a
        await client.query(`
          UPDATE users SET real_balance = real_balance + $1 WHERE id = $2
        `, [bet.potential_win, bet.user_id]);

        await client.query(`
          INSERT INTO transactions (user_id, type, amount, description, status)
          VALUES ($1, 'winnings', $2, 'Paryaj genyen! 🎉', 'completed')
        `, [bet.user_id, bet.potential_win]);

        nbGenyen++;
        totalPeyeman += parseFloat(bet.potential_win);
      } else {
        await client.query(
          "UPDATE bets SET status = 'lost', settled_at = NOW() WHERE id = $1",
          [bet.id]
        );
        nbPèdi++;
      }
    }

    await client.query("COMMIT");
    res.json({
      message: `Match fini! ${home_score}-${away_score}`,
      rezilta: matchResult,
      paryajTraite: betsRes.rows.length,
      genyen: nbGenyen,
      pèdi: nbPèdi,
      totalPeyeman: `${totalPeyeman} HTG`,
    });

  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ============================================================
// JERE ITILIZATÈ YO
// ============================================================

// GET /api/admin/users — Lis itilizatè
router.get("/users", adminOnly, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.name, u.phone, u.real_balance, u.bonus_balance,
             u.is_active, u.is_verified, u.created_at,
             COUNT(b.id) AS total_bets,
             SUM(b.amount) AS total_mise
      FROM users u
      LEFT JOIN bets b ON b.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT 200
    `);
    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/users/:id/block — Bloke oswa debloke itilizatè
router.patch("/users/:id/block", adminOnly, async (req, res) => {
  const { active } = req.body; // true = aktif, false = bloke
  try {
    await db.query("UPDATE users SET is_active = $1 WHERE id = $2", [active, req.params.id]);
    res.json({ message: active ? "Kont debloke" : "Kont bloke" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/users/:id/adjust — Ajiste balans manyèlman
router.post("/users/:id/adjust", adminOnly, async (req, res) => {
  const { amount, type, reason } = req.body;
  // type: 'add_real' | 'remove_real' | 'add_bonus' | 'remove_bonus'
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const col = type.includes("real") ? "real_balance" : "bonus_balance";
    const op  = type.startsWith("add") ? "+" : "-";
    await client.query(
      `UPDATE users SET ${col} = ${col} ${op} $1 WHERE id = $2`,
      [Math.abs(amount), req.params.id]
    );
    await client.query(`
      INSERT INTO transactions (user_id, type, amount, description, status)
      VALUES ($1, 'adjustment', $2, $3, 'completed')
    `, [req.params.id, amount, reason || "Ajisteman admin"]);
    await client.query("COMMIT");
    res.json({ message: "Balans ajiste!" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ============================================================
// DASHBOARD STATS
// ============================================================

// GET /api/admin/stats — Rezime jeneral
router.get("/stats", adminOnly, async (req, res) => {
  try {
    const [users, bets, deposits, cashflow] = await Promise.all([
      db.query("SELECT COUNT(*) AS total, COUNT(CASE WHEN is_active THEN 1 END) AS actif FROM users"),
      db.query(`SELECT
        COUNT(*) AS total,
        COUNT(CASE WHEN status='pending' THEN 1 END) AS pending,
        COUNT(CASE WHEN status='won' THEN 1 END) AS won,
        COUNT(CASE WHEN status='lost' THEN 1 END) AS lost,
        SUM(amount) AS total_mise
        FROM bets`),
      db.query(`SELECT SUM(amount) AS total FROM transactions WHERE type='deposit' AND status='completed'`),
      db.query(`SELECT
        SUM(CASE WHEN type='deposit'    THEN amount ELSE 0 END) AS total_depo,
        SUM(CASE WHEN type='withdrawal' THEN amount ELSE 0 END) AS total_retrè,
        SUM(CASE WHEN type='winnings'   THEN amount ELSE 0 END) AS total_peye,
        SUM(CASE WHEN type='cashback'   THEN amount ELSE 0 END) AS total_cashback
        FROM transactions WHERE status='completed'`)
    ]);

    res.json({
      itilizatè: users.rows[0],
      paryaj: bets.rows[0],
      depo: deposits.rows[0],
      cashflow: cashflow.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
