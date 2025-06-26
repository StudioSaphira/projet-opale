// bot/quartz/events/ready.js

module.exports = {
  name: 'ready',
  once: true,

  /**
   * @param {import('discord.js').Client} client
   */
  async execute(client) {
    console.log(`✅ [Quartz] Connecté en tant que ${client.user.tag}`);
    console.log(`🔍 Suivi de ${client.guilds.cache.size} serveur(s).`);
  }
};