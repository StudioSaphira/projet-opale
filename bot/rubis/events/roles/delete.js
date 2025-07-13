// bot/rubis/events/roles/delete.js

const db = require('../../../../shared/utils/db');
const { buildDeleteEmbed } = require('../../../../shared/utils/embed/rubis/log');

module.exports = {
  name: 'roleDelete',

  async execute(role, client) {
    try {
      const row = db.prepare(`SELECT channel_id FROM channel_log WHERE type = ?`).get('roleDelete');
      if (!row || !row.channel_id) {
        console.warn('⚠️ Aucun salon de log défini pour roleDelete.');
        return;
      }

      const logChannel = await client.channels.fetch(row.channel_id).catch(() => null);
      if (!logChannel) {
        console.warn(`⚠️ Salon de log introuvable : ${row.channel_id}`);
        return;
      }

      const embed = buildDeleteEmbed(
        'Rôle supprimé',
        `Le rôle \`${role.name}\` a été supprimé.`,
        [
          {
            name: 'ID du rôle',
            value: `\`${role.id}\``,
            inline: true
          },
          {
            name: 'Couleur',
            value: role.hexColor,
            inline: true
          },
          {
            name: 'Nombre de permissions',
            value: `${role.permissions.toArray().length}`,
            inline: true
          }
        ]
      );

      await logChannel.send({ embeds: [embed] });
      console.log(`🗑️ Rôle supprimé : ${role.name}`);

    } catch (err) {
      console.error(`❌ Erreur roleDelete :`, err);
    }
  }
};