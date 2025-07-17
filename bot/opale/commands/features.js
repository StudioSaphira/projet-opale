// bot/opale/commands/features.js

const { SlashCommandBuilder } = require('discord.js');
const generateFeatureStatusEmbed = require('../../embeds/featureStatusEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('features')
    .setDescription('Affiche les fonctionnalités activées sur ce serveur'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const embed = await generateFeatureStatusEmbed(interaction.guild.id);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('[Opale] Erreur dans /features :', error);
      await interaction.editReply({ content: 'Une erreur est survenue lors du chargement des fonctionnalités.' });
    }
  },
};