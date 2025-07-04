const { EmbedBuilder } = require('discord.js');

const fieldLabels = {
  channel_log_id: '📕 Salon de logs',
  channel_welcome_id: '🎉 Salon de bienvenue',
  channel_leaving_id: '👋 Salon de départ',
  channel_birthday_id: '🎂 Salon d’anniversaire',
  channel_voice_id: '🔊 Salon vocal de création',
  channel_counter_member_id: '👤 Compteur membres',
  channel_counter_bot_id: '🤖 Compteur bots',
  channel_counter_staff_id: '🛡️ Compteur staff',
  channel_counter_boost_id: '🚀 Compteur boosts',
  channel_counter_allmember_id: '👥 Compteur total membres',
  category_voice_id: '📂 Catégorie vocale temporaire',
  category_support_id: '🎫 Catégorie Tickets - Support',
  category_contact_id: '📩 Catégorie Tickets - Contact',
  category_counter_id: '🔢 Catégorie Compteurs',
  role_admin_id: '👑 Rôle Admin',
  role_allstaff_id: '🛡️ Rôle Staff',
  role_mod_id: '🔨 Rôle Modérateur',
  role_boost_id: '🎉 Rôle Booster',
  role_birthday_id: '🎂 Rôle Anniversaire',
  role_member_id: '👤 Rôle Membre'
};

function createConfigEmbed(columnName, newValueId, user) {
  const label = fieldLabels[columnName] || columnName;
  const formattedValue = formatIdByType(columnName, newValueId);

  return new EmbedBuilder()
    .setTitle('✅ Configuration mise à jour')
    .setDescription(`Vous avez modifié **${label}** par ${formattedValue}`)
    .setColor(0x1aa9c9)
    .setTimestamp()
    .setFooter({ text: `Modifié par ${user.tag}`, iconURL: user.displayAvatarURL() });
}

function formatIdByType(columnName, id) {
  if (!id) return 'Non défini';
  if (columnName.startsWith('role_')) return `<@&${id}> (\`${id}\`)`;
  return `<#${id}> (\`${id}\`)`;
}

module.exports = {
  createConfigEmbed
};