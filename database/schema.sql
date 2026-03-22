-- ====================================================
-- RIVAYO PARYAJ - Baz Done PostgreSQL
-- Kouri kòmand sa yo nan PostgreSQL pou kreye baz done
-- ====================================================

-- Kreye baz done
-- CREATE DATABASE rivayo_db;
-- \c rivayo_db

-- ====================================================
-- TABLE: users (Itilizatè)
-- ====================================================
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    phone           VARCHAR(20) UNIQUE NOT NULL,
    pin_hash        VARCHAR(255) NOT NULL,
    real_balance    DECIMAL(12,2) DEFAULT 0.00,
    bonus_balance   DECIMAL(12,2) DEFAULT 50.00,   -- Bonus 50 HTG pou nouvo itilizatè
    role            VARCHAR(20) DEFAULT 'user',     -- 'user' | 'admin'
    is_active       BOOLEAN DEFAULT true,
    is_verified     BOOLEAN DEFAULT false,          -- Verifikasyon KYC
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ====================================================
-- TABLE: matches (Match espò)
-- ====================================================
CREATE TABLE IF NOT EXISTS matches (
    id              SERIAL PRIMARY KEY,
    sport           VARCHAR(50) NOT NULL,           -- 'football' | 'basketball' | etc.
    league          VARCHAR(100) NOT NULL,
    home_team       VARCHAR(100) NOT NULL,
    away_team       VARCHAR(100) NOT NULL,
    match_date      TIMESTAMP NOT NULL,
    status          VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled' | 'live' | 'finished' | 'cancelled'
    home_score      INTEGER,
    away_score      INTEGER,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ====================================================
-- TABLE: odds (Kou paryaj)
-- ====================================================
CREATE TABLE IF NOT EXISTS odds (
    id              SERIAL PRIMARY KEY,
    match_id        INTEGER REFERENCES matches(id) ON DELETE CASCADE,
    home_odd        DECIMAL(6,2) NOT NULL,
    draw_odd        DECIMAL(6,2),                   -- NULL pou baskètbòl
    away_odd        DECIMAL(6,2) NOT NULL,
    is_active       BOOLEAN DEFAULT true,
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ====================================================
-- TABLE: bets (Paryaj)
-- ====================================================
CREATE TABLE IF NOT EXISTS bets (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount          DECIMAL(12,2) NOT NULL,
    total_odd       DECIMAL(8,2) NOT NULL,
    potential_win   DECIMAL(12,2) NOT NULL,
    status          VARCHAR(20) DEFAULT 'pending',  -- 'pending' | 'won' | 'lost' | 'cancelled'
    used_bonus      BOOLEAN DEFAULT false,
    selections      JSONB NOT NULL,                 -- [{ matchId, type, odd, home, away }]
    settled_at      TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ====================================================
-- TABLE: transactions (Tranzaksyon kòb)
-- ====================================================
CREATE TABLE IF NOT EXISTS transactions (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(30) NOT NULL,           -- 'deposit' | 'withdrawal' | 'bet' | 'winnings' | 'bonus'
    amount          DECIMAL(12,2) NOT NULL,
    description     VARCHAR(255),
    status          VARCHAR(20) DEFAULT 'pending',  -- 'pending' | 'completed' | 'failed'
    reference_id    VARCHAR(100),                   -- ID MonCash oswa ID paryaj
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ====================================================
-- INDEXES pou vitès
-- ====================================================
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_bets_user_id ON bets(user_id);
CREATE INDEX idx_bets_status ON bets(status);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_odds_match_id ON odds(match_id);

-- ====================================================
-- DONNEES TÈS (Match echantiyon)
-- ====================================================
INSERT INTO matches (sport, league, home_team, away_team, match_date, status) VALUES
('football', 'Premier League', 'Arsenal', 'Chelsea', NOW() + INTERVAL '2 hours', 'scheduled'),
('football', 'La Liga', 'Real Madrid', 'Barcelona', NOW() + INTERVAL '3 hours', 'live'),
('football', 'Serie A', 'Juventus', 'Inter Milan', NOW() + INTERVAL '1 day', 'scheduled'),
('basketball', 'NBA', 'Lakers', 'Warriors', NOW() + INTERVAL '2 days', 'scheduled'),
('football', 'Ligue 1', 'PSG', 'Marseille', NOW() + INTERVAL '2 days 2 hours', 'scheduled');

INSERT INTO odds (match_id, home_odd, draw_odd, away_odd) VALUES
(1, 2.10, 3.40, 3.20),
(2, 1.85, 3.60, 4.10),
(3, 2.30, 3.20, 3.00),
(4, 1.95, NULL, 1.85),
(5, 1.55, 4.00, 5.50);

-- ====================================================
-- RÈG SEKIRITE (Row Level Security)
-- ====================================================
-- Aktive RLS pou sekirite ekstra (opsyonèl ak Supabase)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- ====================================================
-- VIEW: Rezime balans itilizatè
-- ====================================================
CREATE OR REPLACE VIEW user_summary AS
SELECT 
    u.id,
    u.name,
    u.phone,
    u.real_balance,
    u.bonus_balance,
    u.real_balance + u.bonus_balance AS total_balance,
    COUNT(DISTINCT b.id) AS total_bets,
    SUM(CASE WHEN b.status = 'won' THEN b.potential_win ELSE 0 END) AS total_won,
    SUM(CASE WHEN b.status = 'lost' THEN b.amount ELSE 0 END) AS total_lost
FROM users u
LEFT JOIN bets b ON b.user_id = u.id
GROUP BY u.id;
