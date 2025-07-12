// bot/rubis/events/channels/create.js

const db = require('../../../../shared/utils/db');
const { buildAddEmbed } = require('../../../../shared/utils/embed/rubis/log');

module.exports = {
  name: 'channelCreate',

  async execute(channel, client) {
    console.log(`📌 Nouveau salon créé : ${channel.name} (${channel.id})`);

    try {
      // === 1) Récupérer l’ID du salon de logs depuis SQLite ===
      const query = `SELECT channel_id FROM channel_log WHERE type = ?`;
      const row = db.prepare(query).get('channelCreate');

      if (!row || !row.channel_id) {
        console.warn('⚠️ Aucun salon de log défini pour channelCreate.');
        return;
      }

      const logChannel = await client.channels.fetch(row.channel_id).catch(() => null);
      if (!logChannel) {
        console.warn(`⚠️ Salon de log introuvable : ${row.channel_id}`);
        return;
      }

      // === 2) Créer l’embed avec le constructeur Add ===
      const embed = buildAddEmbed(
        'Nouveau salon créé',
        `Un salon a été créé : **${channel.name}** (\`${channel.id}\`)`,
        [
          { name: 'Type', value: `${channel.type}`, inline: true },
          { name: 'Catégorie', value: `${channel.parent?.name || 'Aucune'}`, inline: true },
          { name: 'Guild', value: `${channel.guild?.name || 'Inconnue'}`, inline: true }
        ]
      );

      // === 3) Envoyer l’embed ===
      await logChannel.send({ embeds: [embed] });
      console.log(`✅ Log envoyé dans ${logChannel.id} pour channelCreate.`);

    } catch (error) {
      console.error(`❌ Erreur channelCreate :`, error);
    }
  },
};