require('../../shared/database/utils/setupDatabase.js');
require('dotenv').config({ path: '../../.env' });

const { Client, GatewayIntentBits, Collection, Partials, InteractionType, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const handleInteraction = require('./handlers/interactionHandler');

// === Initialisation du client Discord ===
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

// === Chargement des commandes ===
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
fs.readdirSync(commandsPath).filter(file => file.endsWith('.js')).forEach(file => {
  const command = require(path.join(commandsPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
});

// === Gestion des interactions ===
client.on('interactionCreate', async interaction => {
  try {
    await handleInteraction(interaction, client);
  } catch (err) {
    console.error('[Topaze] Erreur interaction :', err);

    if (interaction.type === InteractionType.ApplicationCommand && !interaction.replied) {
      await interaction.reply({
        content: '❌ Une erreur est survenue lors de l’exécution de la commande.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
});

// === Prêt ===
client.once('ready', () => {
  console.log(`✅ Topaze prêt : connecté en tant que ${client.user.tag}`);
});

// === Connexion à Discord ===
client.login(process.env.TK_COR);