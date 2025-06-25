// bot\topaze\commands\config\channel\config-welcome.js

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const db = require('../../../../../shared/utils/db');
const { createConfigEmbed } = require('../../../../../shared/utils/embed/topaze/embedTopazeConfig');
const { sendLogConfigToRubis } = require('../../../../../shared/helpers/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config-welcome')
    .setDescription('Configurer le salon pour les messages de bienvenue')
    .addChannelOption(option =>
      option
        .setName('salon')
        .setDescription('Le salon texte utilisé pour souhaiter la bienvenue aux nouveaux membres')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {

    console.log(`[Topaze] Commande ${interaction.commandName} reçue par ${interaction.user.tag}`);
    
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    const user = interaction.user;

    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    const adminIds = process.env.ADMIN_ID?.split(',') || [];

    const isOwner = ownerIds.includes(userId);
    const isAdminId = adminIds.includes(userId);

    const row = db.prepare('SELECT role_admin_id FROM server_config WHERE guild_id = ?').get(guildId);
    const roleAdminId = row?.role_admin_id;
    const isAdminRole = roleAdminId && interaction.member.roles.cache.has(roleAdminId);

    if (!isOwner && !isAdminId && !isAdminRole) {
      return interaction.reply({
        content: '⛔ Vous n’avez pas la permission d’utiliser cette commande.',
        flags: 64
      });
    }

    const channel = interaction.options.getChannel('salon');

    try {
      db.prepare(`
        INSERT INTO server_config (guild_id, channel_welcome_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET channel_welcome_id = excluded.channel_welcome_id
      `).run(guildId, channel.id);

      const embed = createConfigEmbed('channel_welcome_id', channel.id, user);
      await interaction.reply({ embeds: [embed], flags: 64 });

      await sendLogConfigToRubis(
        interaction.guild,
        interaction.user,
        `Le salon de bienvenue a été mis à jour : <#${channel.id}> (\`${channel.id}\`)`,
        interaction.client,
        'Configuration : Flux',
        '🎉'
      );
    } catch (error) {
      console.error('[TOPAZE] Erreur DB – /config-welcome :', error);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};