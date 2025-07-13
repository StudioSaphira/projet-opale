// bot/topaze/index.js

require('dotenv').config({ path: '../../.env' });

const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const logger = require('../../shared/helpers/logger');
const { sendLogConfigToRubis } = require('../../shared/helpers/rubisLog');
const db = require('../../shared/utils/db'); // ← tu pourras l’ajouter plus tard à client.db si besoin

const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers ]});

client.commands = new Collection();

// Chargement des commandes depuis /commands/*
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath).filter(folder => {
  const folderPath = path.join(commandsPath, folder);
  return fs.lstatSync(folderPath).isDirectory();
});

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    try {
      const command = require(filePath);

      if (!command || !command.data || !command.execute) {
        logger.warn(`[Topaze] Fichier ignoré (incomplet) : ${file}`);
        continue;
      }

      if (!command.data.name || typeof command.execute !== 'function') {
        logger.warn(`[Topaze] Fichier ignoré (structure invalide) : ${file}`);
        continue;
      }

      if (client.commands.has(command.data.name)) {
        logger.warn(`[Topaze] Conflit : la commande '${command.data.name}' est déjà définie. Fichier ignoré : ${file}`);
        continue;
      }

      client.commands.set(command.data.name, command);
      logger.log(`[Topaze] ✅ Commande chargée : ${command.data.name}`);
    } catch (error) {
      logger.error(`[Topaze] ❌ Erreur lors du chargement de ${file} : ${error.message}`);
    }
  }
}

// Quand le bot est prêt
client.once('ready', () => {
  logger.log(`[Topaze] 🤖 Connecté en tant que ${client.user.tag}`);
});

// Gestion des interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    logger.error(`[Topaze] ❌ Erreur dans '${interaction.commandName}' : ${error.stack}`);

    const replyPayload = {
      content: '❌ Une erreur est survenue.',
      flags: 64
    };

    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(replyPayload);
      } else {
        await interaction.reply(replyPayload);
      }
    } catch (replyError) {
      logger.error(`[Topaze] Échec de reply/followUp : ${replyError.message}`);
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

// Connexion à Discord
client.login(process.env.TK_COR)
  .then(() => logger.log('[Topaze] ✅ Connexion Discord réussie.'))
  .catch(err => logger.error(`[Topaze] ❌ Échec de connexion : ${err.message}`));