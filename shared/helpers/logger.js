const { EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Chemin sécurisé vers la base
const dbPath = path.resolve(__dirname, '../database/saphira.sqlite');

// Vérifie que le dossier parent existe
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

// === Envoi de log ===
async function sendLogToRubis(guild, user, description) {
  try {
    const logChannelId = getLogChannelIdForGuild(guild.id);
    if (!logChannelId) return;

    const embed = new EmbedBuilder()
      .setTitle('🔧 Configuration Modifiée')
      .setDescription(description)
      .setColor(0x3498db)
      .setTimestamp()
      .setFooter({ text: `Modifié par ${user.tag}`, iconURL: user.displayAvatarURL() });

    const channel = await guild.channels.fetch(logChannelId);
    if (!channel) return;

    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error('Erreur lors de l’envoi du log à Rubis :', err);
  }
}

// === Récupère l'ID du salon de logs depuis la DB ===
function getLogChannelIdForGuild(guildId) {
  const db = require('../utils/db');

  const result = db.prepare('SELECT log_channel_id FROM server_config WHERE guild_id = ?').get(guildId);
  return result?.log_channel_id;
}

module.exports = { sendLogToRubis };