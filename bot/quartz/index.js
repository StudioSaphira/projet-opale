// bot/quartz/index.js

require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.GuildMember]
});

// === Collections ===
client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();

// === Fonction récursive pour charger toutes les commandes ===
function loadCommandsRecursively(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      loadCommandsRecursively(fullPath);
    } else if (file.endsWith('.js')) {
      const command = require(fullPath);
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
      }
    }
  }
}

// Chargement des commandes
loadCommandsRecursively(path.join(__dirname, 'commands'));

// === Chargement des événements ===
const eventsPath = path.join(__dirname, 'events');
fs.readdirSync(eventsPath).filter(file => file.endsWith('.js')).forEach(file => {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
});

// === Connexion à l'API Discord ===
client.login(process.env.TK_STA)
  .then(() => console.log('🔐 Connexion réussie à l’API Discord (Quartz)'))
  .catch((err) => console.error('❌ Échec de connexion à Discord (Quartz) :', err));