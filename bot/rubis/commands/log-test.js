// bot/rubis/commands/log-test.js

const { SlashCommandBuilder } = require('discord.js');

const eventList = [
  // Channels
  'channelCreate', 'channelDelete', 'channelUpdate',
  // Members
  'guildMemberAdd', 'guildMemberRemove',
  'memberInfraction', 'memberRoleAdded', 'memberRoleRemoved',
  'memberSanction', 'memberWarned',
  // Messages
  'bulkMessageDelete', 'messageDelete', 'messageUpdate',
  // Roles
  'roleCreate', 'roleDelete', 'roleUpdate',
  // System
  'customLogReceiver', 'guildBoosted',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('log-test')
    .setDescription('Déclenche manuellement un événement pour tester les logs Rubis.')
    .addStringOption(option =>
      option.setName('event')
        .setDescription('Événement à tester')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused();
    const filtered = eventList.filter(e => e.toLowerCase().includes(focused.toLowerCase()));
    await interaction.respond(
      filtered.map(e => ({ name: e, value: e }))
    );
  },

  async execute(interaction) {
    const eventName = interaction.options.getString('event');

    if (!eventList.includes(eventName)) {
      return interaction.reply({ content: `❌ L’événement \`${eventName}\` n’est pas reconnu.`, flags: 64 });
    }

    // Simule l’appel de l’événement pour test
    interaction.client.emit(eventName, {
      simulated: true,
      user: interaction.user,
      channel: interaction.channel,
      guild: interaction.guild,
    });

    await interaction.reply({
      content: `✅ Événement \`${eventName}\` déclenché pour test.`,
      flags: 64,
    });
  },
};
