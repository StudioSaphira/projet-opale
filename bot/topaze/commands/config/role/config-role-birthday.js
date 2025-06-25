const { SlashCommandBuilder } = require('discord.js');
const db = require('../../../../../shared/utils/db');
const { createConfigEmbed } = require('../../../../../shared/utils/embed/topaze/embedTopazeConfig');
const { sendLogConfigToRubis } = require('../../../../../shared/helpers/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config-role-birthday')
    .setDescription('Définit le rôle assigné aux membres le jour de leur anniversaire')
    .addRoleOption(option =>
      option.setName('rôle')
        .setDescription('Le rôle anniversaire à assigner')
        .setRequired(true)
    ),

  async execute(interaction) {
    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    const adminIds = process.env.ADMIN_ID?.split(',') || [];

    const guild = interaction.guild;
    const user = interaction.user;
    const guildId = guild.id;
    const userId = user.id;

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
        INSERT INTO server_config (guild_id, role_birthday_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET role_birthday_id = excluded.role_birthday_id
      `).run(guildId, role.id);

      const embed = createConfigEmbed('role_birthday_id', role.id, user);
      await interaction.reply({ embeds: [embed], flags: 64 });

      await sendLogConfigToRubis(
        interaction.guild,
        interaction.user,
        `Le rôle anniversaire a été mis à jour : <@&${role.id}> (\`${role.id}\`)`,
        interaction.client,
        'Configuration : Rôles / Anniversaires',
        '🎂'
      );
    } catch (err) {
      console.error('[ERREUR /config-role-birthday]', err);
      await interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};