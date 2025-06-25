// bot/rubis/events/system/customLogReceiver.js

const { Events } = require('discord.js');
const db = require('../../../../shared/utils/db'); // accès à la DB partagée
const { createLogConfigEmbed } = require('../../../../shared/utils/embed/embedRubisLog');

module.exports = {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    client.on('logEventTopaze', async (data) => {
      console.log('[Rubis] Reçu événement logEventTopaze :', data);

      try {
        const { guildId, title, message, icon, botName, botAvatar, fromClientId } = data;
        const ID_COR = process.env.ID_COR;
        if (fromClientId !== ID_COR) {
          console.warn(`[Rubis] Log ignoré : émis par ${fromClientId}, attendu ${ID_COR}`);
          return;
        }

        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
          console.warn(`[Rubis] Guilde introuvable : ${guildId}`);
          return;
        }

        const row = db.prepare('SELECT channel_log_id FROM server_config WHERE guild_id = ?').get(guildId);
        const logChannelId = row?.channel_log_id;
        if (!logChannelId) {
          console.warn(`[Rubis] Aucun salon de log défini pour la guilde ${guildId}`);
          return;
        }

        const channel = guild.channels.cache.get(logChannelId);
        if (!channel || !channel.isTextBased()) {
          console.warn(`[Rubis] Le salon ${logChannelId} est invalide ou non textuel`);
          return;
        }

        const embed = createLogConfigEmbed({ title, message, icon, botName, botAvatar });
        await channel.send({ embeds: [embed] });
        console.log(`[Rubis] ✔️ Log envoyé dans ${guild.name} (${guild.id})`);
      } catch (err) {
        console.error('[Rubis] ❌ Erreur lors de l’envoi du log :', err);
      }
    });
  }
};