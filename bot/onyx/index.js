// bot/onyx/index.js

require('dotenv').config({ path: '../../.env' });

const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Initialisation du client Discord
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Chargement des commandes
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.warn(`[AVERTISSEMENT] La commande à ${filePath} est manquante de "data" ou "execute".`);
    }
  }
}

// Gestion des interactions
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  // Vérification OWNER_ID uniquement pour Onyx
  const ownerId = process.env.OWNER_ID;
  if (command.ownerOnly && interaction.user.id !== ownerId) {
    return interaction.reply({ content: "🚫 Cette commande est réservée au propriétaire du bot.", ephemeral: true });
  }

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: '❌ Une erreur est survenue lors de l’exécution de la commande.', ephemeral: true });
  }
});

// Connexion du bot
client.once(Events.ClientReady, () => {
  console.log(`✅ Onyx connecté en tant que ${client.user.tag}`);
});

client.login(process.env.TK_SSB)
  .then(() => console.log('🔐 Connexion réussie à Discord (Onyx)'))
  .catch(err => console.error('❌ Échec de connexion à Discord :', err));