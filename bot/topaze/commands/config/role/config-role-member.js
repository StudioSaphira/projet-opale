const { SlashCommandBuilder } = require('discord.js');
const db = require('../../../../../shared/utils/db');
const { createConfigEmbed } = require('../../../../../shared/utils/embed/topaze/embedTopazeConfig');
const { sendLogConfigToRubis } = require('../../../../../shared/helpers/logger');

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
    const user = interaction.user;

    const row = db.prepare('SELECT role_admin_id FROM server_config WHERE guild_id = ?').get(guildId);
    const dbRoleId = row?.role_admin_id;

    const member = interaction.member;
    const hasDbRole = dbRoleId && member.roles.cache.has(dbRoleId);
    const isAllowed = ownerIds.includes(userId) || adminIds.includes(userId) || hasDbRole;

    if (!isAllowed) {
      return interaction.reply({
        content: '⛔ Vous n’avez pas l’autorisation d’utiliser cette commande.',
        flags: 64
      });
    }

    const role = interaction.options.getRole('rôle');

    try {
      db.prepare(`
        INSERT INTO server_config (guild_id, role_member_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET role_member_id = excluded.role_member_id
      `).run(guildId, role.id);

      const embed = createConfigEmbed('role_member_id', role.id, user);
      await interaction.reply({ embeds: [embed], flags: 64 });

      await sendLogConfigToRubis(
        interaction.guild,
        interaction.user,
        `Le rôle membre a été mis à jour : <@&${role.id}> (\`${role.id}\`)`,
        interaction.client,
        'Configuration : Rôles',
        '👤'
      );
    } catch (err) {
      console.error('[ERREUR /config-role-member]', err);
      await interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};