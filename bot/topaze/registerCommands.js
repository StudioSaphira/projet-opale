// bot/topaze/registerCommands.js

require('dotenv').config({ path: '../../.env' });

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const clientId = process.env.ID_COR;
const guildId = process.env.GUILD_ID;
const token = process.env.TK_COR;

if (!token || !clientId || !guildId) {
  console.error('❌ Token ou ID manquant dans le .env');
  process.exit(1);
}

// Fonction récursive pour charger toutes les commandes
function loadCommandsRecursively(dir) {
  const commands = [];

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      commands.push(...loadCommandsRecursively(fullPath));
    } else if (file.endsWith('.js')) {
      const command = require(fullPath);
      if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
      } else {
        console.warn(`⚠️ La commande dans ${file} est invalide.`);
      }
    }
  }

  return commands;
}

const commandsPath = path.join(__dirname, 'commands');
const commands = loadCommandsRecursively(commandsPath);

// Déploiement via REST
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('🔁 Déploiement des commandes slash de Topaze en cours...');

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );

    console.log('✅ Commandes déployées avec succès !');
  } catch (error) {
    console.error('❌ Échec du déploiement des commandes :', error);
  }
})();