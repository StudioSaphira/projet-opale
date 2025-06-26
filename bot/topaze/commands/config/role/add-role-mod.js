// bot/topaze/commands/config/role/add-role-mod.js

const { SlashCommandBuilder } = require('discord.js');
const db = require('../../../../../shared/utils/db');
const { createConfigEmbed } = require('../../../../../shared/utils/embed/topaze/embedTopazeConfig');
const { sendLogConfigToRubis } = require('../../../../../shared/helpers/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config-role-mod')
    .setDescription('Définit le rôle des modérateurs pour ce serveur')
    .addRoleOption(option =>
      option.setName('rôle')
        .setDescription('Le rôle à utiliser pour les modérateurs')
        .setRequired(true)
    ),

  async execute(interaction) {
    const role = interaction.options.getRole('rôle');
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    const user = interaction.user;

    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    const adminIds = process.env.ADMIN_ID?.split(',') || [];

    // Récupère les rôles admin multiples
    const config = db.prepare('SELECT role_admin_id FROM server_config WHERE guild_id = ?').get(guildId);
    const adminRoleIds = config?.role_admin_id?.split(',').filter(id => id.trim() !== '') || [];
    const hasAdminRole = adminRoleIds.some(id => interaction.member.roles.cache.has(id));

    const isAllowed = ownerIds.includes(userId) || adminIds.includes(userId) || hasAdminRole;
    if (!isAllowed) {
      return interaction.reply({
        content: '⛔ Vous n’avez pas l’autorisation de modifier ce paramètre.',
        flags: 64
      });
    }

    try {
      db.prepare(`
        INSERT INTO server_config (guild_id, role_mod_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET role_mod_id = excluded.role_mod_id
      `).run(guildId, role.id);

      const embed = createConfigEmbed('role_mod_id', role.id, user);
      await interaction.reply({ embeds: [embed], flags: 64 });

      await sendLogConfigToRubis(
        interaction.guild,
        interaction.user,
        `Le rôle <@&${role.id}> (\`${role.id}\`) a été ajouté à la liste des rôles 'Modérateur'.`,
        interaction.client,
        'Configuration : Rôles / Staff',
        '🔨'
      );
    } catch (err) {
      console.error('[ERREUR /config-role-mod]', err);
      await interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};