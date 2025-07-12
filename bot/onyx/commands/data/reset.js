// bot/onyx/commands/data/reset.js

const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const db = require('../../../../shared/utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Réinitialise une table spécifique de la base de données.')
    .addStringOption(option =>
      option.setName('table')
        .setDescription('Nom de la table à réinitialiser')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  ownerOnly: true,

  async execute(interaction) {
    const ownerId = process.env.OWNER_ID;
    const devGuildId = process.env.DEV_GUILD_ID;

    if (interaction.user.id !== ownerId) {
      return interaction.reply({ content: '🚫 Seul le propriétaire peut exécuter cette commande.', flags: 64 });
    }

    if (interaction.guildId !== devGuildId) {
      return interaction.reply({ content: '🚫 Cette commande ne peut être utilisée que sur le serveur de développement.', flags: 64 });
    }

    const table = interaction.options.getString('table').toLowerCase();

    // Vérification que la table existe réellement
    const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all().map(t => t.name);
    if (!tables.includes(table)) {
      return interaction.reply({ content: `❌ La table **${table}** n'existe pas dans la base.`, flags: 64 });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('confirm_reset_table')
        .setLabel('✅ Confirmer')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('cancel_reset_table')
        .setLabel('❌ Annuler')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      content: `⚠️ Cette action supprimera **toutes les données** de la table \`${table}\`.\nSouhaites-tu continuer ?`,
      components: [row],
      flags: 64
    });

    const confirmation = await interaction.channel.awaitMessageComponent({
      componentType: ComponentType.Button,
      time: 15_000
    }).catch(() => null);

    if (!confirmation) {
      return interaction.editReply({
        content: '⏱️ Temps écoulé. Réinitialisation annulée.',
        components: []
      });
    }

    if (confirmation.customId === 'cancel_reset_table') {
      return confirmation.update({
        content: '❌ Réinitialisation annulée.',
        components: []
      });
    }

    if (confirmation.customId === 'confirm_reset_table') {
      try {
        db.prepare(`DELETE FROM ${table}`).run();
        await confirmation.update({
          content: `✅ Table \`${table}\` réinitialisée avec succès.`,
          components: []
        });

        console.log(`🧹 Table "${table}" vidée avec succès.`);
      } catch (err) {
        console.error('Erreur SQL :', err);
        await confirmation.update({
          content: `❌ Une erreur est survenue lors de la réinitialisation de \`${table}\`.`,
          components: []
        });
      }
    }
  },

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused().toLowerCase();

    const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all().map(t => t.name);
    const filtered = tables.filter(name => name.startsWith(focused)).slice(0, 25);

    await interaction.respond(filtered.map(name => ({ name, value: name })));
  }
};