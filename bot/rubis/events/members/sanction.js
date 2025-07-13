// bot/rubis/events/members/sanction.js

const db = require('../../../../shared/utils/db');
const { buildInfraEmbed } = require('../../../../shared/utils/embed/rubis/log');

module.exports = {
  name: 'sanctionLog', // événement personnalisé

  async execute(data, client) {
    try {
      const {
        guildId,
        userId,
        username,
        moderatorId,
        moderatorName,
        type,          // mute, kick, ban, etc.
        reason = 'Non spécifiée',
        duration = null
      } = data;

      // === 1) Lire salon de log pour sanctions
      const row = db.prepare(`SELECT channel_id FROM channel_log WHERE type = ?`).get('sanctionLog');
      if (!row || !row.channel_id) {
        console.warn('⚠️ Aucun salon de log défini pour sanctionLog.');
        return;
      }

      const logChannel = await client.channels.fetch(row.channel_id).catch(() => null);
      if (!logChannel) {
        console.warn(`⚠️ Salon de log introuvable : ${row.channel_id}`);
        return;
      }

      // === 2) Créer l’embed
      const embed = buildInfraEmbed({
        username,
        userId,
        moderatorName,
        moderatorId,
        type,
        reason,
        duration
      });

      // === 3) Envoyer l’embed
      await logChannel.send({ embeds: [embed] });
      console.log(`🚨 Sanction log envoyée pour ${username} (${type})`);

    } catch (err) {
      console.error(`❌ Erreur sanction.js :`, err);
    }
  }
};