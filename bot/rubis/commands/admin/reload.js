// bot/rubis/commands/admin/reload.js

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Recharge dynamiquement les commandes et événements du bot Rubis')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const client = interaction.client;

    try {
      // === Rechargement des commandes ===
      client.commands.clear();
      const commandsPath = path.join(__dirname, '..');
      loadCommandsRecursively(commandsPath, client);

      // === Rechargement des événements ===
      removeAllEventListeners(client);
      loadEventsRecursively(client, path.join(__dirname, '..', '..', '..', 'events'));

      await interaction.reply({ content: '🔁 Commandes et événements rechargés avec succès !', flags: 64 });
    } catch (err) {
      console.error('❌ Erreur lors du rechargement dynamique :', err);
      await interaction.reply({ content: '❌ Une erreur est survenue pendant le rechargement.', flags: 64 });
    }
  },
};

/**
 * Rechargement récursif des commandes
 */
function loadCommandsRecursively(dir, client) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      loadCommandsRecursively(fullPath, client);
    } else if (file.endsWith('.js')) {
      delete require.cache[require.resolve(fullPath)];
      const command = require(fullPath);
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`♻️ Commande rechargée : ${command.data.name}`);
      }
    }
  }
}

/**
 * Supprime tous les anciens listeners
 */
function removeAllEventListeners(client) {
  const registeredEvents = client.eventNames();
  for (const eventName of registeredEvents) {
    client.removeAllListeners(eventName);
    console.log(`🧹 Événement supprimé : ${eventName}`);
  }
}

/**
 * Rechargement récursif des événements
 */
function loadEventsRecursively(client, dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      loadEventsRecursively(client, fullPath);
    } else if (file.endsWith('.js')) {
      delete require.cache[require.resolve(fullPath)];
      const event = require(fullPath);
      const eventName = event.name || path.basename(file, '.js');

      if (event.once) {
        client.once(eventName, (...args) => event.execute(...args, client));
      } else {
        client.on(eventName, (...args) => event.execute(...args, client));
      }

      console.log(`♻️ Événement rechargé : ${eventName}`);
    }
  }
}