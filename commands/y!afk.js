const { EmbedBuilder } = require('discord.js');

// afk olan kullanıcıları geçici hafızada tutmak için Map
const afkMap = new Map();

module.exports = {
  name: 'afk',
  aliases: ['y!afk'],
  description: 'kullanıcıyı afk moduna sokar.',
  
  // afk verisine veya haritaya diğer yerlerden erişmek gerekirse
  afkMap: afkMap,

  async execute(message, args) {
    // afk sebebini al (boş bırakıldıysa varsayılan atansın)
    const sebep = args.join(' ') || 'sebep belirtilmedi';

    // afk verisini kaydet
    afkMap.set(message.author.id, {
      sebep: sebep,
      zaman: Date.now(),
      eskiRumuz: message.member.displayName
    });

    // rumuzunun başına kum saati simgesi ekle
    try {
      const yeniRumuz = `⏳ ${message.member.displayName}`.slice(0, 32); // discord maksimum 32 karaktere izin verir
      await message.member.setNickname(yeniRumuz);
    } catch (err) {
      // botun yetkisi yetmezse veya kullanıcı sunucu sahibiyse hata vermemesi için yakalıyoruz
      console.log(`[AFK] ${message.author.tag} kullanıcısının ismi değiştirilemedi (yetki yetersizliği veya sunucu sahibi).`);
    }

    // onay embed mesajı
    const embed = new EmbedBuilder()
      .setTitle('⏳ AFK Moduna Geçildi')
      .setColor('#6366f1')
      .setDescription(`başarıyla **AFK** moduna geçtin!\n\n**Sebep:** ${sebep}`)
      .setFooter({ text: 'mesaj yazdığında afk modundan otomatik çıkacaksın.' });

    await message.channel.send({ embeds: [embed] });
  }
};
