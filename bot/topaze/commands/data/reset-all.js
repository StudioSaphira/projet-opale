const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} = require('discord.js');
const db = require('../../../../shared/utils/db');
const { sendLogConfigToRubis } = require('../../../../shared/helpers/logger');
const { createResetAllEmbed } = require('../../../../shared/utils/embed/topaze/embedTopazeReset');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reset-all')
    .setDescription('Réinitialise toute la configuration du serveur'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const guild = interaction.guild;
    const guildId = guild.id;

    const ownerIds = process.env.OWNER_ID.split(',');
    const isOwner = ownerIds.includes(userId);

    if (!isOwner) {
      console.warn(`[TOPAZE] ❌ Tentative de reset-all non autorisée par ${interaction.user.tag} (${userId}) dans ${guild?.name || 'Inconnu'} (${guildId})`);
      return interaction.reply({
        content: '⛔ Seuls les propriétaires du projet peuvent réinitialiser la configuration.',
        flags: 64
      });
    }

    const embed = createResetAllEmbed('server_config', interaction.user);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('reset_all_confirm')
        .setLabel('✅ Valider')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('reset_all_cancel')
        .setLabel('❌ Refuser')
        .setStyle(ButtonStyle.Danger)
    );

    const reply = await interaction.reply({
      embeds: [embed],
      components: [row],
      flags: 64
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 15000,
      max: 1
    });

    collector.on('collect', async i => {
      if (i.user.id !== userId) {
        return i.reply({ content: '❌ Seul l’utilisateur ayant exécuté la commande peut répondre.', flags: 64 });
      }

      if (i.customId === 'reset_all_cancel') {
        return i.update({ content: '❌ Réinitialisation annulée.', components: [], embeds: [] });
      }

      try {
        db.prepare('DELETE FROM server_config WHERE guild_id = ?').run(guildId);
        await i.update({ content: `✅ Configuration du serveur réinitialisée avec succès.`, components: [], embeds: [] });
        await sendLogConfigToRubis(
          interaction.guild,
          interaction.user,
          `Tous les paramètres de configuration du serveur ont été réinitialisés.`,
          interaction.client,
          'Réinitialisation complète',
          '⚠️'
        );
      } catch (err) {
        console.error('[TOPAZE] Erreur lors de la commande /reset-all :', err);
        return i.update({ content: '❌ Une erreur est survenue lors de la réinitialisation.', components: [], embeds: [] });
      }
    });
  }
};