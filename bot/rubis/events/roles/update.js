// bot/rubis/events/roles/update.js

const db = require('../../../../shared/utils/db');
const { buildEditEmbed } = require('../../../../shared/utils/embed/rubis/log');
const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'roleUpdate',

  async execute(oldRole, newRole, client) {
    try {
      const row = db.prepare(`SELECT channel_id FROM channel_log WHERE type = ?`).get('roleUpdate');
      if (!row || !row.channel_id) {
        console.warn('⚠️ Aucun salon de log défini pour roleUpdate.');
        return;
      }

      const logChannel = await client.channels.fetch(row.channel_id).catch(() => null);
      if (!logChannel) {
        console.warn(`⚠️ Salon de log introuvable : ${row.channel_id}`);
        return;
      }

      const changes = [];

      if (oldRole.name !== newRole.name) {
        changes.push(`**Nom** : \`${oldRole.name}\` → \`${newRole.name}\``);
      }

      if (oldRole.color !== newRole.color) {
        changes.push(`**Couleur** : \`${oldRole.hexColor}\` → \`${newRole.hexColor}\``);
      }

      if (oldRole.hoist !== newRole.hoist) {
        changes.push(`**Affiché séparément** : \`${oldRole.hoist}\` → \`${newRole.hoist}\``);
      }

      if (oldRole.mentionable !== newRole.mentionable) {
        changes.push(`**Mentionnable** : \`${oldRole.mentionable}\` → \`${newRole.mentionable}\``);
      }

      if (!oldRole.permissions.equals(newRole.permissions)) {
        const oldPerms = new PermissionsBitField(oldRole.permissions).toArray();
        const newPerms = new PermissionsBitField(newRole.permissions).toArray();
        const added = newPerms.filter(p => !oldPerms.includes(p));
        const removed = oldPerms.filter(p => !newPerms.includes(p));

        if (added.length > 0) {
          changes.push(`**Permissions ajoutées** : \`${added.join('`, `')}\``);
        }
        if (removed.length > 0) {
          changes.push(`**Permissions retirées** : \`${removed.join('`, `')}\``);
        }
      }

      if (changes.length === 0) return; // Aucun changement détecté

      const embed = buildEditEmbed(
        'Rôle modifié',
        `Le rôle \`${newRole.name}\` a été modifié.`,
        [
          {
            name: 'Changements détectés',
            value: changes.join('\n'),
            inline: false
          },
          {
            name: 'ID du rôle',
            value: `\`${newRole.id}\``,
            inline: false
          }
        ]
      );

      await logChannel.send({ embeds: [embed] });
      console.log(`🛠️ Modifications loguées pour le rôle ${newRole.name}`);

    } catch (err) {
      console.error(`❌ Erreur roleUpdate :`, err);
    }
  }
};