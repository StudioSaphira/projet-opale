// bot/topaze/commands/config/role/remove-role-staff.js

const { SlashCommandBuilder } = require('discord.js');
const db = require('../../../../../shared/utils/db');
const { createConfigEmbed } = require('../../../../../shared/utils/embed/topaze/embedTopazeConfig');
const { sendLogConfigToRubis } = require('../../../../../shared/helpers/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove-role-staff')
    .setDescription('Retire un rôle des rôles de staff généraux')
    .addRoleOption(option =>
      option.setName('rôle')
        .setDescription('Le rôle à retirer de la liste des rôles staff')
        .setRequired(true)
    ),

  async execute(interaction) {
    const role = interaction.options.getRole('rôle');
    const guild = interaction.guild;
    const member = interaction.member;
    const user = interaction.user;
    const guildId = guild.id;

    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    const adminIds = process.env.ADMIN_ID?.split(',') || [];

    const config = db.prepare('SELECT role_admin_id, role_allstaff_id FROM server_config WHERE guild_id = ?').get(guildId);
    const roleAdminIds = config?.role_admin_id?.split(',').filter(Boolean) || [];
    const currentStaffRoles = config?.role_allstaff_id?.split(',').map(id => id.trim()).filter(Boolean) || [];

    const isOwner = ownerIds.includes(user.id);
    const isAdmin = adminIds.includes(user.id);
    const hasAdminRole = roleAdminIds.some(id => member.roles.cache.has(id));

    if (!isOwner && !isAdmin && !hasAdminRole) {
      return interaction.reply({
        content: '⛔ Vous n’avez pas l’autorisation d’utiliser cette commande.',
        flags: 64
      });
    }

    if (!currentStaffRoles.includes(role.id)) {
      return interaction.reply({
        content: `ℹ️ Le rôle <@&${role.id}> n’est pas enregistré comme rôle de staff.`,
        flags: 64
      });
    }

    const updatedRoles = currentStaffRoles.filter(id => id !== role.id);
    const updatedValue = updatedRoles.join(',');

    try {
      db.prepare(`
        INSERT INTO server_config (guild_id, role_allstaff_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET role_allstaff_id = excluded.role_allstaff_id
      `).run(guildId, updatedValue);

      const embed = createConfigEmbed('role_allstaff_id', `Retiré : ${role.id}`, user);
      await interaction.reply({ embeds: [embed], flags: 64 });

      await sendLogConfigToRubis(
        guild,
        user,
        `Le rôle staff a été retiré : <@&${role.id}> (\`${role.id}\`)`,
        interaction.client,
        'Configuration : Rôles / Staff',
        '🗑️'
      );
    } catch (error) {
      console.error('[TOPAZE] Erreur DB – /remove-role-staff :', error);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};