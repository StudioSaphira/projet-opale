// bot/peridot/registerCommands.js

require('dotenv').config({ path: '../../.env' });

const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.TK_ATM);

(async () => {
  try {
    console.log(`[📡] Déploiement des commandes de Péridot...`);

    await rest.put(
      Routes.applicationCommands(process.env.ID_ATM), // ID_ATM = client ID de Péridot
      { body: commands }
    );

    console.log(`[✅] Les commandes de Péridot ont été déployées avec succès.`);
  } catch (error) {
    console.error(`[❌] Erreur lors du déploiement :`, error);
  }
})();