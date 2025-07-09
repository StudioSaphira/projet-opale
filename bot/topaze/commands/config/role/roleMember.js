// bot/topaze/commands/config/counter/roleMember.js

const { SlashCommandBuilder } = require('discord.js');
const db = require('../../../../../shared/utils/db');
const logger = require('../../../../../shared/helpers/logger');
const { sendLogConfigToRubis } = require('../../../../../shared/helpers/logger');
const { createConfigEmbed } = require('../../../../../shared/utils/embed/topaze/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config-role-member')
    .setDescription('Définit le rôle des membres de base')
    .addRoleOption(option =>
      option
        .setName('rôle')
        .setDescription('Le rôle à définir comme rôle de membre')
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

    const selectedRole = interaction.options.getRole('rôle');

    try {
      const current = db.prepare('SELECT member_id FROM role WHERE guild_id = ?').get(guildId);
      const oldRoleId = current?.member_id;

      if (oldRoleId && oldRoleId !== selectedRole.id) {
        db.prepare(`
          INSERT INTO role (guild_id, old_member_id)
          VALUES (?, ?)
          ON CONFLICT(guild_id) DO UPDATE SET old_member_id = excluded.old_member_id
        `).run(guildId, oldRoleId);

        logger.info(`[Topaze] Ancien rôle "member" sauvegardé : ${oldRoleId}`);
      }

      db.prepare(`
        INSERT INTO role (guild_id, member_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET member_id = excluded.member_id
      `).run(guildId, selectedRole.id);

      const embed = createConfigEmbed('role_member_id', selectedRole.id, user);
      await interaction.reply({ embeds: [embed], flags: 64 });

      const logMessage = oldRoleId && oldRoleId !== selectedRole.id
        ? `Le rôle membre a été mis à jour : <@&${selectedRole.id}> (\`${selectedRole.id}\`) → Ancien : <@&${oldRoleId}> (\`${oldRoleId}\`)`
        : `Le rôle membre a été défini : <@&${selectedRole.id}> (\`${selectedRole.id}\`)`;

      logger.info(`[Topaze] ${logMessage}`);

      await sendLogConfigToRubis(
        interaction.guild,
        interaction.user,
        logMessage,
        interaction.client,
        'Configuration : Rôles',
        '👤'
      );

    } catch (error) {
      logger.error(`[Topaze] Erreur DB – /config-role-member : ${error.stack}`);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};