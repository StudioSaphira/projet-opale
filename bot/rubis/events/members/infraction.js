// bot/rubis/events/members/infraction.js

const db = require('../../../../shared/utils/db');
const { buildInfraEmbed } = require('../../../../shared/utils/embed/rubis/log');

module.exports = {
  name: 'infraLog', // événement personnalisé que tu déclenches via un `client.emit('infraLog', data)` depuis un autre bot

  async execute(data, client) {
    try {
      const {
        guildId,
        userId,
        username,
        moderatorId,
        moderatorName,
        type,          // warn, mute, kick, ban, etc.
        reason = 'Non spécifiée',
        duration = null // pour les sanctions temporaires
      } = data;

      // === 1) Récupérer le salon de logs
      const row = db.prepare(`SELECT channel_id FROM channel_log WHERE type = ?`).get('infractionLog');
      if (!row || !row.channel_id) {
        console.warn('⚠️ Aucun salon de log défini pour infractionLog.');
        return;
      }

      const logChannel = await client.channels.fetch(row.channel_id).catch(() => null);
      if (!logChannel) {
        console.warn(`⚠️ Salon de log introuvable : ${row.channel_id}`);
        return;
      }

      // === 2) Créer l’embed via log.js
      const embed = buildInfraEmbed({
        username,
        userId,
        moderatorName,
        moderatorId,
        type,
        reason,
        duration
      });

      // === 3) Envoyer l’embed dans le canal
      await logChannel.send({ embeds: [embed] });
      console.log(`📨 Infraction log envoyée pour ${username} (${type})`);

    } catch (error) {
      console.error(`❌ Erreur lors de l'envoi d'un log d'infraction :`, error);
    }
  }
};