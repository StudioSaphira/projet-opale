const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.resolve(__dirname, '../saphira.sqlite');
const db = new Database(dbPath);

db.prepare(`
  CREATE TABLE IF NOT EXISTS server_config (
    guild_id TEXT PRIMARY KEY,
    channel_log_id TEXT,
    channel_welcome_id TEXT,
    channel_leaving_id TEXT,
    channel_birthday_id TEXT,
    channel_voice_id TEXT,
    channel_counter_member_id TEXT,
    channel_counter_bot_id TEXT,
    channel_counter_staff_id TEXT,
    channel_counter_boost_id TEXT,
    channel_counter_allmember_id TEXT,
    category_counter_id TEXT,
    category_support_id TEXT,
    category_contact_id TEXT,
    category_voice_id TEXT,
    role_allstaff_id TEXT,
    role_mod_id TEXT,
    role_admin_id TEXT,
    role_boost_id TEXT,
    role_birthday_id TEXT,
    role_member_id TEXT
  );
`).run();

console.log("✅ Table 'server_config' initialisée.");

db.prepare(`
  CREATE TABLE IF NOT EXISTS birthday (
    user_id TEXT PRIMARY KEY,
    date TEXT,
    hour TEXT
  );
`).run();

console.log("✅ Table 'birthday' initialisée.");

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