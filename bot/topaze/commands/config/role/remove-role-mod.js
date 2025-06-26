// bot/topaze/commands/config/role/remove-role-mod.js

const { SlashCommandBuilder } = require('discord.js');
const db = require('../../../../../shared/utils/db');
const { createConfigEmbed } = require('../../../../../shared/utils/embed/topaze/embedTopazeConfig');
const { sendLogConfigToRubis } = require('../../../../../shared/helpers/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove-role-mod')
    .setDescription('Retire un rôle des rôles de modération')
    .addRoleOption(option =>
      option.setName('rôle')
        .setDescription('Le rôle à retirer de la liste des modérateurs')
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

    const config = db.prepare('SELECT role_admin_id, role_mod_id FROM server_config WHERE guild_id = ?').get(guildId);
    const roleAdminIds = config?.role_admin_id?.split(',').filter(Boolean) || [];
    const currentModRoles = config?.role_mod_id?.split(',').map(id => id.trim()).filter(Boolean) || [];

    const isOwner = ownerIds.includes(user.id);
    const isAdmin = adminIds.includes(user.id);
    const hasAdminRole = roleAdminIds.some(id => member.roles.cache.has(id));

    if (!isOwner && !isAdmin && !hasAdminRole) {
      return interaction.reply({
        content: '⛔ Vous n’avez pas l’autorisation d’utiliser cette commande.',
        flags: 64
      });
    }

    if (!currentModRoles.includes(role.id)) {
      return interaction.reply({
        content: `ℹ️ Le rôle <@&${role.id}> n’est pas enregistré comme rôle de modération.`,
        flags: 64
      });
    }

    const updatedRoles = currentModRoles.filter(id => id !== role.id);
    const updatedValue = updatedRoles.join(',');

    try {
      db.prepare(`
        INSERT INTO server_config (guild_id, role_mod_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET role_mod_id = excluded.role_mod_id
      `).run(guildId, updatedValue);

      const embed = createConfigEmbed('role_mod_id', `Retiré : ${role.id}`, user);
      await interaction.reply({ embeds: [embed], flags: 64 });

      await sendLogConfigToRubis(
        guild,
        user,
        `Le rôle modérateur a été retiré : <@&${role.id}> (\`${role.id}\`)`,
        interaction.client,
        'Configuration : Rôles / Staff',
        '🗑️'
      );
    } catch (error) {
      console.error('[TOPAZE] Erreur DB – /remove-role-mod :', error);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};