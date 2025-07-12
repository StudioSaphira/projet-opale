// shared/helpers/events/guildRemoveMember.js

const db = require('../../utils/db');

module.exports = {
  name: 'guildMemberRemove',

  async execute(member, client) {
    console.log(`➖ Départ membre : ${member.user.tag} (${member.id})`);

    try {
      // === 1) Retrouver l’entrée user_invite ===
      const row = db.prepare(`
        SELECT invited_by FROM user_invite
        WHERE guild_id = ? AND user_id = ?
      `).get(member.guild.id, member.id);

      const invitedBy = row ? row.invited_by : null;

      if (invitedBy) {
        // === 2) Décrémenter le compteur du parrain ===
        db.prepare(`
          UPDATE user_invite
          SET invite_users = invite_users - 1
          WHERE guild_id = ? AND user_id = ?
        `).run(member.guild.id, invitedBy);

        console.log(`➖ Compteur décrémenté pour parrain ${invitedBy}`);
      } else {
        console.log('ℹ️ Aucun parrain enregistré pour ce membre.');
      }

      // === 3) Supprimer l’entrée pour le membre s’il le faut
      db.prepare(`
        DELETE FROM user_invite
        WHERE guild_id = ? AND user_id = ?
      `).run(member.guild.id, member.id);

      console.log(`✅ Entrée supprimée pour ${member.id} dans user_invite.`);

      // === 4) Retourner l’ID du parrain pour l’embed final ===
      return invitedBy;

    } catch (err) {
      console.error(`❌ Erreur guildRemoveMember helper :`, err);
      return null;
    }
  },
};