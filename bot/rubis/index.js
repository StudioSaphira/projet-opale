require('dotenv').config();
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

// === Fonction de chargement récursif des événements ===
function loadEvents(client, dir = 'events') {
  const files = fs.readdirSync(path.join(__dirname, dir));

  for (const file of files) {
    const fullPath = path.join(__dirname, dir, file);
    const stat = fs.lstatSync(fullPath);

    if (stat.isDirectory()) {
      loadEvents(client, path.join(dir, file)); // Recurse dans les sous-dossiers
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

// === Connexion et lancement ===
client.once('ready', () => {
  console.log(`✅ Rubis connecté en tant que ${client.user.tag}`);
});

loadEvents(client); // Chargement des événements

client.login(process.env.TK_LOG);