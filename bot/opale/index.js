// bot/opale/index.js

const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('fs');
require('dotenv').config({ path: '../../.env' });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.GuildMember],
});

// Chargement des commandes
client.commands = new Collection();
const commandsPath = __dirname + '/commands';
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`${commandsPath}/${file}`);
  client.commands.set(command.data.name, command);
}

// Gestion des interactions
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(`[Opale] Erreur lors de l'exécution de la commande ${interaction.commandName} :`, error);
    await interaction.reply({ content: 'Une erreur est survenue lors de l\'exécution de la commande.', ephemeral: true });
  }
});

// Quand le bot est prêt
client.once('ready', () => {
  logger.log(`[Opale] 🤖 Connecté en tant que ${client.user.tag}`);
});

// Connexion à Discord
client.login(process.env.TK_SYS)
  .then(() => logger.log('[Opale] ✅ Connexion Discord réussie.'))
  .catch(err => logger.error(`[Opale] ❌ Échec de connexion : ${err.message}`));