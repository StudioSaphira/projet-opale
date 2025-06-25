require('../../shared/database/utils/setupDatabase.js');
require('dotenv').config({ path: '../../.env' });

const { Client, GatewayIntentBits, Collection, Partials, InteractionType } = require('discord.js');
const fs = require('fs');
const path = require('path');

// === Initialisation du client Discord ===
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

// === Chargement récursif des commandes ===
client.commands = new Collection();

function loadCommandsRecursively(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      loadCommandsRecursively(fullPath);
    } else if (file.endsWith('.js')) {
      const command = require(fullPath);
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
      }
    }
  }
}

loadCommandsRecursively(path.join(__dirname, 'commands'));

// === Gestion directe des interactions ===
client.on('interactionCreate', async interaction => {
  if (interaction.type !== InteractionType.ApplicationCommand) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (err) {
    console.error(`[Topaze] Erreur dans la commande /${interaction.commandName} :`, err);

    if (!interaction.replied) {
      await interaction.reply({
        content: '❌ Une erreur est survenue lors de l’exécution de la commande.',
        flags: 64
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