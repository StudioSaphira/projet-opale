// bot/peridot/index.js

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../../.env' });

const db = require('../../shared/utils/db');
const logger = console; // Remplace ceci par ton vrai logger si tu en as un
const postScheduledMessages = require('./tasks/postScheduledMessages');

const cronScheduler = require('./triggers/cronScheduler');
cronScheduler(client);

const intervalRunner = require('./triggers/intervalRunner');
intervalRunner(client);

const postScheduledMessages = require('./tasks/postScheduledMessages');
setInterval(() => {
  postScheduledMessages(client);
}, 60 * 1000); // Toutes les minutes

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// Chargement des commandes (récursif)
const commandsPath = path.join(__dirname, 'commands');
function loadCommandsRecursively(dir) {
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      loadCommandsRecursively(fullPath);
    } else if (entry.endsWith('.js')) {
      const command = require(fullPath);
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
      }
    }
  }
}
if (fs.existsSync(commandsPath)) {
  loadCommandsRecursively(commandsPath);
}

// Chargement des tâches
const tasksPath = path.join(__dirname, 'tasks');
const tasks = [];

if (fs.existsSync(tasksPath)) {
  const taskFiles = fs.readdirSync(tasksPath).filter(file => file.endsWith('.js') && file !== 'postScheduledMessages.js');
  for (const file of taskFiles) {
    const task = require(`./tasks/${file}`);
    if (typeof task === 'function') {
      tasks.push(task);
    }
  }
}

// Quand le bot est prêt
client.once('ready', () => {
  logger.log(`[✅] Péridot connecté en tant que ${client.user.tag}`);

  // Tâches périodiques (toutes les 5 min sauf scheduledMessages)
  tasks.forEach(task => {
    task(client);
    setInterval(() => task(client), 5 * 60 * 1000);
  });

  // Tâches horaires (scheduledMessages toutes les minutes)
  setInterval(() => {
    postScheduledMessages(client);
  }, 60 * 1000);
});

// Gestion des interactions (slash commands)
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: '❌ Une erreur est survenue lors de l’exécution de la commande.',
      ephemeral: true
    });
  }
});

// Connexion à Discord
client.login(process.env.TK_ATM)
  .then(() => logger.log('✅ Connexion Discord réussie.'))
  .catch(err => logger.error(`❌ Échec de connexion : ${err.message}`));