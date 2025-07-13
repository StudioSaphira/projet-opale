// bot/rubis/events/messages/messageUpdate.js

const db = require('../../../../shared/utils/db');
const { buildEditEmbed } = require('../../../../shared/utils/embed/rubis/log');

module.exports = {
  name: 'messageUpdate',

  async execute(oldMessage, newMessage, client) {
    try {
      // Ignore si pas dans un serveur ou bot
      if (!newMessage.guild || newMessage.author?.bot) return;

      const row = db.prepare(`SELECT channel_id FROM channel_log WHERE type = ?`).get('messageUpdate');
      if (!row || !row.channel_id) {
        console.warn('⚠️ Aucun salon de log défini pour messageUpdate.');
        return;
      }

      const logChannel = await client.channels.fetch(row.channel_id).catch(() => null);
      if (!logChannel) {
        console.warn(`⚠️ Salon de log introuvable : ${row.channel_id}`);
        return;
      }

      const author = newMessage.author?.tag || 'Inconnu';
      const channelMention = `<#${newMessage.channel.id}>`;
      const messageLink = `https://discord.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${newMessage.id}`;

      // Forcer récupération du contenu si oldMessage est partiel
      const oldContent = oldMessage.partial ? '*[Contenu inconnu]*' : (oldMessage.content || '*[Aucun texte]*');
      const newContent = newMessage.content || '*[Aucun texte]*';

      if (oldContent === newContent) return; // Pas de changement détecté

      const embed = buildEditEmbed(
        'Message modifié',
        `Un [message](<${messageLink}>) a été modifié dans ${channelMention}.`,
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
            name: 'Avant',
            value: oldContent.slice(0, 1024),
            inline: false
          },
          {
            name: 'Après',
            value: newContent.slice(0, 1024),
            inline: false
          }
        ]
      );

      await logChannel.send({ embeds: [embed] });
      console.log(`✏️ Message modifié logué : ${newMessage.id}`);

    } catch (err) {
      console.error(`❌ Erreur messageUpdate :`, err);
    }
  }
};