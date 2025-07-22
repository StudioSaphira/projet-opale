// bot/peridot/commands/tâche-lister.js

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../../shared/utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tâche-lister')
    .setDescription('Affiche la liste de tes tâches planifiées.'),

  async execute(interaction) {
    const user_id = interaction.user.id;

    try {
      const rows = db.prepare(`
        SELECT id, channel_id, horaire, contenu, is_active
        FROM tâches_planifiées
        WHERE user_id = ?
        ORDER BY horaire ASC
      `).all(user_id);

      if (rows.length === 0) {
        return interaction.reply({
          content: '🕒 Tu n’as encore programmé aucune tâche.',
          flags: 64
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('📋 Tes tâches planifiées')
        .setColor(0x00cc99)
        .setFooter({ text: `Total : ${rows.length} tâche(s)` })
        .setTimestamp();

      for (const row of rows) {
        embed.addFields({
          name: `📝 Tâche #${row.id}`,
          value: `• **Heure :** ${row.horaire}\n• **Salon :** <#${row.channel_id}>\n• **Message :** ${row.contenu.slice(0, 100)}${row.contenu.length > 100 ? '...' : ''}\n• **Active :** ${row.is_active ? '✅' : '❌'}`,
          inline: false
        });
      }

      await interaction.reply({ embeds: [embed], flags: 64 });

    } catch (err) {
      console.error('Erreur /tâche-lister :', err);
      await interaction.reply({
        content: '❌ Une erreur est survenue lors de la récupération des tâches.',
        flags: 64
      });
    }
  }
};