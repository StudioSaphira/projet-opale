const { SlashCommandBuilder } = require('discord.js');
const db = require('../../../../../shared/utils/db');

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
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    const adminIds = process.env.ADMIN_ID?.split(',') || [];

    // Vérifie les autorisations
    const config = db.prepare('SELECT role_admin_id FROM server_config WHERE guild_id = ?').get(guildId);
    const hasAdminRole = config?.role_admin_id && interaction.member.roles.cache.has(config.role_admin_id);
    const isOwner = ownerIds.includes(userId);
    const isAdmin = adminIds.includes(userId);

    if (!isOwner && !isAdmin && !hasAdminRole) {
      return interaction.reply({
        content: '⛔ Vous n’avez pas l’autorisation de modifier ce paramètre.',
        flags: 64
      });
    }

    // Mise à jour de la base
    db.prepare(`
      INSERT INTO server_config (guild_id, role_boost_id)
      VALUES (?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET role_boost_id = excluded.role_boost_id
    `).run(guildId, role.id);

    return interaction.reply({
      content: `✅ Le rôle de boosteur a été mis à jour : ${role}`,
      flags: 64
    });
  }
};