// bot/rubis/registerCommands.js

require('dotenv').config({ path: '../../.env' });

const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

// === Variables d’environnement Rubis ===
const TOKEN = process.env.TK_LOG;
const CLIENT_ID = process.env.ID_LOG;
const GUILD_ID = process.env.DEV_GUILD_ID;

// Lecture récursive des commands
const commands = [];
const commandsPath = path.join(__dirname, 'commands');

function loadCommands(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      loadCommands(fullPath);
    } else if (file.endsWith('.js')) {
      const command = require(fullPath);
      if (command.data) {
        commands.push(command.data.toJSON());
        console.log(`[Topaze] Commande prête à enregistrer : ${command.data.name}`);
      }
    }
  }
}

loadCommands(commandsPath);

// === Déploiement via REST ===
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log(`🔄 Déploiement de ${commands.length} commande(s) pour Rubis...`);

    if (GUILD_ID) {
      // Déploiement Guild (plus rapide pour dev)
      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands }
      );
      console.log(`✅ Commandes deployées en mode GUILD : ${GUILD_ID}`);
    } else {
      // Déploiement Global (long délai propagation)
      await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: commands }
      );
      console.log('✅ Commandes deployées en mode GLOBAL.');
    }

  } catch (error) {
    console.error('❌ Erreur de déploiement :', error);
  }
})();