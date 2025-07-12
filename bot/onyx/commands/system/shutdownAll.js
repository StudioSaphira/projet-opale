// bot/onyx/commands/system/shutdownAll.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shutdownall')
    .setDescription('Éteint tous les bots du projet Opale.'),

  ownerOnly: true, // Vérifié dans index.js

  async execute(interaction) {
    const ownerId = process.env.OWNER_ID;
    const devGuildId = process.env.DEV_GUILD_ID;

    if (interaction.user.id !== ownerId) {
      return interaction.reply({ content: '🚫 Seul le propriétaire peut exécuter cette commande.', flags: 64 });
    }

    if (interaction.guildId !== devGuildId) {
      return interaction.reply({ content: '🚫 Cette commande ne peut être utilisée que sur le serveur de développement.', flags: 64 });
    }

    try {
      await interaction.reply({
        content: `⏹️ Arrêt de tous les bots en cours...`,
        flags: 64
      });

      // Log local
      console.log(`🛑 Commande reçue pour éteindre TOUS les bots.`);

      // 💡 À implémenter :
      // Tu peux ici émettre un signal socket global ou appeler une fonction de broadcast :
      //
      // Exemple fictif :
      // const shutdownAllBots = require('../../../shared/system/socket/shutdownAllBots');
      // shutdownAllBots();

    } catch (error) {
      console.error('Erreur lors de l’arrêt global :', error);
      await interaction.followUp({
        content: `❌ Une erreur est survenue pendant l'arrêt global.`,
        flags: 64,
      });
    }
  }
};