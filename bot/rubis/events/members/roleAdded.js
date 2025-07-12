// bot\rubis\events\members\roleAdded.js

const db = require('../../../../shared/utils/db');
const { buildAddEmbed } = require('../../../../shared/utils/embed/rubis/log');

module.exports = {
  name: 'guildMemberUpdate',

  async execute(oldMember, newMember, client) {
    try {
      // Détecter si un rôle a été ajouté
      const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
      if (addedRoles.size === 0) return;

      addedRoles.forEach(async role => {
        console.log(`➕ Rôle ajouté : ${role.name} à ${newMember.user.tag}`);

        // 1) Lire ID du salon log
        const row = db.prepare(`SELECT channel_id FROM channel_log WHERE type = ?`).get('memberRoleAdded');
        if (!row || !row.channel_id) {
          console.warn('⚠️ Aucun salon de log défini pour memberRoleAdded.');
          return;
        }

        const logChannel = await client.channels.fetch(row.channel_id).catch(() => null);
        if (!logChannel) {
          console.warn(`⚠️ Salon de log introuvable : ${row.channel_id}`);
          return;
        }

        // 2) Créer l’embed Add
        const embed = buildAddEmbed(
          'Rôle ajouté à un membre',
          `Un rôle a été attribué.`,
          [
            { name: 'Membre', value: `${newMember.user.tag} (\`${newMember.id}\`)`, inline: true },
            { name: 'Rôle ajouté', value: `${role.name} (\`${role.id}\`)`, inline: true },
            { name: 'Guild', value: `${newMember.guild.name}`, inline: true }
          ]
        );

        // 3) Envoyer
        await logChannel.send({ embeds: [embed] });
        console.log(`✅ Log envoyé pour rôle ajouté.`);
      });

    } catch (error) {
      console.error(`❌ Erreur memberRoleAdded :`, error);
    }
  },
};