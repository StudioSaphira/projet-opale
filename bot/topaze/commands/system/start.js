const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} = require('discord.js');

const { sendLogConfigToRubis } = require('../../../../shared/helpers/logger');
const { createStartEmbed } = require('../../../../shared/utils/embed/topaze/embedTopazeSystem');
const OWNER_IDS = process.env.OWNER_ID.split(',');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('Lancer un bot distant.')
    .addStringOption(option =>
      option.setName('bot')
        .setDescription('Nom du bot à lancer')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!OWNER_IDS.includes(interaction.user.id)) {
      return interaction.reply({
        content: '⛔ Seuls les propriétaires peuvent utiliser cette commande.',
        flags: 64
      });
    }

    const botName = interaction.options.getString('bot');
    const embed = createStartEmbed(interaction.user, botName);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('start_confirm')
        .setLabel('✅ Valider')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('start_cancel')
        .setLabel('❌ Refuser')
        .setStyle(ButtonStyle.Danger)
    );

    const reply = await interaction.reply({ embeds: [embed], components: [row], flags: 64 });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 30_000,
      max: 1
    });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: '❌ Tu ne peux pas interagir avec cette validation.', flags: 64 });
      }

      if (i.customId === 'start_confirm') {
        await i.update({ content: `🟢 Le bot \`${botName}\` sera lancé.`, embeds: [], components: [] });

        // Envoi d'un log à Rubis
        await sendLogConfigToRubis(interaction.guild, interaction.user, `Démarrage du bot **${botName}** autorisé.`);

        // ⚠️ Ici, lance réellement le bot si tu as le système associé (via child_process par ex.)
      } else {
        await i.update({ content: `❌ Démarrage du bot \`${botName}\` annulé.`, embeds: [], components: [] });
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.editReply({
          content: '⌛ Temps écoulé. Aucune action effectuée.',
          embeds: [],
          components: []
        });
      }
    });
  }
};