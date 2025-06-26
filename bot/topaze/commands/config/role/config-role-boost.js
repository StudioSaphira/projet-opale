// bot/topaze/commands/config/counter/config-role-boost.js

const { SlashCommandBuilder } = require('discord.js');
const db = require('../../../../../shared/utils/db');
const { createConfigEmbed } = require('../../../../../shared/utils/embed/topaze/embedTopazeConfig');
const { sendLogConfigToRubis } = require('../../../../../shared/helpers/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config-role-boost')
    .setDescription('Définit le rôle des boosteurs pour ce serveur')
    .addRoleOption(option =>
      option.setName('rôle')
        .setDescription('Le rôle à utiliser pour les boosteurs')
        .setRequired(true)
    ),

  async execute(interaction) {
    const role = interaction.options.getRole('rôle');
    const guild = interaction.guild;
    const user = interaction.user;
    const guildId = guild.id;
    const userId = user.id;

    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    const adminIds = process.env.ADMIN_ID?.split(',') || [];

    const config = db.prepare('SELECT role_admin_id, role_boost_id FROM server_config WHERE guild_id = ?').get(guildId);
    const previousRoleId = config?.role_boost_id;
    const adminRoles = config.role_admin_id?.split(',') || [];
    const hasAdminRole = adminRoles.some(id => interaction.member.roles.cache.has(id));
    const isOwner = ownerIds.includes(userId);
    const isAdmin = adminIds.includes(userId);

    if (!isOwner && !isAdmin && !hasAdminRole) {
      return interaction.reply({
        content: '⛔ Vous n’avez pas l’autorisation de modifier ce paramètre.',
        flags: 64
      });
    }

    try {
      if (previousRoleId && previousRoleId !== role.id) {
        db.prepare(`
          INSERT INTO old_server_config (guild_id, old_role_boost_id)
          VALUES (?, ?)
          ON CONFLICT(guild_id) DO UPDATE SET old_role_boost_id = excluded.old_role_boost_id
        `).run(guildId, previousRoleId);
      }

      db.prepare(`
        INSERT INTO server_config (guild_id, role_boost_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET role_boost_id = excluded.role_boost_id
      `).run(guildId, role.id);

      const embed = createConfigEmbed('role_boost_id', role.id, user);
      await interaction.reply({ embeds: [embed], flags: 64 });

      const logMessage = previousRoleId
        ? `Le rôle boosteur a été mis à jour : <@&${previousRoleId}> → <@&${role.id}> (\`${role.id}\`)`
        : `Le rôle boosteur a été défini : <@&${role.id}> (\`${role.id}\`)`;

      await sendLogConfigToRubis(
        guild,
        user,
        logMessage,
        interaction.client,
        'Configuration : Rôles',
        '🚀'
      );
    } catch (err) {
      console.error('[TOPAZE] Erreur DB – /config-role-boost :', err);
      await interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};