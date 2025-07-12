// bot/rubis/commands/admin/reload.js

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Recharge dynamiquement les commandes et événements de Rubis.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const client = interaction.client;

    try {
      // === 1) Recharger toutes les commandes ===
      client.commands.clear();
      const commandsPath = path.join(__dirname, '..', '..');
      loadCommandsRecursively(commandsPath, client);

      // === 2) Supprimer tous les anciens listeners ===
      removeAllEventListeners(client);

      // === 3) Recharger tous les événements ===
      loadEventsRecursively(client, path.join(__dirname, '..', '..', 'events'));

      await interaction.reply({
        content: '✅ Commandes et événements rechargés avec succès.',
        ephemeral: true
      });

      console.log('♻️ Rubis a rechargé ses commandes & events.');

    } catch (error) {
      console.error('❌ Erreur lors du rechargement dynamique :', error);
      await interaction.reply({
        content: '❌ Erreur lors du rechargement.',
        ephemeral: true
      });
    }
  },
};

/**
 * Charger récursivement toutes les commandes
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
        console.log(`📦 Commande rechargée : ${command.data.name}`);
      }
    }
  }
}

/**
 * Supprimer tous les listeners existants
 */
function removeAllEventListeners(client) {
  const events = client.eventNames();
  for (const event of events) {
    client.removeAllListeners(event);
    console.log(`🧹 Listener nettoyé : ${event}`);
  }
}

/**
 * Charger récursivement tous les événements
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