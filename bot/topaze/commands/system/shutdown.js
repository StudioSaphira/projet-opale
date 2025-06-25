// commands/system/shutdown.js
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} = require('discord.js');

const { sendLogConfigToRubis } = require('../../../../shared/helpers/logger');
const { createShutdownEmbed } = require('../../../../shared/utils/embed/topaze/embedTopazeSystem');
const OWNER_IDS = process.env.OWNER_ID.split(',');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shutdown')
    .setDescription('Arrêter un bot distant.')
    .addStringOption(option =>
      option.setName('bot')
        .setDescription('Nom du bot à arrêter')
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
    const embed = createShutdownEmbed(interaction.user, botName);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('shutdown_confirm')
        .setLabel('✅ Valider')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('shutdown_cancel')
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

      if (i.customId === 'shutdown_confirm') {
        await i.update({ content: `🔴 Le bot \`${botName}\` sera arrêté.`, embeds: [], components: [] });

        // Log envoyé à Rubis
        await sendLogConfigToRubis(interaction.guild, interaction.user, `Arrêt du bot **${botName}** autorisé.`);

        // ⚠️ Ici, ajoute la logique d’arrêt réel du bot (ex: signaler un processus, etc.)
      } else {
        await i.update({ content: `❌ Arrêt du bot \`${botName}\` annulé.`, embeds: [], components: [] });
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
