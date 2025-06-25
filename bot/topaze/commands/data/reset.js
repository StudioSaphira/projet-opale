const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} = require('discord.js');
const db = require('../../../../shared/utils/db');
const { sendLogConfigToRubis } = require('../../../../shared/helpers/logger');
const { createResetEmbed } = require('../../../../shared/utils/embed/topaze/embedTopazeReset');

const serverConfigColumns = [
  'channel_log_id', 'channel_welcome_id', 'channel_leaving_id', 'channel_birthday_id',
  'channel_voice_id', 'channel_counter_member_id', 'channel_counter_bot_id',
  'channel_counter_staff_id', 'channel_counter_boost_id', 'channel_counter_allmember_id',
  'category_counter_id', 'category_support_id', 'category_contact_id', 'category_voice_id',
  'role_allstaff_id', 'role_mod_id', 'role_admin_id', 'role_boost_id',
  'role_birthday_id', 'role_member_id'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Réinitialise un paramètre spécifique de configuration')
    .addStringOption(option =>
      option.setName('data')
        .setDescription('Le champ à réinitialiser')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async autocomplete(interaction) {
    try {
      const focused = interaction.options.getFocused();
      const filtered = serverConfigColumns.filter(c => c.includes(focused));
      await interaction.respond(
        filtered.map(c => ({ name: c, value: c }))
      );
    } catch (e) {
      console.error('[Autocomplete /reset] Erreur :', e);
    }
  },

  async execute(interaction) {
    const userId = interaction.user.id;
    const guild = interaction.guild;
    const guildId = guild.id;
    const column = interaction.options.getString('data');

    const ownerIds = process.env.OWNER_ID.split(',');
    if (!ownerIds.includes(userId)) {
      return interaction.reply({
        content: '⛔ Seuls les propriétaires du projet peuvent utiliser cette commande.',
        ephemeral: true
      });
    }

    if (!serverConfigColumns.includes(column)) {
      return interaction.reply({
        content: '❌ Le champ fourni est invalide.',
        ephemeral: true
      });
    }

    const embed = createResetEmbed(column, interaction.user);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('reset_confirm')
        .setLabel('✅ Valider')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('reset_cancel')
        .setLabel('❌ Refuser')
        .setStyle(ButtonStyle.Danger)
    );

    const reply = await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 15000
    });

    collector.on('collect', async i => {
      if (i.user.id !== userId) {
        return i.reply({ content: '❌ Seul l’utilisateur ayant exécuté la commande peut répondre.', ephemeral: true });
      }

      if (i.customId === 'reset_cancel') {
        return i.update({ content: '❌ Réinitialisation annulée.', components: [], embeds: [] });
      }

      try {
        db.prepare(`UPDATE server_config SET ${column} = NULL WHERE guild_id = ?`).run(guildId);
        await i.update({ content: `✅ Le champ \`${column}\` a été réinitialisé avec succès.`, components: [], embeds: [] });

        await sendLogConfigToRubis(
          interaction.guild,
          interaction.user,
          `Le paramètre \`${column}\` a été réinitialisé.`,
          interaction.client,
          'Réinitialisation : Paramètre',
          '♻️'
        );
      } catch (err) {
        console.error('[ERREUR /reset]', err);
        await i.update({ content: '❌ Une erreur est survenue lors de la réinitialisation.', components: [], embeds: [] });
      }
    });
  }
};