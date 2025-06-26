// bot/topaze/commands/config/role/remove-role-admin.js

const { SlashCommandBuilder } = require('discord.js');
const db = require('../../../../../shared/utils/db');
const { createConfigEmbed } = require('../../../../../shared/utils/embed/topaze/embedTopazeConfig');
const { sendLogConfigToRubis } = require('../../../../../shared/helpers/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove-role-admin')
    .setDescription('Retire un rôle des rôles admins autorisés à configurer')
    .addRoleOption(option =>
      option.setName('rôle')
        .setDescription('Le rôle à retirer de la liste des rôles admin')
        .setRequired(true)
    ),

  async execute(interaction) {
    const role = interaction.options.getRole('rôle');
    const guild = interaction.guild;
    const guildId = guild.id;
    const user = interaction.user;

    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    if (!ownerIds.includes(user.id)) {
      return interaction.reply({
        content: '⛔ Seuls les propriétaires du projet peuvent utiliser cette commande.',
        flags: 64
      });
    }

    const config = db.prepare('SELECT role_admin_id FROM server_config WHERE guild_id = ?').get(guildId);
    const currentAdminIds = config?.role_admin_id?.split(',').map(r => r.trim()).filter(Boolean) || [];

    if (!currentAdminIds.includes(role.id)) {
      return interaction.reply({
        content: `ℹ️ Le rôle <@&${role.id}> n’est pas enregistré comme rôle admin.`,
        flags: 64
      });
    }

    const updatedIds = currentAdminIds.filter(id => id !== role.id);
    const updatedValue = updatedIds.join(',');

    try {
      db.prepare(`
        INSERT INTO server_config (guild_id, role_admin_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET role_admin_id = excluded.role_admin_id
      `).run(guildId, updatedValue);

      const embed = createConfigEmbed('role_admin_id', `Retiré : ${role.id}`, user);
      await interaction.reply({ embeds: [embed], flags: 64 });

      await sendLogConfigToRubis(
        guild,
        user,
        `Le rôle admin a été retiré : <@&${role.id}> (\`${role.id}\`)`,
        interaction.client,
        'Configuration : Rôles / Admin',
        '🗑️'
      );
    } catch (error) {
      console.error('[TOPAZE] Erreur DB – /remove-role-admin :', error);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};