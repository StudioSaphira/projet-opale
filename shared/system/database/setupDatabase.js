// shared/system/database/setupDatabase.js

const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.resolve(__dirname, './saphira.sqlite');
const db = new Database(dbPath);

// ========== CHANNELS LOG ==========
db.prepare(`
  CREATE TABLE IF NOT EXISTS channel_log (
    guild_id TEXT PRIMARY KEY,
    channel_id TEXT,
    old_channel_id TEXT
  );
`).run();
console.log("✅ Table 'channel_log' initialisée.");
console.log("");

// ========== CHANNELS WELCOME ==========
db.prepare(`
  CREATE TABLE IF NOT EXISTS channel_welcome (
    guild_id TEXT PRIMARY KEY,
    channel_id TEXT,
    old_channel_id TEXT
  );
`).run();
console.log("✅ Table 'channel_welcome' initialisée.");
console.log("");

// ========== CHANNELS LEAVING ==========
db.prepare(`
  CREATE TABLE IF NOT EXISTS channel_leaving (
    guild_id TEXT PRIMARY KEY,
    channel_id TEXT,
    old_channel_id TEXT
  );
`).run();
console.log("✅ Table 'channel_leaving' initialisée.");
console.log("");

// ========== CHANNELS BIRTHDAY ==========
db.prepare(`
  CREATE TABLE IF NOT EXISTS channel_birthday (
    guild_id TEXT PRIMARY KEY,
    channel_id TEXT,
    old_channel_id TEXT
  );
`).run();
console.log("✅ Table 'channel_birthday' initialisée.");
console.log("");

// ========== CHANNELS RULES ==========
db.prepare(`
  CREATE TABLE IF NOT EXISTS channel_rules (
    guild_id TEXT PRIMARY KEY,
    channel_id TEXT,
    old_channel_id TEXT
  );
`).run();
console.log("✅ Table 'channel_rules' initialisée.");
console.log("");

// ========== CHANNELS VOICE ==========
db.prepare(`
  CREATE TABLE IF NOT EXISTS channel_voice (
    guild_id TEXT PRIMARY KEY,
    channel_id TEXT,
    old_channel_id TEXT
  );
`).run();
console.log("✅ Table 'channel_voice' initialisée.");
console.log("");

// ========== COUNTERS ==========
db.prepare(`
  CREATE TABLE IF NOT EXISTS channel_counter (
    guild_id TEXT PRIMARY KEY,
    member_id TEXT,
    old_member_id TEXT,
    bot_id TEXT,
    old_bot_id TEXT,
    staff_id TEXT,
    old_staff_id TEXT,
    boost_id TEXT,
    old_boost_id TEXT,
    allmember_id TEXT,
    old_allmember_id TEXT
  );
`).run();
console.log("✅ Table 'channel_counter' initialisée.");
console.log("");

// ========== CATEGORIES ==========
db.prepare(`
  CREATE TABLE IF NOT EXISTS category (
    guild_id TEXT PRIMARY KEY,
    counter_id TEXT,
    old_counter_id TEXT,
    support_id TEXT,
    old_support_id TEXT,
    contact_id TEXT,
    old_contact_id TEXT,
    voice_id TEXT,
    old_voice_id TEXT
  );
`).run();
console.log("✅ Table 'category' initialisée.");
console.log("");

// ========== ROLES ==========
db.prepare(`
  CREATE TABLE IF NOT EXISTS role (
    guild_id TEXT PRIMARY KEY,
    allstaff_id TEXT,
    mod_id TEXT,
    admin_id TEXT,
    boost_id TEXT,
    old_boost_id TEXT,
    birthday_id TEXT,
    old_birthday_id TEXT,
    member_id TEXT,
    old_member_id TEXT
  );
`).run();
console.log("✅ Table 'role' initialisée.");
console.log("");

// ========== BIRTHDAY (Utilisateurs) ==========
db.prepare(`
  CREATE TABLE IF NOT EXISTS birthday (
    user_id TEXT PRIMARY KEY,
    date TEXT,
    hour TEXT
  );
`).run();
console.log("✅ Table 'birthday' initialisée.");
console.log("");

// ========== HISTORIQUE TICKET ==========
db.prepare(`
  CREATE TABLE IF NOT EXISTS historique_ticket (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    guild_id TEXT NOT NULL,
    type TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    UNIQUE(user_id, guild_id, type, timestamp)
  );
`).run();
console.log("✅ Table 'historique_ticket' initialisée.");
console.log("");

// ========== COUNTER (Global résumé ?) ==========
db.prepare(`
  CREATE TABLE IF NOT EXISTS counter (
    guild_id TEXT PRIMARY KEY,
    "member" TEXT,
    "staff" TEXT,
    "memberall" TEXT,
    "bots" TEXT,
    "boost" TEXT
  );
`).run();
console.log("✅ Table 'counter' initialisée.");
console.log("");

// ========== USER XP (Turquoise) ==========
db.prepare(`
  CREATE TABLE IF NOT EXISTS user_xp (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    xp INTEGER DEFAULT 0,
    PRIMARY KEY (guild_id, user_id)
  );
`).run();
console.log("✅ Table 'user_xp' (Turquoise) initialisée.");
console.log("");

// ========== USER INVITE (Saphir) ==========
db.prepare(`
  CREATE TABLE IF NOT EXISTS user_invite (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    invited_by TEXT,
    invite_users INTEGER DEFAULT 0,
    PRIMARY KEY (guild_id, user_id)
  );
`).run();
console.log("✅ Table 'user_invite' (Saphir) initialisée.");
console.log("");

// ========== USER RP PROFILE (Turquoise) ==========
db.prepare(`
  CREATE TABLE IF NOT EXISTS user_rp_profile (
    profile_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    prefix TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, prefix)
  );
`).run();
console.log("✅ Table 'user_rp_profile' (Turquoise) initialisée.");
console.log("");

// ========== AUTOMATISATION (Péridot) ==========
db.prepare(`
  CREATE TABLE IF NOT EXISTS automatisation_peridot (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,                     -- ID du membre Discord
    guild_id TEXT NOT NULL,                    -- ID du serveur Discord
    username TEXT NOT NULL,                    -- Nom visible du créateur/streamer
    avatar_url TEXT,                           -- Avatar ou logo du profil
    description TEXT,                          -- Description optionnelle du profil
    
    instagram_url TEXT,                        -- Lien Instagram (https://...)
    tiktok_url TEXT,                           -- Lien TikTok (https://...)
    twitter_url TEXT,                          -- Lien Twitter/X (https://...)
    youtube_url TEXT,                          -- Lien chaîne YouTube (https://...)
    twitch_url TEXT,                           -- Lien Twitch (https://...)

    is_active INTEGER DEFAULT 1,               -- Si l’automatisation est activée (1 = oui, 0 = non)
    created_at TEXT DEFAULT CURRENT_TIMESTAMP  -- Date de création du profil automatisé
  );
`).run();
console.log("✅ Table 'automatisation' (Péridot) initialisée.");
console.log("");

// ========== Tâches Planifiées (Péridot) ==========
db.prepare(`
  CREATE TABLE IF NOT EXISTS tâches_planifiées (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    contenu TEXT NOT NULL,
    horaire TEXT NOT NULL, -- Format HH:MM (heure 24h, ex: 18:30)
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`).run();
console.log("✅ Table 'tâches_planifiées' (Péridot) initialisée.");
console.log("");

// ========== Annonces (Péridot) ==========
db.prepare(`
  CREATE TABLE IF NOT EXISTS annonces_envoyées (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER,
    platform TEXT NOT NULL,
    post_id TEXT NOT NULL,
    sent_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(profile_id, platform, post_id)
  );
`).run();
console.log("✅ Table 'annonces_envoyées' (Péridot) initialisée.");
console.log("");

// ========== Flux RSS (Péridot) ==========
db.prepare(`
  CREATE TABLE IF NOT EXISTS flux_rss_peridot (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    url TEXT NOT NULL,
    name TEXT,
    last_guid TEXT, -- ID du dernier élément traité
    salon_id TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(url, salon_id)
  );
`).run();
console.log("✅ Table 'flux_rss_peridot' (Péridot) initialisée.");
console.log("");

// ========== CHANNELS COMMUNICATION (Péridot) ==========
db.prepare(`
  CREATE TABLE IF NOT EXISTS channel_communication (
    guild_id TEXT PRIMARY KEY,
    channel_id TEXT,
    old_channel_id TEXT
  );
`).run();
console.log("✅ Table 'channel_communication' (Péridot) initialisée.");
console.log("");

console.log("✅ Toutes les tables ont été initialisées !");
console.log("");