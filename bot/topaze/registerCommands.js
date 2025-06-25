require('dotenv').config({ path: '../../.env' }); // ← Assure-toi que c'est en haut du fichier

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

// Récupérer les commandes depuis le dossier "commands"
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    console.warn(`⚠️ La commande dans ${file} est invalide.`);
  }
}

// REST pour publier les commandes
const rest = new REST({ version: '10' }).setToken(token);

// Publier globalement (toutes les guilds)
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