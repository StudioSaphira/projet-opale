// bot/topaze/index.js

require('dotenv').config({ path: '../../.env' });
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Logger Winston daily-rotate
const logger = require('../../../shared/helpers/logger');

// DB partagée
const db = require('../../../shared/utils/db');
const { sendLogConfigToRubis } = require('../../../shared/helpers/rubisLog');

// Crée le client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers
  ]
});

// Prépare la collection de commandes
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');

// Lecture récursive du dossier de commandes
function loadCommands(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      loadCommands(fullPath);
    } else if (file.endsWith('.js')) {
      const command = require(fullPath);
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        logger.log(`[Topaze] Commande chargée : ${command.data.name}`);
      }
    }
  }
}
loadCommands(commandsPath);

// Prêt
client.once('ready', () => {
  logger.log(`[Topaze] Connecté en tant que ${client.user.tag}`);
});

// Gère les interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(`[Topaze] Erreur lors de l’exécution de ${interaction.commandName} : ${error.stack}`);

    await interaction.reply({
      content: '❌ Une erreur est survenue lors de l’exécution de la commande.',
      flags: 64
    });

    // Log optionnel vers Rubis
    await sendLogConfigToRubis(
      interaction.guild,
      interaction.user,
      `Erreur lors de \`${interaction.commandName}\` : ${error.message}`,
      client,
      'Erreur Commande',
      '⚠️'
    );
  }
});

// Connexion
client.login(process.env.TK_COR)
  .then(() => logger.log('[Topaze] Connexion Discord réussie.'))
  .catch(err => logger.error(`[Topaze] Échec de connexion : ${err.message}`));