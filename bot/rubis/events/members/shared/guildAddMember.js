// bot/rubis/events/members/shared/guildAddMember.js

const db = require('../../../../../shared/utils/db');
const guildAddMemberHelper = require('../../../../../shared/helpers/events/guildAddMember.js');
const { buildInviteEmbed } = require('../../../../../shared/utils/embed/rubis/logInv');

module.exports = {
  name: 'guildMemberAdd',

  async execute(member, client) {
    // 1) Exécuter la logique helper pour la BDD + détection
    const invitedBy = await guildAddMemberHelper.execute(member, client);

    try {
      // 2) Log Discord si channel défini
      const row = db.prepare(`SELECT channel_id FROM channel_log WHERE type = ?`).get('guildMemberAdd');
      if (!row || !row.channel_id) {
        console.warn('⚠️ Aucun salon de log défini pour guildMemberAdd.');
        return;
      }

      const logChannel = await client.channels.fetch(row.channel_id).catch(() => null);
      if (!logChannel) {
        console.warn(`⚠️ Salon de log introuvable : ${row.channel_id}`);
        return;
      }

      // 3) Créer l’embed via logInv
      const embed = buildInviteEmbed(member, invitedBy);

      await logChannel.send({ embeds: [embed] });
      console.log(`✅ Log invite envoyé pour guildMemberAdd.`);

    } catch (err) {
      console.error(`❌ Erreur guildMemberAdd shared :`, err);
    }
  },
};