// bot/rubis/index.js

require('dotenv').config({ path: '../../.env' });
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
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
setupLogListener(client); // ✅ Appelé une fois que client est défini

// === Chargement des événements ===
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

// === Initialisation complète ===
client.once('ready', () => {
  console.log(`✅ Rubis connecté en tant que ${client.user.tag}`);
});

// === Chargement global ===
loadEvents(client);

// === Lancement ===
client.login(process.env.TK_LOG)
  .then(() => console.log('🔐 Connexion réussie à l’API Discord (Rubis)'))
  .catch((err) => console.error('❌ Échec de connexion à Discord :', err));