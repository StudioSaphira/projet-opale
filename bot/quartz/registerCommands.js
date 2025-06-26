// bot/quartz/registerCommands.js

require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// === Config ===
const CLIENT_ID = process.env.ID_STA; // ID du bot Quartz
const GUILD_ID = process.env.GUILD_ID;
const TOKEN = process.env.TK_STA;

// === Chargement récursif des commandes ===
const commands = [];

function loadCommandsRecursively(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      loadCommandsRecursively(fullPath);
    } else if (file.endsWith('.js')) {
      const command = require(fullPath);
      if (command.data && typeof command.data.toJSON === 'function') {
        commands.push(command.data.toJSON());
      } else {
        console.warn(`[⚠] La commande "${file}" est invalide ou incomplète.`);
      }
    }
  }
}

loadCommandsRecursively(path.join(__dirname, 'commands'));

// === Enregistrement via l’API REST ===
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log(`📤 Déploiement de ${commands.length} commande(s)...`);

    const route = GUILD_ID
      ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
      : Routes.applicationCommands(CLIENT_ID);

    await rest.put(route, { body: commands });

    console.log(`✅ Commandes ${GUILD_ID ? 'locales' : 'globales'} déployées avec succès.`);
  } catch (error) {
    console.error('❌ Échec du déploiement des commandes :', error);
  }
})();