// bot/rubis/events/members/roleRemoved.js

const db = require('../../../../shared/utils/db');
const { buildDeleteEmbed } = require('../../../../shared/utils/embed/rubis/log');

module.exports = {
  name: 'guildMemberUpdate',

  async execute(oldMember, newMember, client) {
    try {
      // === 1) Identifier les rôles retirés ===
      const oldRoles = new Set(oldMember.roles.cache.keys());
      const newRoles = new Set(newMember.roles.cache.keys());

      const removedRoleIds = [...oldRoles].filter(id => !newRoles.has(id));
      if (removedRoleIds.length === 0) return;

      // === 2) Log par rôle retiré ===
      for (const roleId of removedRoleIds) {
        const role = oldMember.guild.roles.cache.get(roleId);
        if (!role) continue;

        const row = db.prepare(`SELECT channel_id FROM channel_log WHERE type = ?`).get('roleRemoved');
        if (!row || !row.channel_id) {
          console.warn('⚠️ Aucun salon de log défini pour roleRemoved.');
          return;
        }

        const logChannel = await client.channels.fetch(row.channel_id).catch(() => null);
        if (!logChannel) {
          console.warn(`⚠️ Salon de log introuvable : ${row.channel_id}`);
          return;
        }

        const embed = buildDeleteEmbed(
          `Rôle retiré`,
          `Un rôle a été retiré à **${oldMember.user.tag}**.`,
          [
            { name: 'Utilisateur', value: `<@${oldMember.id}> (\`${oldMember.id}\`)`, inline: false },
            { name: 'Rôle retiré', value: `${role.name} (\`${role.id}\`)`, inline: true }
          ]
        );

        await logChannel.send({ embeds: [embed] });
        console.log(`📤 Rôle retiré logué : ${role.name} à ${oldMember.user.tag}`);
      }

    } catch (err) {
      console.error('❌ Erreur roleRemoved :', err);
    }
  }
};