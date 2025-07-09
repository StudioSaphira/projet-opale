// shared/utils/embed/topaze/config.js

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
  role_boost_id: '🎉 Rôle Booster',
  role_birthday_id: '🎂 Rôle Anniversaire',
  role_member_id: '👤 Rôle Membre'
};

/**
 * Crée un embed de confirmation de modification de config.
 * @param {string} columnName - Nom du champ modifié (ex : channel_log_id)
 * @param {string} newValueId - Nouvelle valeur
 * @param {string|null} oldValueId - Ancienne valeur (peut être null)
 * @param {User} user - L'utilisateur Discord
 */
function createConfigEmbed(columnName, newValueId, oldValueId, user) {
  const label = fieldLabels[columnName] || columnName;

  const formattedNew = formatIdByType(columnName, newValueId);
  const formattedOld = formatIdByType(columnName, oldValueId);

  const description = oldValueId
    ? `Ancienne valeur : ${formattedOld}\nNouvelle valeur : ${formattedNew}`
    : `Vous avez modifié **${label}** par ${formattedNew}`;

  return new EmbedBuilder()
    .setTitle(`✅ Modification : ${label}`)
    .setDescription(description)
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