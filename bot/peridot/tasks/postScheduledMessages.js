// bot/peridot/tasks/postScheduledMessages.js

const db = require('../../../shared/utils/db');
const { EmbedBuilder } = require('discord.js');

module.exports = async function postScheduledMessages(client) {
  const now = new Date();
  const heureActuelle = now.toTimeString().slice(0, 5); // Format 'HH:MM'

  const tâches = db.prepare(`
    SELECT id, user_id, channel_id, contenu
    FROM tâches_planifiées
    WHERE horaire = ? AND is_active = 1
  `).all(heureActuelle);

  for (const tâche of tâches) {
    try {
      const salon = client.channels.cache.get(tâche.channel_id);
      if (!salon) continue;

      const embed = new EmbedBuilder()
        .setTitle(`📢 Message programmé`)
        .setDescription(tâche.contenu)
        .setColor(0x2ecc71)
        .setFooter({ text: `Envoyé automatiquement à ${heureActuelle}` })
        .setTimestamp();

      await salon.send({ embeds: [embed] });

    } catch (err) {
      console.error(`[ScheduledMessages] Erreur pour tâche #${tâche.id} :`, err);
    }
  }
};