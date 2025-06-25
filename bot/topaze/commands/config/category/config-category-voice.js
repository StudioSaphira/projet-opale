const { SlashCommandBuilder, ChannelType } = require('discord.js');
const db = require('../../../../../shared/utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config-category-voice')
    .setDescription('Configurer la catégorie utilisée pour les canaux vocaux temporaires')
    .addChannelOption(option =>
      option
        .setName('catégorie')
        .setDescription('La catégorie de canaux vocaux à utiliser')
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true)
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    const adminIds = process.env.ADMIN_ID?.split(',') || [];

    const isOwner = ownerIds.includes(userId);
    const isAdminId = adminIds.includes(userId);

    const row = db.prepare('SELECT role_admin_id FROM server_config WHERE guild_id = ?').get(guildId);
    const roleAdminId = row?.role_admin_id;
    const isAdminRole = roleAdminId && interaction.member.roles.cache.has(roleAdminId);

    if (!isOwner && !isAdminId && !isAdminRole) {
      return interaction.reply({
        content: '⛔ Vous n’avez pas la permission d’utiliser cette commande.',
        flags: 64
      });
    }

    const selectedCategory = interaction.options.getChannel('catégorie');

    try {
      db.prepare(`
        INSERT INTO server_config (guild_id, category_voice_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET category_voice_id = excluded.category_voice_id
      `).run(guildId, selectedCategory.id);

      return interaction.reply({
        content: `✅ Catégorie vocale mise à jour : \`${selectedCategory.name}\` (<#${selectedCategory.id}>)`,
        flags: 64
      });
    } catch (error) {
      console.error('[TOPAZE] Erreur DB – /config-category-voice :', error);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};