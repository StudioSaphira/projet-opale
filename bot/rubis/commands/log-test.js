// bot/rubis/commands/log-test.js

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Liste des événements dispo à tester
const EVENT_LIST = [
  // Channels
  'channelCreate', 'channelDelete', 'channelUpdate',
  // Members
  'guildMemberAdd', 'guildMemberRemove',
  'memberRoleAdded', 'memberRoleRemoved',
  'memberInfraction', 'memberSanction', 'memberWarned',
  // Messages
  'messageDelete', 'messageUpdate', 'bulkMessageDelete',
  // Roles
  'roleCreate', 'roleDelete', 'roleUpdate',
  // System
  'customLogReceiver', 'guildBoosted'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('log-test')
    .setDescription('Déclenche manuellement un événement pour tester son log Rubis.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName('event')
        .setDescription('Nom de l’événement à déclencher')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  // === Autocomplétion dynamique ===
  async autocomplete(interaction) {
    const focused = interaction.options.getFocused();
    const filtered = EVENT_LIST.filter(e =>
      e.toLowerCase().includes(focused.toLowerCase())
    );

    await interaction.respond(
      filtered.map(e => ({ name: e, value: e }))
    );
  },

  // === Exécution ===
  async execute(interaction) {
    const eventName = interaction.options.getString('event');

    if (!EVENT_LIST.includes(eventName)) {
      return interaction.reply({
        content: `❌ L’événement \`${eventName}\` est inconnu.`,
        ephemeral: true
      });
    }

    // Émission manuelle de l’événement
    interaction.client.emit(eventName, {
      simulated: true,
      user: interaction.user,
      guild: interaction.guild,
      channel: interaction.channel
    }, interaction.client);

    await interaction.reply({
      content: `✅ Événement \`${eventName}\` déclenché pour test.`,
      ephemeral: true
    });

    console.log(`🧪 Test : événement ${eventName} émis manuellement.`);
  }
};