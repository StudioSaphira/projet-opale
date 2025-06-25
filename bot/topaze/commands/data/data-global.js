const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags
} = require('discord.js');
const db = require('../../../../shared/utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('data-global')
    .setDescription('Afficher toutes les configurations enregistrées dans la base de données (owner only)'),

  async execute(interaction) {
    const ownerIds = process.env.OWNER_ID.split(',');
    if (!ownerIds.includes(interaction.user.id)) {
      return interaction.reply({
        content: '⛔ Cette commande est réservée aux propriétaires du projet.',
        flags: MessageFlags.Ephemeral
      });
    }

    try {
      const allRows = db.prepare('SELECT * FROM server_config').all();

      if (allRows.length === 0) {
        return interaction.reply({
          content: '⚠️ Aucun serveur enregistré dans la base de données.',
          flags: MessageFlags.Ephemeral
        });
      }

      await interaction.reply({
        content: `📦 **${allRows.length} configuration(s) trouvée(s)**. Envoi des détails...`,
        flags: MessageFlags.Ephemeral
      });

      for (const row of allRows) {
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
            name: '🎫 Ticket Support',
            value: row.ticket_category_id ? `<#${row.ticket_category_id}> (\`${row.ticket_category_id}\`)` : 'Non défini',
            inline: false
          },
          {
            name: '📩 Ticket Contact',
            value: row.ticket_contact_category_id ? `<#${row.ticket_contact_category_id}> (\`${row.ticket_contact_category_id}\`)` : 'Non défini',
            inline: false
          }
        ];

        const embed = new EmbedBuilder()
          .setTitle(`🛠️ Configuration pour le serveur ID ${row.guild_id}`)
          .setDescription(`Voici les paramètres enregistrés dans la base.`)
          .addFields(fields)
          .setColor(0xe67e22)
          .setFooter({ text: `Serveur ID : ${row.guild_id}` });

        await interaction.followUp({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }

    } catch (error) {
      console.error('[ERREUR /data-global]', error);
      await interaction.reply({
        content: '❌ Erreur lors de la récupération des données.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};