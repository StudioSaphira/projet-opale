const path = require('path');
const Database = require('better-sqlite3');

// Détermine le chemin absolu vers la base de données
const dbPath = path.resolve(__dirname, '../database/saphira.sqlite');

// Instancie la base une seule fois
const db = new Database(dbPath);

// Optionnel : log du chemin pour debug
console.log(`📦 Base de données chargée depuis : ${dbPath}`);

module.exports = db;