const { SlashCommandBuilder, ChannelType } = require('discord.js');
const db = require('../../../../../shared/utils/db');
const { createConfigEmbed } = require('../../../../../shared/utils/embed/topaze/embedTopazeConfig');
const { sendLogConfigToRubis } = require('../../../../../shared/helpers/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config-category-counter')
    .setDescription('Configurer la catégorie utilisée pour les compteurs de membres')
    .addChannelOption(option =>
      option
        .setName('catégorie')
        .setDescription('La catégorie de canaux à utiliser pour les compteurs')
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true)
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    const user = interaction.user;

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
        INSERT INTO server_config (guild_id, category_counter_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET category_counter_id = excluded.category_counter_id
      `).run(guildId, selectedCategory.id);

      const embed = createConfigEmbed('category_counter_id', selectedCategory.id, user);
      await interaction.reply({ embeds: [embed], flags: 64 });

      await sendLogConfigToRubis(
        interaction.guild,
        interaction.user,
        `La catégorie des compteurs a été mise à jour : <#${selectedCategory.id}> (\`${selectedCategory.id}\``,
        interaction.client,
        'Configuration : Compteurs',
        '📊'
      );
    } catch (error) {
      console.error('[TOPAZE] Erreur DB – /config-category-counter :', error);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};