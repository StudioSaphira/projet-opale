// bot/topaze/commands/config/category/config-category-contact.js

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const db = require('../../../../../shared/utils/db');
const { createConfigEmbed } = require('../../../../../shared/utils/embed/topaze/embedTopazeConfig');
const { sendLogConfigToRubis } = require('../../../../../shared/helpers/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config-category-contact')
    .setDescription('Configurer la catégorie utilisée pour les tickets de partenariat ou demandes autres')
    .addChannelOption(option =>
      option
        .setName('catégorie')
        .setDescription('La catégorie de canaux à utiliser pour les tickets partenariat ou autres')
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true)
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    const user = interaction.user;

    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    const adminIds = process.env.ADMIN_ID?.split(',') || [];

    const row = db.prepare('SELECT role_admin_id, category_contact_id FROM server_config WHERE guild_id = ?').get(guildId);
    const adminRoleIds = row?.role_admin_id?.split(',').filter(id => id.trim() !== '') || [];
    const hasAdminRole = adminRoleIds.some(id => member.roles.cache.has(id));
    const isOwner = ownerIds.includes(user.id);
    const isAdmin = adminIds.includes(userId);

    if (!isOwner && !isAdmin && !hasAdminRole) {
      return interaction.reply({
        content: '⛔ Vous n’avez pas la permission d’utiliser cette commande.',
        flags: 64
      });
    }

    const selectedCategory = interaction.options.getChannel('catégorie');

    try {
      if (previousCategoryId && previousCategoryId !== selectedCategory.id) {
        // Sauvegarder l'ancienne valeur
        db.prepare(`
          INSERT INTO old_server_config (guild_id, old_category_contact_id)
          VALUES (?, ?)
          ON CONFLICT(guild_id) DO UPDATE SET old_category_contact_id = excluded.old_category_contact_id
        `).run(guildId, previousCategoryId);
      }

      // Mettre à jour ou insérer la nouvelle catégorie
      db.prepare(`
        INSERT INTO server_config (guild_id, category_contact_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET category_contact_id = excluded.category_contact_id
      `).run(guildId, selectedCategory.id);

      // Embed de confirmation
      const embed = createConfigEmbed('category_contact_id', selectedCategory.id, user);
      await interaction.reply({ embeds: [embed], flags: 64 });

      // Log personnalisé
      const logMessage = previousCategoryId
        ? `La catégorie pour les tickets "contact" a été mise à jour : <#${selectedCategory.id}> (\`${selectedCategory.id}\`) → <#${previousCategoryId}> (\`${previousCategoryId}\`)`
        : `La catégorie pour les tickets "contact" a été définie : <#${selectedCategory.id}> (\`${selectedCategory.id}\`)`;

      await sendLogConfigToRubis(
        interaction.guild,
        interaction.user,
        logMessage,
        interaction.client,
        'Configuration : Tickets',
        '📁'
      );
    } catch (error) {
      console.error('[TOPAZE] Erreur DB – /config-category-contact :', error);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};