// bot/rubis/events/messages/bulkMessageDelete.js

const db = require('../../../../shared/utils/db');
const { buildDeleteEmbed } = require('../../../../shared/utils/embed/rubis/log');
const { AttachmentBuilder } = require('discord.js');

module.exports = {
  name: 'messageBulkDelete',

  async execute(messages, client) {
    try {
      const row = db.prepare(`SELECT channel_id FROM channel_log WHERE type = ?`).get('bulkMessageDelete');
      if (!row || !row.channel_id) {
        console.warn('⚠️ Aucun salon de log défini pour bulkMessageDelete.');
        return;
      }

      const logChannel = await client.channels.fetch(row.channel_id).catch(() => null);
      if (!logChannel) {
        console.warn(`⚠️ Salon de log introuvable : ${row.channel_id}`);
        return;
      }

      const count = messages.size;
      const channel = messages.first()?.channel;

      // === 1) Récupérer les auteurs
      const authors = new Set();
      messages.forEach(msg => {
        if (msg.author) authors.add(msg.author.tag);
      });

      // === 2) Générer un log texte (facultatif)
      const content = Array.from(messages.values())
        .reverse()
        .map(m => `[${m.createdAt.toISOString()}] ${m.author?.tag || 'inconnu'}: ${m.content || '[embed/fichier]'}`)
        .join('\n');

      const attachment = new AttachmentBuilder(Buffer.from(content, 'utf-8'), {
        name: `bulkDelete-${Date.now()}.txt`
      });

      // === 3) Créer l’embed
      const embed = buildDeleteEmbed(
        'Suppression massive de messages',
        `Une suppression de **${count} message(s)** a eu lieu dans <#${channel.id}>.`,
        [
          {
            name: 'Canal concerné',
            value: `<#${channel.id}>`,
            inline: true
          },
          {
            name: 'Nombre de messages',
            value: `${count}`,
            inline: true
          },
          {
            name: 'Auteurs concernés',
            value: authors.size > 0 ? [...authors].slice(0, 5).join(', ') + (authors.size > 5 ? '...' : '') : 'Inconnu',
            inline: false
          }
        ]
      );

      // === 4) Envoyer log + fichier
      await logChannel.send({ embeds: [embed], files: [attachment] });
      console.log(`🧹 Suppression massive loguée : ${count} messages`);

    } catch (err) {
      console.error(`❌ Erreur bulkMessageDelete :`, err);
    }
  }
};