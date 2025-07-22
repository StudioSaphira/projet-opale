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

// Chargement des commandes
client.commands = new Collection();
const commandsPath = __dirname + '/commands';
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`${commandsPath}/${file}`);
  client.commands.set(command.data.name, command);
}

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

// Quand le bot est prêt
client.once('ready', () => {
  logger.log(`🤖 Connecté en tant que ${client.user.tag}`);
});

// Connexion à Discord
client.login(process.env.TK_COR)
  .then(() => logger.log('✅ Connexion Discord réussie.'))
  .catch(err => logger.error(`❌ Échec de connexion : ${err.message}`));