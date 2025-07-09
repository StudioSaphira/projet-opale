// bot/topaze/commands/data/data.js

const { SlashCommandBuilder } = require('discord.js');
const db = require('../../../../../shared/utils/db');
const logger = require('../../../../../shared/helpers/logger');
const { createDataEmbed } = require('../../../../../shared/utils/embed/topaze/dataEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('data')
    .setDescription('Affiche les paramètres de configuration enregistrés pour ce serveur'),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    const altOwnerIds = process.env.ALT_OWNER_ID?.split(',') || [];
    const adminIds = process.env.ADMIN_ID?.split(',') || [];

    const row = db.prepare('SELECT admin_id FROM role WHERE guild_id = ?').get(guildId);
    const roleAdminIds = row?.admin_id ? row.admin_id.split(',').map(id => id.trim()) : [];
    const isAdminRole = roleAdminIds.some(id => interaction.member.roles.cache.has(id));

    const isOwner = ownerIds.includes(userId);
    const isAltOwner = altOwnerIds.includes(userId);
    const isAdminId = adminIds.includes(userId);

    if (!isOwner && !isAltOwner && !isAdminId && !isAdminRole) {
      return interaction.reply({
        content: '⛔ Vous n’avez pas la permission d’utiliser cette commande.',
        flags: 64
      });
    }

    try {
      // Récupération des tables principales
      const data = {
        channel_log: db.prepare('SELECT * FROM channel_log WHERE guild_id = ?').get(guildId) || {},
        channel_welcome: db.prepare('SELECT * FROM channel_welcome WHERE guild_id = ?').get(guildId) || {},
        channel_leaving: db.prepare('SELECT * FROM channel_leaving WHERE guild_id = ?').get(guildId) || {},
        channel_birthday: db.prepare('SELECT * FROM channel_birthday WHERE guild_id = ?').get(guildId) || {},
        channel_voice: db.prepare('SELECT * FROM channel_voice WHERE guild_id = ?').get(guildId) || {},
        channel_counter: db.prepare('SELECT * FROM channel_counter WHERE guild_id = ?').get(guildId) || {},
        category: db.prepare('SELECT * FROM category WHERE guild_id = ?').get(guildId) || {},
        role: db.prepare('SELECT * FROM role WHERE guild_id = ?').get(guildId) || {}
      };

      const embed = createDataEmbed(data, interaction.guild);

      await interaction.reply({ embeds: [embed], flags: 64 });

      logger.info(`[Topaze] /data exécuté par ${interaction.user.tag} sur ${interaction.guild.name}`);

    } catch (error) {
      logger.error(`[Topaze] Erreur DB – /data : ${error.stack}`);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de la récupération des données.',
        flags: 64
      });
    }
  }
};