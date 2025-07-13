// bot/rubis/events/channels/update.js

const db = require('../../../../shared/utils/db');
const { buildEditEmbed } = require('../../../../shared/utils/embed/rubis/log');

module.exports = {
  name: 'channelUpdate',

  async execute(oldChannel, newChannel, client) {
    console.log(`✏️ Salon modifié : ${oldChannel.name} (${oldChannel.id})`);

    try {
      // === 1) Lire salon de log
      const row = db.prepare(`SELECT channel_id FROM channel_log WHERE type = ?`).get('channelUpdate');
      if (!row || !row.channel_id) {
        console.warn('⚠️ Aucun salon de log défini pour channelUpdate.');
        return;
      }

      const logChannel = await client.channels.fetch(row.channel_id).catch(() => null);
      if (!logChannel) {
        console.warn(`⚠️ Salon de log introuvable : ${row.channel_id}`);
        return;
      }

      // === 2) Déterminer les changements pertinents
      const changes = [];

      if (oldChannel.name !== newChannel.name) {
        changes.push({ name: 'Nom', before: oldChannel.name, after: newChannel.name });
      }

      if ('topic' in oldChannel && oldChannel.topic !== newChannel.topic) {
        changes.push({ name: 'Description', before: oldChannel.topic || 'Aucune', after: newChannel.topic || 'Aucune' });
      }

      if ('nsfw' in oldChannel && oldChannel.nsfw !== newChannel.nsfw) {
        changes.push({ name: 'NSFW', before: oldChannel.nsfw ? '✅' : '❌', after: newChannel.nsfw ? '✅' : '❌' });
      }

      if ('rateLimitPerUser' in oldChannel && oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
        changes.push({ name: 'Slowmode (s)', before: `${oldChannel.rateLimitPerUser}`, after: `${newChannel.rateLimitPerUser}` });
      }

      if (oldChannel.parentId !== newChannel.parentId) {
        const oldParent = oldChannel.parent?.name || 'Aucune';
        const newParent = newChannel.parent?.name || 'Aucune';
        changes.push({ name: 'Catégorie', before: oldParent, after: newParent });
      }

      if (oldChannel.type !== newChannel.type) {
        changes.push({ name: 'Type', before: oldChannel.type, after: newChannel.type });
      }

      if (changes.length === 0) {
        console.log('ℹ️ Aucun changement loggable détecté.');
        return;
      }

      // === 3) Créer l’embed
      const embed = buildEditEmbed(
        `Salon modifié`,
        `Des modifications ont été apportées au salon **${oldChannel.name}**.`,
        changes
      );

      // === 4) Envoyer le log
      await logChannel.send({ embeds: [embed] });
      console.log(`✅ Log envoyé pour channelUpdate.`);

    } catch (error) {
      console.error('❌ Erreur channelUpdate :', error);
    }
  }
};