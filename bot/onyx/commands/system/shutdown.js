// bot/onyx/commands/system/shutdown.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shutdown')
    .setDescription('Éteint un bot du projet Opale.')
    .addStringOption(option =>
      option.setName('bot')
        .setDescription('Nom du bot à éteindre (ex: topaze, rubis, etc.)')
        .setRequired(true)
    ),

  ownerOnly: true, // Contrôle dans index.js

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

    // Exemple de gestion par socket interne (à adapter à ton système réel)
    try {
      // Simulation d'une commande de shutdown (ici, message fictif)
      // Tu peux remplacer ceci par une commande via socket, IPC, etc.
      // Exemple : envoyer à shared/system/socket/shutdownBot(botName)
      console.log(`🛑 Demande d'arrêt reçue pour le bot ${botName}.`);

      await interaction.reply({
        content: `⏹️ Arrêt du bot **${botName}** en cours...`,
        flags: 64,
      });

      // Exemple à adapter si Onyx gère un bot enfant localement :
      // if (botName === 'onyx') process.exit(0);

      // Sinon tu devras intégrer ici un appel socket ou système distribué :
      // require('../../../shared/system/socket/triggerShutdown.js')(botName);

    } catch (error) {
      console.error(`Erreur lors de l’arrêt de ${botName} :`, error);
      await interaction.followUp({
        content: `❌ Une erreur est survenue lors de la tentative d'arrêt de **${botName}**.`,
        flags: 64,
      });
    }
  }
};