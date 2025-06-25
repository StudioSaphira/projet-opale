const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../../../../shared/utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config-role-member')
    .setDescription('Définit le rôle des membres de base')
    .addRoleOption(option =>
      option.setName('rôle')
        .setDescription('Le rôle à définir comme rôle de membre')
        .setRequired(true)
    ),

  async execute(interaction) {
    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    const adminIds = process.env.ADMIN_ID?.split(',') || [];
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    // Récupérer le rôle admin depuis la DB
    const row = db.prepare('SELECT role_admin_id FROM server_config WHERE guild_id = ?').get(guildId);
    const dbRoleId = row?.role_admin_id;

    const member = interaction.member;
    const hasDbRole = dbRoleId && member.roles.cache.has(dbRoleId);

    const isAllowed = ownerIds.includes(userId) || adminIds.includes(userId) || hasDbRole;

    if (!isAllowed) {
      return interaction.reply({
        content: '⛔ Vous n’avez pas l’autorisation d’utiliser cette commande.',
        ephemeral: true
      });
    }

    const role = interaction.options.getRole('rôle');

    try {
      db.prepare(`
        INSERT INTO server_config (guild_id, role_member_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET role_member_id = excluded.role_member_id
      `).run(guildId, role.id);

      await interaction.reply({
        content: `✅ Le rôle des membres a bien été défini comme <@&${role.id}>.`,
        ephemeral: true
      });
    } catch (err) {
      console.error('[ERREUR /config-role-member]', err);
      await interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        ephemeral: true
      });
    }
  }
};