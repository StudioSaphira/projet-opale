// bot/topaze/commands/config/category/counter.js

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const db = require('../../../../../shared/utils/db');
const logger = require('../../../../../shared/helpers/logger');
const { sendLogConfigToRubis } = require('../../../../../shared/helpers/logger');
const { createConfigEmbed } = require('../../../../../shared/utils/embed/topaze/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config-category-counter')
    .setDescription('Configurer la catégorie pour les compteurs')
    .addChannelOption(option =>
      option
        .setName('catégorie')
        .setDescription('La catégorie de canaux pour les compteurs')
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
      const current = db.prepare('SELECT counter_id FROM category WHERE guild_id = ?').get(guildId);
      const oldCategoryId = current?.counter_id;

      if (oldCategoryId && oldCategoryId !== selectedCategory.id) {
        db.prepare(`
          INSERT INTO category (guild_id, old_counter_id)
          VALUES (?, ?)
          ON CONFLICT(guild_id) DO UPDATE SET old_counter_id = excluded.old_counter_id
        `).run(guildId, oldCategoryId);

        logger.info(`[Topaze] Ancienne catégorie compteurs sauvegardée : ${oldCategoryId}`);
      }

      db.prepare(`
        INSERT INTO category (guild_id, counter_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET counter_id = excluded.counter_id
      `).run(guildId, selectedCategory.id);

      const embed = createConfigEmbed('counter_id', selectedCategory.id, user);
      await interaction.reply({ embeds: [embed], flags: 64 });

      const logMessage = oldCategoryId && oldCategoryId !== selectedCategory.id
        ? `La catégorie pour les compteurs a été mise à jour : <#${selectedCategory.id}> (\`${selectedCategory.id}\`) → Ancienne : <#${oldCategoryId}> (\`${oldCategoryId}\`)`
        : `La catégorie pour les compteurs a été définie : <#${selectedCategory.id}> (\`${selectedCategory.id}\`)`;

      logger.info(`[Topaze] ${logMessage}`);

      await sendLogConfigToRubis(
        interaction.guild,
        interaction.user,
        logMessage,
        interaction.client,
        'Configuration : Compteurs',
        '📊'
      );

    } catch (error) {
      logger.error(`[Topaze] Erreur DB – /config-category-counter : ${error.stack}`);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};