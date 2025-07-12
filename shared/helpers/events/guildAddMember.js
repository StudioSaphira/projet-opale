// shared/helpers/events/guildAddMember.js

const db = require('../../utils/db');

module.exports = {
  name: 'guildMemberAdd',

  async execute(member, client) {
    console.log(`➕ Nouveau membre : ${member.user.tag} (${member.id})`);

    try {
      // === 1) Récupérer les invites stockées
      const cachedInvites = client.invites.get(member.guild.id);
      const newInvites = await member.guild.invites.fetch();

      // === 2) Détecter l’invite utilisée
      const invite = newInvites.find(i => {
        const cached = cachedInvites.get(i.code);
        return cached && i.uses > cached.uses;
      });

      const invitedBy = invite ? invite.inviter.id : null;

      console.log(`📌 Invite utilisée : ${invite ? invite.code : 'inconnue'}, par : ${invitedBy || 'N/A'}`);

      // === 3) Enregistrer en BDD
      const insertQuery = `
        INSERT OR IGNORE INTO user_invite (guild_id, user_id, invited_by)
        VALUES (?, ?, ?)
      `;
      db.prepare(insertQuery).run(member.guild.id, member.id, invitedBy);

      if (invitedBy) {
        db.prepare(`
          UPDATE user_invite
          SET invite_users = invite_users + 1
          WHERE guild_id = ? AND user_id = ?
        `).run(member.guild.id, invitedBy);
      }

      // === 4) Mettre à jour le cache invites
      client.invites.set(
        member.guild.id,
        new Map(newInvites.map(i => [i.code, i]))
      );

      // === 5) Retourner l’ID du parrain pour le handler principal
      return invitedBy;

    } catch (err) {
      console.error(`❌ Erreur guildAddMember helper :`, err);
      return null;
    }
  },
};