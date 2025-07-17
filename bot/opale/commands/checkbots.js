// bot/opale/commands/checkbots.js

const { SlashCommandBuilder } = require('discord.js');
const generateBotStatusEmbed = require('../../../../shared/utils/embed/opale/botStatusEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkbots')
    .setDescription('Vérifie quels bots du Projet Opale sont présents sur ce serveur'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const embed = await generateBotStatusEmbed(interaction.guild);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('[Opale] Erreur dans /checkbots :', error);
      await interaction.editReply({ content: 'Une erreur est survenue lors de la vérification des bots.' });
    }
  },
};