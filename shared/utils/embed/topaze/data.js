const { EmbedBuilder } = require('discord.js');

function createDataEmbed(row, guild, index = null, total = null) {
  const embed = new EmbedBuilder()
    .setTitle('📊 Paramètres de configuration enregistrés')
    .setDescription(`Serveur : **${guild.name || 'Inconnu'}**`)
    .addFields(
      // 🟦 SALONS
      { name: '📕 Salon de logs', value: formatChannel(row.channel_log_id), inline: false },
      { name: '🎉 Salon de bienvenue', value: formatChannel(row.channel_welcome_id), inline: false },
      { name: '👋 Salon de départ', value: formatChannel(row.channel_leaving_id), inline: false },
      { name: '🎂 Salon d’anniversaire', value: formatChannel(row.channel_birthday_id), inline: false },
      { name: '🔊 Salon vocal de création', value: formatChannel(row.channel_voice_id), inline: false },
      { name: '👤 Compteur membres', value: formatChannel(row.channel_counter_member_id), inline: false },
      { name: '🤖 Compteur bots', value: formatChannel(row.channel_counter_bot_id), inline: false },
      { name: '🛡️ Compteur staff', value: formatChannel(row.channel_counter_staff_id), inline: false },
      { name: '🚀 Compteur boosts', value: formatChannel(row.channel_counter_boost_id), inline: false },
      { name: '👥 Compteur total membres', value: formatChannel(row.channel_counter_allmember_id), inline: false },

      // 🟪 CATÉGORIES
      { name: '📂 Catégorie vocale temporaire', value: formatChannel(row.category_voice_id), inline: false },
      { name: '🎫 Catégorie Tickets - Support', value: formatChannel(row.category_support_id), inline: false },
      { name: '📩 Catégorie Tickets - Contact', value: formatChannel(row.category_contact_id), inline: false },
      { name: '🔢 Catégorie Compteurs', value: formatChannel(row.category_counter_id), inline: false },

      // 🟨 RÔLES
      { name: '👑 Rôle Admin', value: formatRole(row.role_admin_id), inline: false },
      { name: '🛡️ Rôle Staff', value: formatRole(row.role_allstaff_id), inline: false },
      { name: '🔨 Rôle Modérateur', value: formatRole(row.role_mod_id), inline: false },
      { name: '🎉 Rôle Booster', value: formatRole(row.role_boost_id), inline: false },
      { name: '🎂 Rôle Anniversaire', value: formatRole(row.role_birthday_id), inline: false },
      { name: '👤 Rôle Membre', value: formatRole(row.role_member_id), inline: false }
    )
    .setColor(0x2ecc71);

  if (index !== null && total !== null) {
    embed.setFooter({ text: `Index ${index + 1}/${total} – Serveur ID : ${row.guild_id}` });
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