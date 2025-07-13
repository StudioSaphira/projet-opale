// bot/rubis/events/messages/messageDelete.js

const db = require('../../../../shared/utils/db');
const { buildDeleteEmbed } = require('../../../../shared/utils/embed/rubis/log');
const { AttachmentBuilder } = require('discord.js');

module.exports = {
  name: 'messageDelete',

  async execute(message, client) {
    try {
      if (!message.guild || message.author?.bot) return;

      const row = db.prepare(`SELECT channel_id FROM channel_log WHERE type = ?`).get('messageDelete');
      if (!row || !row.channel_id) {
        console.warn('⚠️ Aucun salon de log défini pour messageDelete.');
        return;
      }

      const logChannel = await client.channels.fetch(row.channel_id).catch(() => null);
      if (!logChannel) {
        console.warn(`⚠️ Salon de log introuvable : ${row.channel_id}`);
        return;
      }

      const author = message.author?.tag || 'Inconnu';
      const content = message.content || '[Contenu vide ou supprimé]';
      const channelMention = `<#${message.channel.id}>`;

      // === Préparation de l'embed
      const embed = buildDeleteEmbed(
        'Message supprimé',
        `Un message a été supprimé dans ${channelMention}.`,
        [
          {
            name: 'Auteur',
            value: author,
            inline: true
          },
          {
            name: 'Salon',
            value: channelMention,
            inline: true
          },
          {
            name: 'Contenu',
            value: content.length < 1000 ? content : content.slice(0, 1000) + '…',
            inline: false
          }
        ]
      );

      const files = [];

      // === Si contenu très long, ajoute un fichier
      if (content.length >= 1000) {
        const buffer = Buffer.from(content, 'utf-8');
        files.push(new AttachmentBuilder(buffer, { name: `deleted-message-${Date.now()}.txt` }));
      }

      // === Ajout des pièces jointes si présentes
      if (message.attachments.size > 0) {
        message.attachments.forEach(att => {
          files.push(att.url); // Discord gère automatiquement l'upload si string URL
        });
      }

      await logChannel.send({ embeds: [embed], files });
      console.log(`🗑️ Message supprimé logué dans ${message.channel.name}`);

    } catch (err) {
      console.error(`❌ Erreur messageDelete :`, err);
    }
  }
};