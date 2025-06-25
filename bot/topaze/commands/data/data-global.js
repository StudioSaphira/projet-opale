const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ChannelType
} = require('discord.js');
const db = require('../../../../shared/utils/db');
const { createDataEmbed } = require('../../../../shared/utils/embed/topaze/embedTopazeData');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('data-global')
    .setDescription('Afficher les configurations de tous les serveurs enregistrés (owner/admin seulement)'),

  async execute(interaction) {
    const ownerIds = process.env.OWNER_ID.split(',');
    const adminIds = process.env.ADMIN_ID?.split(',') || [];
    const allowedGuilds = process.env.GUILD_ID?.split(',') || [];

    if (
      (!ownerIds.includes(interaction.user.id) && !adminIds.includes(interaction.user.id)) ||
      !allowedGuilds.includes(interaction.guild.id)
    ) {
      return interaction.reply({
        content: '⛔ Cette commande est réservée aux responsables autorisés.',
        flags: 64
      });
    }

    const allRows = db.prepare('SELECT * FROM server_config').all();
    if (allRows.length === 0) {
      return interaction.reply({
        content: '⚠️ Aucun serveur enregistré dans la base de données.',
        flags: 64
      });
    }

    let index = 0;

    const buildButtons = () => new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('prev').setLabel('⬅️').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('invite').setLabel('✳️').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('next').setLabel('➡️').setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      embeds: [createDataEmbed(allRows[index], { name: `ID ${allRows[index].guild_id}`, id: allRows[index].guild_id })],
      components: [buildButtons()],
      flags: 64
    });

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 120_000,
      filter: (btn) => btn.user.id === interaction.user.id
    });

    collector.on('collect', async (btn) => {
      await btn.deferUpdate();

      if (btn.customId === 'prev') {
        index = (index - 1 + allRows.length) % allRows.length;
        await interaction.editReply({
          embeds: [createDataEmbed(allRows[index], { name: `ID ${allRows[index].guild_id}`, id: allRows[index].guild_id })]
        });
      } else if (btn.customId === 'next') {
        index = (index + 1) % allRows.length;
        await interaction.editReply({
          embeds: [createDataEmbed(allRows[index], { name: `ID ${allRows[index].guild_id}`, id: allRows[index].guild_id })]
        });
      } else if (btn.customId === 'invite') {
        const guild = await btn.client.guilds.fetch(allRows[index].guild_id).catch(() => null);
        if (!guild) {
          return interaction.followUp({ content: '❌ Impossible de récupérer ce serveur.', ephemeral: true });
        }

        const welcomeId = allRows[index].channel_welcome_id;
        if (!welcomeId) {
          return interaction.followUp({ content: '⚠️ Aucun salon de bienvenue défini.', ephemeral: true });
        }

        const channel = await guild.channels.fetch(welcomeId).catch(() => null);
        if (!channel) {
          return interaction.followUp({ content: '❌ Salon introuvable.', ephemeral: true });
        }

        if (![ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildAnnouncement].includes(channel.type)) {
          return interaction.followUp({ content: '❌ Le salon spécifié ne permet pas la création d’une invitation.', ephemeral: true });
        }

        if (typeof channel.createInvite !== 'function') {
          return interaction.followUp({ content: '❌ Impossible de créer une invitation sur ce salon.', ephemeral: true });
        }

        try {
          const invite = await channel.createInvite({ maxAge: 0, maxUses: 0, unique: true });
          await interaction.followUp({ content: `🔗 Invitation permanente : ${invite.url}`, ephemeral: true });
        } catch (e) {
          console.error('Erreur lors de la création de l’invitation :', e);
          await interaction.followUp({ content: '❌ Une erreur est survenue lors de la création de l’invitation.', ephemeral: true });
        }
      }
    });

    collector.on('end', async () => {
      try {
        const message = await interaction.fetchReply();
        await message.edit({ components: [] });
      } catch (e) {
        // Le message a probablement été supprimé
      }
    });
  }
};