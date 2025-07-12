// bot/rubis/index.js

require('dotenv').config({ path: '../../.env' });

const { Client, GatewayIntentBits, Partials, Collection, Events } = require('discord.js');
const path = require('path');
const fs = require('fs');

// === Création du client Rubis ===
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

// === Initialisation du logSocketClient ===
const { setupLogListener } = require('./logSocketClient');
setupLogListener(client);

// === Fonction de chargement récursif des events ===
function loadEvents(client, dir = 'events') {
  const files = fs.readdirSync(path.join(__dirname, dir));

  for (const file of files) {
    const fullPath = path.join(__dirname, dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      loadEvents(client, path.join(dir, file));
    } else if (file.endsWith('.js')) {
      const event = require(fullPath);
      const eventName = event.name || path.basename(file, '.js');

      if (event.once) {
        client.once(eventName, (...args) => event.execute(...args, client));
      } else {
        client.on(eventName, (...args) => event.execute(...args, client));
      }

      console.log(`✅ Événement chargé : ${eventName}`);
    }
  }
}

// === Fonction de chargement récursif des commands ===
function loadCommands(dir = path.join(__dirname, 'commands')) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      loadCommands(fullPath);
    } else if (file.endsWith('.js')) {
      const command = require(fullPath);
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`📦 Commande chargée : ${command.data.name}`);
      }
    }
  }
}

// === Listener InteractionCreate ===
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
    console.error(`❌ Erreur commande ${interaction.commandName} :`, error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: '❌ Une erreur est survenue.', flags: 64 });
    } else {
      await interaction.reply({ content: '❌ Une erreur est survenue.', flags: 64 });
    }
  }
});

// === Listener Invites ===
client.invites = new Map();

client.on('ready', async () => {
  for (const guild of client.guilds.cache.values()) {
    const invites = await guild.invites.fetch();
    client.invites.set(guild.id, new Map(invites.map(i => [i.code, i])));
  }
  console.log(`✅ Invites initialisées.`);
});

// === Prêt ===
client.once('ready', () => {
  console.log(`✅ Rubis connecté en tant que ${client.user.tag}`);
});

// === Lancement ===
loadEvents(client);
loadCommands();

client.login(process.env.TK_LOG)
  .then(() => console.log('🔐 Connexion réussie à Discord (Rubis)'))
  .catch(err => console.error('❌ Échec de connexion à Discord :', err));