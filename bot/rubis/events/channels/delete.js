// bot/rubis/events/channels/delete.js

const db = require('../../../../shared/utils/db');
const { buildDeleteEmbed } = require('../../../../shared/utils/embed/rubis/log');

module.exports = {
  name: 'channelDelete',

  async execute(channel, client) {
    console.log(`🗑️ Salon supprimé : ${channel.name} (${channel.id})`);

    try {
      // === 1) Lire ID du salon de log depuis la base ===
      const row = db.prepare(`SELECT channel_id FROM channel_log WHERE type = ?`).get('channelDelete');

      if (!row || !row.channel_id) {
        console.warn('⚠️ Aucun salon de log défini pour channelDelete.');
        return;
      }

      const logChannel = await client.channels.fetch(row.channel_id).catch(() => null);
      if (!logChannel) {
        console.warn(`⚠️ Salon de log introuvable : ${row.channel_id}`);
        return;
      }

      // === 2) Construire l'embed Delete ===
      const embed = buildDeleteEmbed(
        'Salon supprimé',
        `Un salon a été supprimé du serveur.`,
        [
          { name: 'Nom', value: `${channel.name}`, inline: true },
          { name: 'ID', value: `${channel.id}`, inline: true },
          { name: 'Catégorie', value: `${channel.parent?.name || 'Aucune'}`, inline: true },
          { name: 'Type', value: `${channel.type}`, inline: true },
          { name: 'Guild', value: `${channel.guild?.name || 'Inconnue'}`, inline: false }
        ]
      );

      // === 3) Envoyer l’embed ===
      await logChannel.send({ embeds: [embed] });
      console.log(`✅ Log envoyé pour channelDelete.`);

    } catch (error) {
      console.error(`❌ Erreur channelDelete :`, error);
    }
  }
};