// bot/opale/registerCommands.js

const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const CLIENT_ID = process.env.ID_SYS;         // ID du client Opale
const GUILD_ID = process.env.GUILD_ID_DEV;    // Serveur de test (local) ou cible
const TOKEN = process.env.TK_SYS;             // Token du bot Opale

const commands = [];
const commandsPath = __dirname + '/commands';
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// On récupère chaque commande exportée
for (const file of commandFiles) {
  const command = require(`${commandsPath}/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

// Enregistrement local (serveur de test)
(async () => {
  try {
    console.log('[Opale] Enregistrement des commandes slash...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );
    console.log('[Opale] Commandes enregistrées avec succès !');
  } catch (error) {
    console.error('[Opale] Erreur lors de l\'enregistrement des commandes :', error);
  }
})();