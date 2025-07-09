// bot/topaze/commands/admin/reload.js

const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const logger = require('../../../../shared/helpers/logger');
const { sendLogConfigToRubis } = require('../../../../shared/helpers/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Recharge une commande sans redémarrer le bot')
    .addStringOption(option =>
      option.setName('commande')
        .setDescription('Nom de la commande à recharger')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const choices = [];

    // Propose toutes les commandes enregistrées dans client.commands
    interaction.client.commands.forEach(cmd => {
      if (cmd?.data?.name) choices.push(cmd.data.name);
    });

    const filtered = choices.filter(choice =>
      choice.toLowerCase().startsWith(focusedValue.toLowerCase())
    );

    await interaction.respond(
      filtered.map(choice => ({ name: choice, value: choice })).slice(0, 25)
    );
  },

  async execute(interaction) {
    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    const altOwnerIds = process.env.ALT_OWNER_ID?.split(',') || [];
    const adminIds = process.env.ADMIN_ID?.split(',') || [];
    const userId = interaction.user.id;

    if (!ownerIds.includes(userId) && !altOwnerIds.includes(userId) && !adminIds.includes(userId)) {
      return interaction.reply({
        content: '⛔ Vous n’avez pas l’autorisation d’utiliser cette commande.',
        flags: 64
      });
    }

    const commandName = interaction.options.getString('commande').toLowerCase();
    const command = interaction.client.commands.get(commandName);
    if (!command) {
      return interaction.reply({
        content: `❌ La commande \`${commandName}\` est introuvable.`,
        flags: 64
      });
    }

    const commandsPath = path.join(__dirname, '..');
    let commandPath;

    function findCommand(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
          const found = findCommand(fullPath);
          if (found) return found;
        } else if (file === `${commandName}.js`) {
          return fullPath;
        }
      }
      return null;
    }

    commandPath = findCommand(commandsPath);

    if (!commandPath) {
      return interaction.reply({
        content: `❌ Impossible de localiser le fichier pour \`${commandName}\`.`,
        flags: 64
      });
    }

    try {
      delete require.cache[require.resolve(commandPath)];
      const newCommand = require(commandPath);
      interaction.client.commands.set(newCommand.data.name, newCommand);

      logger.info(`[Topaze] 🔁 Commande rechargée : ${newCommand.data.name}`);

      await interaction.reply({
        content: `✅ La commande \`${newCommand.data.name}\` a été rechargée avec succès.`,
        flags: 64
      });

      await sendLogConfigToRubis(
        interaction.guild,
        interaction.user,
        `Commande \`${newCommand.data.name}\` rechargée.`,
        interaction.client,
        'Gestion : Reload',
        '🔄'
      );

    } catch (error) {
      logger.error(`[Topaze] ❌ Erreur lors du reload de ${commandName} : ${error.stack}`);
      console.error(error);
      return interaction.reply({
        content: `❌ Une erreur est survenue lors du rechargement de \`${commandName}\`.`,
        flags: 64
      });
    }
  }
};