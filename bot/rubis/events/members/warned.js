// bot/rubis/events/members/warned.js

const db = require('../../../../shared/utils/db');
const { buildInfraEmbed } = require('../../../../shared/utils/embed/rubis/log');

module.exports = {
  name: 'warnedLog', // événement personnalisé

  async execute(data, client) {
    try {
      const {
        guildId,
        userId,
        username,
        moderatorId,
        moderatorName,
        reason = 'Non spécifiée'
      } = data;

      // === 1) Lire salon de log pour warnings
      const row = db.prepare(`SELECT channel_id FROM channel_log WHERE type = ?`).get('warnedLog');
      if (!row || !row.channel_id) {
        console.warn('⚠️ Aucun salon de log défini pour warnedLog.');
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
        type: 'warn',
        reason,
        duration: null
      });

      // === 3) Envoyer l’embed
      await logChannel.send({ embeds: [embed] });
      console.log(`⚠️ Avertissement logué pour ${username}`);

    } catch (err) {
      console.error(`❌ Erreur warned.js :`, err);
    }
  }
};