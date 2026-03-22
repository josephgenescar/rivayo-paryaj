// ============================================================
// RIVAYO PARYAJ - Sistèm Remèt 10% Sou Pèt (Weekly Cashback)
// Kouri chak lendi 06:00 AM otomatikman
// Oswa manyèlman: node cashback.js
// ============================================================
require("dotenv").config();
const { Pool } = require("pg");
const cron = require("node-cron");

const db = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "rivayo_db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "",
});

const CASHBACK_MIN_LOSS = parseFloat(process.env.CASHBACK_MIN_LOSS) || 500;
const CASHBACK_MAX      = parseFloat(process.env.CASHBACK_MAX_AMOUNT) || 200;
const CASHBACK_PCT      = parseFloat(process.env.CASHBACK_PERCENT) || 10;

// ============================================================
// FONKSYON PRENSIPAL: Kalkile ak bay cashback
// ============================================================
async function runWeeklyCashback() {
  const client = await db.connect();
  console.log("🔄 [CASHBACK] Kòmanse kalkil cashback semèn nan...");

  try {
    await client.query("BEGIN");

    // Jwenn tout itilizatè ki gen pèt nèt pandan 7 jou pase yo
    // Sèlman mise REYÈL (pas bonus) ki konte
    const result = await client.query(`
      SELECT
        b.user_id,
        u.name,
        u.phone,
        SUM(b.amount)                                          AS total_mise,
        SUM(CASE WHEN b.status = 'won' THEN b.potential_win ELSE 0 END) AS total_genyen,
        SUM(b.amount) - SUM(CASE WHEN b.status = 'won' THEN b.potential_win ELSE 0 END) AS pèt_nèt
      FROM bets b
      JOIN users u ON u.id = b.user_id
      WHERE
        b.created_at >= NOW() - INTERVAL '7 days'
        AND b.status IN ('won', 'lost')
        AND b.used_bonus = false        -- Sèlman mise reyèl, PAS bonus
        AND NOT EXISTS (               -- Pa genyen deja cashback semèn sa
          SELECT 1 FROM transactions t
          WHERE t.user_id = b.user_id
            AND t.type = 'cashback'
            AND t.created_at >= DATE_TRUNC('week', NOW())
        )
      GROUP BY b.user_id, u.name, u.phone
      HAVING
        -- Pèt nèt > 0 (yo pèdi) epi depase minimòm lan
        SUM(b.amount) - SUM(CASE WHEN b.status = 'won' THEN b.potential_win ELSE 0 END) >= $1
    `, [CASHBACK_MIN_LOSS]);

    console.log(`📊 [CASHBACK] ${result.rows.length} itilizatè kalifyé pou cashback`);

    let totalPaye = 0;
    let nbItilizatè = 0;

    for (const row of result.rows) {
      const pètNèt    = parseFloat(row.pèt_nèt);
      let cashback    = Math.round(pètNèt * (CASHBACK_PCT / 100));

      // Aplike maksimòm
      if (cashback > CASHBACK_MAX) cashback = CASHBACK_MAX;

      // Ajoute cashback nan BONUS (pa reyèl) itilizatè a
      await client.query(
        "UPDATE users SET bonus_balance = bonus_balance + $1 WHERE id = $2",
        [cashback, row.user_id]
      );

      // Anrejistre tranzaksyon an
      await client.query(`
        INSERT INTO transactions (user_id, type, amount, description, status)
        VALUES ($1, 'cashback', $2, $3, 'completed')
      `, [
        row.user_id,
        cashback,
        `Cashback 10% — Pèt ${Math.round(pètNèt)} HTG semèn pase`
      ]);

      totalPaye   += cashback;
      nbItilizatè += 1;

      console.log(`  ✅ ${row.name} (${row.phone}) — Pèt: ${Math.round(pètNèt)} HTG → Cashback: ${cashback} HTG`);
    }

    await client.query("COMMIT");

    console.log(`\n🎉 [CASHBACK] Terminé!`);
    console.log(`   👥 Itilizatè touche: ${nbItilizatè}`);
    console.log(`   💰 Total cashback paye: ${totalPaye} HTG (bonus)`);
    console.log(`   ⏰ ${new Date().toISOString()}\n`);

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ [CASHBACK] Erè:", err.message);
  } finally {
    client.release();
  }
}

// ============================================================
// SCHEDULE: Kouri chak Lendi 06:00 AM otomatikman
// ============================================================
// Syntax cron: "minit   zèdtan   jou-mwa   mwa   jou-semèn"
//              "0       6        *          *      1"   ← Lendi 06:00
cron.schedule("0 6 * * 1", () => {
  console.log("⏰ [CRON] Lendi maten — Kòmanse cashback otomatik...");
  runWeeklyCashback();
}, {
  timezone: "America/Port-au-Prince"
});

console.log("✅ [CASHBACK] Sèvis cashback ap tann... (Kouri chak Lendi 06:00 AM)");
console.log("💡 Pou kouri manyèlman kounye a, tape: node -e \"require('./cashback').runNow()\"");

// Ekspòte pou itilize nan lòt fichye oswa teste
module.exports = { runWeeklyCashback };

// Kouri dirèkteman si lanse kòm script: node cashback.js --now
if (process.argv.includes("--now")) {
  console.log("🚀 Kouri cashback manyèlman kounye a...");
  runWeeklyCashback().then(() => process.exit(0));
}
