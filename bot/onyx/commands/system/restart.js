// bot/onyx/commands/system/restart.js

const { SlashCommandBuilder } = require('discord.js');

// Liste à personnaliser selon les bots réellement gérés
const botNames = ['topaze', 'rubis', 'saphir', 'diamant', 'amethyste', 'emeraude', 'obsidienne', 'quartz', 'peridot', 'lazulite', 'celestine', 'jais', 'nemesite', 'opale', 'turquoise'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Redémarre un bot du projet Opale.')
    .addStringOption(option =>
      option.setName('bot')
        .setDescription('Nom du bot à redémarrer')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  ownerOnly: true, // Géré par index.js

  async execute(interaction) {
    const ownerId = process.env.OWNER_ID;
    const devGuildId = process.env.DEV_GUILD_ID;

    if (interaction.user.id !== ownerId) {
      return interaction.reply({ content: '🚫 Seul le propriétaire peut exécuter cette commande.', flags: 64 });
    }

    if (interaction.guildId !== devGuildId) {
      return interaction.reply({ content: '🚫 Cette commande ne peut être utilisée que sur le serveur de développement.', flags: 64 });
    }

    const botName = interaction.options.getString('bot').toLowerCase();

    if (!botNames.includes(botName)) {
      return interaction.reply({ content: `❌ Bot inconnu : **${botName}**`, flags: 64 });
    }

    try {
      await interaction.reply({
        content: `🔄 Redémarrage du bot **${botName}** en cours...`,
        flags: 64,
      });

      // Ici, implémente le mécanisme de redémarrage (ex: socket, script shell, PM2, etc.)
      console.log(`🔁 Demande de redémarrage reçue pour ${botName}.`);

      // Exemple fictif à adapter :
      // require('../../../shared/system/socket/restartBot')(botName);

    } catch (error) {
      console.error(`Erreur lors du redémarrage de ${botName} :`, error);
      await interaction.followUp({
        content: `❌ Une erreur est survenue lors du redémarrage de **${botName}**.`,
        flags: 64,
      });
    }
  },

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused().toLowerCase();

    const filtered = botNames.filter(name => name.startsWith(focusedValue)).slice(0, 25);

    await interaction.respond(
      filtered.map(name => ({ name, value: name }))
    );
  }
};