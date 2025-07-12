// shared/utils/embed/rubis/log.js

const { EmbedBuilder } = require('discord.js');

const COLORS = {
  edit: 0x1aa9c9,      // Bleu modification
  add: 0x2ecc71,       // Vert ajout
  delete: 0xe74c3c,    // Rouge suppression
  config: 0xf1c40f,    // Jaune configuration
  cosmetics: 0x8943e6   // Violet cosmétique
};

/**
 * Log pour une action d'édition
 * @param {string} title
 * @param {string} description
 * @param {Array} fields
 * @returns EmbedBuilder
 */
function buildEditEmbed(title, description, fields = []) {
  return new EmbedBuilder()
    .setTitle(`✏️ ${title}`)
    .setDescription(description)
    .setColor(COLORS.edit)
    .addFields(fields)
    .setTimestamp();
}

/**
 * Log pour une action d'ajout
 * @param {string} title
 * @param {string} description
 * @param {Array} fields
 * @returns EmbedBuilder
 */
function buildAddEmbed(title, description, fields = []) {
  return new EmbedBuilder()
    .setTitle(`➕ ${title}`)
    .setDescription(description)
    .setColor(COLORS.add)
    .addFields(fields)
    .setTimestamp();
}

/**
 * Log pour une action de suppression
 * @param {string} title
 * @param {string} description
 * @param {Array} fields
 * @returns EmbedBuilder
 */
function buildDeleteEmbed(title, description, fields = []) {
  return new EmbedBuilder()
    .setTitle(`🗑️ ${title}`)
    .setDescription(description)
    .setColor(COLORS.delete)
    .addFields(fields)
    .setTimestamp();
}

/**
 * Log pour une action de configuration
 * @param {string} title
 * @param {string} description
 * @param {Array} fields
 * @returns EmbedBuilder
 */
function buildConfigEmbed(title, description, fields = []) {
  return new EmbedBuilder()
    .setTitle(`⚙️ ${title}`)
    .setDescription(description)
    .setColor(COLORS.config)
    .addFields(fields)
    .setTimestamp();
}

/**
 * Log pour une action cosmétique (avatar, emoji, bannière)
 * @param {string} title
 * @param {string} description
 * @param {Array} fields
 * @returns EmbedBuilder
 */
function buildCosmeticsEmbed(title, description, fields = []) {
  return new EmbedBuilder()
    .setTitle(`✨ ${title}`)
    .setDescription(description)
    .setColor(COLORS.cosmetics)
    .addFields(fields)
    .setTimestamp();
}

module.exports = {
  buildEditEmbed,
  buildAddEmbed,
  buildDeleteEmbed,
  buildConfigEmbed,
  buildCosmeticsEmbed
};