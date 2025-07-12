// bot/topaze/index.js

require('dotenv').config({ path: '../../.env' });

const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Logger
const logger = require('../../shared/helpers/logger');

// DB
const db = require('../../shared/utils/db');
const { sendLogConfigToRubis } = require('../../shared/helpers/rubisLog');

// Client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers
  ]
});

// Collection des commandes
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');

// Charger toutes les commandes
fs.readdirSync(commandsPath).forEach(folder => {
  const folderPath = path.join(commandsPath, folder);
  if (fs.lstatSync(folderPath).isDirectory()) {
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        logger.log(`[Topaze] Commande chargée : ${command.data.name}`);
      } else {
        logger.warn(`[Topaze] Commande invalide ignorée : ${file}`);
      }
    }
  }
});

// Bot prêt
client.once('ready', () => {
  logger.log(`[Topaze] Connecté en tant que ${client.user.tag}`);
});

// Gestion des interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    logger.error(`[Topaze] Erreur lors de ${interaction.commandName} : ${error.stack}`);

    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({
        content: '❌ Une erreur est survenue.',
        flags: 64
      });
    } else {
      await interaction.reply({
        content: '❌ Une erreur est survenue.',
        flags: 64
      });
    }

    await sendLogConfigToRubis(
      interaction.guild,
      interaction.user,
      `Erreur \`${interaction.commandName}\` : ${error.message}`,
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