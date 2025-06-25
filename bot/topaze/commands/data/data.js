const { SlashCommandBuilder } = require('discord.js');
const db = require('../../../../shared/utils/db');
const { createDataEmbed } = require('../../../../shared/utils/embed/topaze/embedTopazeData');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('data')
    .setDescription('Afficher les paramètres de configuration enregistrés pour ce serveur'),

  async execute(interaction) {
    const guildId = interaction.guild.id;

    try {
      const row = db.prepare('SELECT * FROM server_config WHERE guild_id = ?').get(guildId);

      if (!row) {
        return interaction.reply({
          content: '⚠️ Aucun paramètre de configuration n’est encore enregistré pour ce serveur.',
          flags: 64
        });
      }

      const embed = createDataEmbed(row, interaction.guild);

      await interaction.reply({ embeds: [embed], flags: 64 });

    } catch (error) {
      console.error('[ERREUR /data]', error);
      await interaction.reply({
        content: '❌ Une erreur est survenue lors de la lecture des données.',
        flags: 64
      });
    }
  }
};