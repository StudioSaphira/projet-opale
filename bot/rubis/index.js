// bot/rubis/index.js

require('dotenv').config({ path: '../../.env' });
const { Client, GatewayIntentBits, Partials, Collection, Events } = require('discord.js');
const path = require('path');
const fs = require('fs');

// === Création du client Discord ===
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.commands = new Collection();

// === Initialisation du logSocket ===
const { setupLogListener } = require('./logSocketClient');
setupLogListener(client);

// === Chargement récursif des événements ===
function loadEvents(client, dir = 'events') {
  const files = fs.readdirSync(path.join(__dirname, dir));

  for (const file of files) {
    const fullPath = path.join(__dirname, dir, file);
    const stat = fs.lstatSync(fullPath);

    if (stat.isDirectory()) {
      loadEvents(client, path.join(dir, file));
    } else if (file.endsWith('.js')) {
      const event = require(fullPath);
      const eventName = event.name || file.split('.')[0];

      if (event.once) {
        client.once(eventName, (...args) => event.execute(...args, client));
      } else {
        client.on(eventName, (...args) => event.execute(...args, client));
      }

      console.log(`✅ Événement chargé : ${eventName}`);
    }
  }
}

// === Chargement récursif des commandes ===
function loadCommands(dir = path.join(__dirname, 'commands')) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.lstatSync(fullPath);

    if (stat.isDirectory()) {
      loadCommands(fullPath);
    } else if (file.endsWith('.js')) {
      const command = require(fullPath);
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`📦 Commande chargée : ${command.data.name}`);
      } else {
        console.warn(`⚠️ La commande dans ${file} est invalide.`);
      }
    }
  }
}

// === Listener pour les interactions (commandes) ===
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    if (interaction.isChatInputCommand()) {
      await command.execute(interaction);
    } else if (interaction.isAutocomplete() && command.autocomplete) {
      await command.autocomplete(interaction);
    }
  } catch (error) {
    console.error(`❌ Erreur lors de l’exécution de la commande ${interaction.commandName} :`, error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: '❌ Une erreur est survenue pendant l’exécution de la commande.', flags: 64 });
    } else {
      await interaction.reply({ content: '❌ Une erreur est survenue pendant l’exécution de la commande.', flags: 64 });
    }
  }
});

// === Initialisation complète ===
client.once('ready', () => {
  console.log(`✅ Rubis connecté en tant que ${client.user.tag}`);
});

loadEvents(client);
loadCommands();

client.login(process.env.TK_LOG)
  .then(() => console.log('🔐 Connexion réussie à l’API Discord (Rubis)'))
  .catch((err) => console.error('❌ Échec de connexion à Discord (Rubis) :', err));