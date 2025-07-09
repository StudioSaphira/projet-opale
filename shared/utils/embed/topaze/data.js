// shared/utils/embed/topaze/dataEmbed.js

const { EmbedBuilder } = require('discord.js');

/**
 * @param {Object} data - Toutes les tables groupées :
 * {
 *   channel_log: { channel_id: ... },
 *   channel_welcome: { channel_id: ... },
 *   channel_counter: { member_id: ..., bot_id: ..., ... },
 *   category: { counter_id: ..., ... },
 *   role: { admin_id: ..., ... }
 * }
 */
function createDataEmbed(data, guild, index = null, total = null) {
  const embed = new EmbedBuilder()
    .setTitle('📊 Paramètres de configuration enregistrés')
    .setDescription(`Serveur : **${guild.name || 'Inconnu'}**`)

    // 🟦 SALONS
    .addFields(
      { name: '📕 Salon de logs', value: formatChannel(data.channel_log?.channel_id), inline: false },
      { name: '🎉 Salon de bienvenue', value: formatChannel(data.channel_welcome?.channel_id), inline: false },
      { name: '👋 Salon de départ', value: formatChannel(data.channel_leaving?.channel_id), inline: false },
      { name: '🎂 Salon d’anniversaire', value: formatChannel(data.channel_birthday?.channel_id), inline: false },
      { name: '🔊 Salon vocal de création', value: formatChannel(data.channel_voice?.channel_id), inline: false },

      // 🟦 Compteurs
      { name: '👤 Compteur membres', value: formatChannel(data.channel_counter?.member_id), inline: false },
      { name: '🤖 Compteur bots', value: formatChannel(data.channel_counter?.bot_id), inline: false },
      { name: '🛡️ Compteur staff', value: formatChannel(data.channel_counter?.staff_id), inline: false },
      { name: '🚀 Compteur boosts', value: formatChannel(data.channel_counter?.boost_id), inline: false },
      { name: '👥 Compteur total membres', value: formatChannel(data.channel_counter?.allmember_id), inline: false },

      // 🟪 Catégories
      { name: '📂 Catégorie vocale temporaire', value: formatChannel(data.category?.voice_id), inline: false },
      { name: '🎫 Catégorie Tickets - Support', value: formatChannel(data.category?.support_id), inline: false },
      { name: '📩 Catégorie Tickets - Contact', value: formatChannel(data.category?.contact_id), inline: false },
      { name: '🔢 Catégorie Compteurs', value: formatChannel(data.category?.counter_id), inline: false },

      // 🟨 Rôles
      { name: '👑 Rôle Admin', value: formatRole(data.role?.admin_id), inline: false },
      { name: '🛡️ Rôle Staff', value: formatRole(data.role?.allstaff_id), inline: false },
      { name: '🔨 Rôle Modérateur', value: formatRole(data.role?.mod_id), inline: false },
      { name: '🎉 Rôle Booster', value: formatRole(data.role?.boost_id), inline: false },
      { name: '🎂 Rôle Anniversaire', value: formatRole(data.role?.birthday_id), inline: false },
      { name: '👤 Rôle Membre', value: formatRole(data.role?.member_id), inline: false }
    )
    .setColor(0x2ecc71);

  if (index !== null && total !== null) {
    embed.setFooter({ text: `Index ${index + 1}/${total} – Serveur ID : ${guild.id}` });
  } else {
    embed.setFooter({ text: `ID du serveur : ${guild.id}` });
  }

  return embed;
}

function formatChannel(id) {
  return id ? `<#${id}> (\`${id}\`)` : 'Non défini';
}

function formatRole(id) {
  return id ? `<@&${id}> (\`${id}\`)` : 'Non défini';
}

module.exports = {
  createDataEmbed
};