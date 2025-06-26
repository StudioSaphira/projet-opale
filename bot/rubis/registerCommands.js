// bot/rubis/registerCommands.js

const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
require('dotenv').config({ path: '../../.env' });

// === Variables d’environnement ===
const TOKEN = process.env.TK_LOG;
const CLIENT_ID = process.env.ID_LOG;
const GUILD_ID = process.env.GUILD_ID;

const commands = [];

/**
 * Chargement récursif des fichiers de commandes .js
 */
function loadCommands(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.lstatSync(fullPath);

    if (stat.isDirectory()) {
      loadCommands(fullPath);
    } else if (file.endsWith('.js')) {
      const command = require(fullPath);

      if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`📦 Commande ajoutée : ${command.data.name}`);
      } else {
        console.warn(`⚠️ Fichier ignoré (commande invalide) : ${file}`);
      }
    }
  }
}

// Dossier racine des commandes
const commandsPath = path.join(__dirname, 'commands');
loadCommands(commandsPath);

// === Enregistrement via l’API Discord ===
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log(`🔄 Déploiement de ${commands.length} commande(s) pour le serveur ${GUILD_ID}...`);

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log('✅ Commandes enregistrées avec succès.');
  } catch (error) {
    console.error('❌ Échec lors de l’enregistrement des commandes :', error);
  }
})();