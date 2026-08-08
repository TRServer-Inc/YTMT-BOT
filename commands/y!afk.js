const { EmbedBuilder } = require('discord.js');

// afk olan kullanıcıları tutacak harita
const afkMap = new Map();

module.exports = {
  name: 'afk',
  description: 'kullanıcıyı afk moduna sokar.',
  afkMap: afkMap,

  async execute(message, args) {
    const sebep = args.join(' ') || 'sebep belirtilmedi';

    // afk kaydı al
    afkMap.set(message.author.id, {
      sebep: sebep,
      zaman: Date.now()
    });

    // kum saati ekleme
    try {
      if (!message.member.displayName.startsWith('⏳ ')) {
        const yeniIsim = `⏳ ${message.member.displayName}`.slice(0, 32);
        await message.member.setNickname(yeniIsim);
      }
    } catch (err) {
      console.log('[AFK HATA] Rumuz değiştirilemedi. Yetki yetersizliği veya kullanıcı sunucu sahibi.');
    }

    const embed = new EmbedBuilder()
      .setTitle('⏳ AFK Moduna Geçildi')
      .setColor('#6366f1')
      .setDescription(`başarıyla **AFK** moduna geçtin!\n\n**Sebep:** ${sebep}`)
      .setFooter({ text: 'mesaj yazdığında afk modundan otomatik çıkacaksın.' });

    return message.reply({ embeds: [embed] });
  }
};
