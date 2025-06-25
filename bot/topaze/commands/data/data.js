const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const db = require('../../../../shared/utils/db');

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
          flags: MessageFlags.Ephemeral
        });
      }

      const fields = [
        {
          name: '📕 Salon de logs',
          value: row.log_channel_id ? `<#${row.log_channel_id}> (\`${row.log_channel_id}\`)` : 'Non défini',
          inline: false
        },
        {
          name: '✨ Salon de bienvenue',
          value: row.welcome_channel_id ? `<#${row.welcome_channel_id}> (\`${row.welcome_channel_id}\`)` : 'Non défini',
          inline: false
        },
        {
          name: '✨ Salon de départ',
          value: row.leaving_channel_id ? `<#${row.leaving_channel_id}> (\`${row.leaving_channel_id}\`)` : 'Non défini',
          inline: false
        },
        {
          name: '🎂 Salon d’anniversaire',
          value: row.birthday_channel_id ? `<#${row.birthday_channel_id}> (\`${row.birthday_channel_id}\`)` : 'Non défini',
          inline: false
        },
        {
          name: '🎫 Catégorie Ticket Support',
          value: row.ticket_category_id ? `<#${row.ticket_category_id}> (\`${row.ticket_category_id}\`)` : 'Non défini',
          inline: false
        },
        {
          name: '📩 Catégorie Ticket Contact',
          value: row.ticket_contact_category_id ? `<#${row.ticket_contact_category_id}> (\`${row.ticket_contact_category_id}\`)` : 'Non défini',
          inline: false
        }
      ];

      const embed = new EmbedBuilder()
        .setTitle('📊 Paramètres de configuration enregistrés')
        .setDescription(`Serveur : **${interaction.guild.name}**`)
        .addFields(fields)
        .setColor(0x2ecc71)
        .setFooter({ text: `ID du serveur : ${guildId}` });

      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

    } catch (error) {
      console.error('[ERREUR /data]', error);
      await interaction.reply({
        content: '❌ Une erreur est survenue lors de la lecture des données.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};