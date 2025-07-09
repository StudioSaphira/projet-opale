// bot/topaze/commands/config/category/support.js

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const db = require('../../../../../shared/utils/db');
const logger = require('../../../../../shared/helpers/logger');
const { sendLogConfigToRubis } = require('../../../../../shared/helpers/logger');
const { createConfigEmbed } = require('../../../../../shared/utils/embed/topaze/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config-category-support')
    .setDescription('Configurer la catégorie pour les tickets de support')
    .addChannelOption(option =>
      option
        .setName('catégorie')
        .setDescription('La catégorie de canaux pour les tickets support')
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true)
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    const user = interaction.user;

    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    const altOwnerIds = process.env.ALT_OWNER_ID?.split(',') || [];
    const adminIds = process.env.ADMIN_ID?.split(',') || [];

    // Nouvelle table `role` pour admin_id
    const row = db.prepare('SELECT admin_id FROM role WHERE guild_id = ?').get(guildId);
    const roleAdminId = row?.admin_id;

    const isOwner = ownerIds.includes(userId);
    const isAltOwner = altOwnerIds.includes(userId);
    const isAdminId = adminIds.includes(userId);
    const isAdminRole = roleAdminId && interaction.member.roles.cache.has(roleAdminId);

    if (!isOwner && !isAltOwner && !isAdminId && !isAdminRole) {
      return interaction.reply({
        content: '⛔ Vous n’avez pas la permission d’utiliser cette commande.',
        flags: 64
      });
    }

    const selectedCategory = interaction.options.getChannel('catégorie');

    try {
      const current = db.prepare('SELECT support_id FROM category WHERE guild_id = ?').get(guildId);
      const oldCategoryId = current?.support_id;

      if (oldCategoryId && oldCategoryId !== selectedCategory.id) {
        db.prepare(`
          INSERT INTO category (guild_id, old_support_id)
          VALUES (?, ?)
          ON CONFLICT(guild_id) DO UPDATE SET old_support_id = excluded.old_support_id
        `).run(guildId, oldCategoryId);

        logger.info(`[Topaze] Ancienne catégorie support sauvegardée : ${oldCategoryId}`);
      }

      db.prepare(`
        INSERT INTO category (guild_id, support_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET support_id = excluded.support_id
      `).run(guildId, selectedCategory.id);

      const embed = createConfigEmbed('support_id', selectedCategory.id, user);
      await interaction.reply({ embeds: [embed], flags: 64 });

      const logMessage = oldCategoryId && oldCategoryId !== selectedCategory.id
        ? `La catégorie pour les tickets support a été mise à jour : <#${selectedCategory.id}> (\`${selectedCategory.id}\`) → Ancienne : <#${oldCategoryId}> (\`${oldCategoryId}\`)`
        : `La catégorie pour les tickets support a été définie : <#${selectedCategory.id}> (\`${selectedCategory.id}\`)`;

      logger.info(`[Topaze] ${logMessage}`);

      await sendLogConfigToRubis(
        interaction.guild,
        interaction.user,
        logMessage,
        interaction.client,
        'Configuration : Tickets',
        '🛠️'
      );

    } catch (error) {
      logger.error(`[Topaze] Erreur DB – /config-category-support : ${error.stack}`);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};