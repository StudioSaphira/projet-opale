// bot\rubis\events\roles\create.js

const db = require('../../../../shared/utils/db');
const { buildAddEmbed } = require('../../../../shared/utils/embed/rubis/log');

module.exports = {
  name: 'roleCreate',

  async execute(role, client) {
    console.log(`➕ Nouveau rôle créé : ${role.name} (${role.id})`);

    try {
      // === 1) Lire ID salon log ===
      const row = db.prepare(`SELECT channel_id FROM channel_log WHERE type = ?`).get('roleCreate');

      if (!row || !row.channel_id) {
        console.warn('⚠️ Aucun salon de log défini pour roleCreate.');
        return;
      }

      const logChannel = await client.channels.fetch(row.channel_id).catch(() => null);
      if (!logChannel) {
        console.warn(`⚠️ Salon de log introuvable : ${row.channel_id}`);
        return;
      }

      // === 2) Préparer les paramètres ===
      const avantages = [];

      if (role.mentionable) avantages.push('Mentionnable ✅');
      if (role.hoist) avantages.push('Séparé dans la liste ✅');
      if (role.managed) avantages.push('Géré par une intégration ✅');
      if (role.permissions && role.permissions.bitfield !== 0n) {
        avantages.push(`Permissions : \`${role.permissions.toArray().join(', ')}\``);
      }

      if (avantages.length === 0) {
        avantages.push('Aucun paramètre particulier.');
      }

      // === 3) Créer l’embed Add ===
      const embed = buildAddEmbed(
        'Nouveau rôle créé',
        `Un nouveau rôle a été créé dans le serveur.`,
        [
          { name: 'Rôle', value: `${role.name} (\`${role.id}\`)`, inline: true },
          { name: 'Couleur', value: `${role.hexColor}`, inline: true },
          { name: 'Position', value: `${role.position}`, inline: true },
          { name: 'Paramètres', value: avantages.join('\n'), inline: false },
          { name: 'Guild', value: `${role.guild?.name || 'Inconnue'}`, inline: false }
        ]
      );

      // === 4) Envoyer ===
      await logChannel.send({ embeds: [embed] });
      console.log(`✅ Log envoyé pour roleCreate.`);

    } catch (error) {
      console.error(`❌ Erreur roleCreate :`, error);
    }
  },
};