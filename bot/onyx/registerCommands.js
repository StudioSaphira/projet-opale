// bot/onyx/registerCommands.js

require('dotenv').config({ path: '../../.env' });

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Variables d'env
const TOKEN = process.env.TK_SSB;
const CLIENT_ID = process.env.ID_SSB;

if (!TOKEN || !CLIENT_ID) {
  console.error('[Onyx] ❌ Variables d’environnement manquantes : TK_SSB ou ID_SSB.');
  process.exit(1);
}

// Prépare REST API
const rest = new REST({ version: '10' }).setToken(TOKEN);

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
        console.log(`[Onyx] Commande prête à enregistrer : ${command.data.name}`);
      }
    }
  }
}

loadCommands(commandsPath);

// Déploie globalement
(async () => {
  try {
    console.log(`[Onyx] Déploiement de ${commands.length} commande(s) pour le client ${CLIENT_ID}...`);

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log('[Onyx] ✅ Toutes les commandes ont été enregistrées globalement !');
  } catch (error) {
    console.error('[Onyx] ❌ Erreur lors de l’enregistrement des commandes :', error);
  }
})();