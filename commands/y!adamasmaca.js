const { EmbedBuilder } = require('discord.js');

const kelimeler = [
  // oyunlar & sistemler
  "MINECRAFT", "ROBLOX", "DISCORD", "GITHUB", "RENDER", "EXPRESS", "JAVASCRIPT", 
  "PYTHON", "DEVELOPER", "INTERNET", "YAZILIM", "SUNUCU", "DATABASE", "FIREBASE",
  "EMULATOR", "PROCESSOR", "GRAPHICS", "KODLAMA", "INTERFACE", "PROTOCOL", "NETWORK",
  "VALORANT", "COUNTERSTRIKE", "POKEMON", "FORTNITE", "UNDERTALE",

  // spor & kulüpler
  "GALATASARAY", "FUTBOL", "BASKETBOL", "VOLEYBOL", "STADYUM", "SANTRA", "TARAFTAR",
  "SAMPIYON", "EFSANE", "OLIMPIYAT", "SAMPIONLUK", "ANTRENMAN",

  // coğrafya & şehirler
  "TURKIYE", "ISTANBUL", "ANKARA", "IZMIR", "ANTALYA", "BURSA", "TRABZON", "ADANA",
  "CANAKKALE", "AMAZON", "ATLANTIK", "EKVATOR", "AVRUPA", "ASYA", "AMERIKA", "AFRIKA",
  "OKYANUS", "YANARDAG", "BUZUL",

  // bilim & doğa & evren
  "GALAKSI", "GEZEGEN", "TELESKOP", "ASTRONOT", "YERCEKIMI", "ATMOSFER", "METEOR",
  "BIYOLOJI", "KIMYA", "FIZIK", "MATEMATIK", "OKSIJEN", "YILDIZ", "GUNES", "DOLUNAY",
  "KARADELIK", "EKOSISTEM", "ELEMENT", "YAPAYZEKA",

  // günlük yaşam & nesneler
  "BILGISAYAR", "TELEFON", "KLAVYE", "KULAKLIK", "TELEVIZYON", "KAHVE", "KUTUPHANE",
  "SANDALYE", "MIMARLIK", "BAGLANTI", "SARJALETI", "KAMERA", "MIKROFON", "MONITOR", 
  "PROJEKTOR", "ALARM", "ANAHTARLIK",

  // genel kültür & kavramlar
  "MEDENIYET", "GIZEMLI", "MACERA", "KUTLAMA", "GELENEK", "SANATKAR", "FELSEFE", 
  "OZGURLUK", "YOLCULUK", "TEKNOLOJI", "GELECEK", "ISTATISTIK", "ALGORITMA", "GUVENLIK"
];

const cizimler = [
  "```\n  +---+\n  |   |\n      |\n      |\n      |\n      |\n========```",
  "```\n  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n========```",
  "```\n  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n========```",
  "```\n  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n========```",
  "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n========```",
  "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n========```",
  "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n========```"
];

module.exports = {
  name: 'adamasmaca',
  aliases: ['y!adamasmaca'],
  description: 'adam asmaca oyunu başlatır.',
  async execute(message, args) {
    const secilenKelime = kelimeler[Math.floor(Math.random() * kelimeler.length)];
    let tahminEdilenler = [];
    let yanlisHak = 0;
    const maxHak = 6;

    const kelimeGosterim = () => {
      return secilenKelime
        .split('')
        .map(harf => (tahminEdilenler.includes(harf) ? harf : '\\_'))
        .join(' ');
    };

    const embed = new EmbedBuilder()
      .setTitle('🎮 Adam Asmaca Oyunu')
      .setColor('#6366f1')
      .setDescription(`${cizimler[yanlisHak]}\n\n**Kelime:** ${kelimeGosterim()}\n\nHarf tahmin etmek için **tek harf**, kelimeyi çözdüysen **tüm kelimeyi** yazabilirsin!`)
      .setFooter({ text: `Kalan Hak: ${maxHak - yanlisHak} | Oyuncu: ${message.author.username}` });

    const oyunMesaji = await message.channel.send({ embeds: [embed] });

    // mesaj atan kişi oyunu başlatan kişi olsun
    const filter = m => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector({ filter, time: 90000 }); // 90 saniye

    collector.on('collect', async m => {
      const girdi = m.content.toUpperCase('tr-TR').trim();

      if (m.deletable) m.delete().catch(() => {});

      // 1. senaryo: tüm kelimeyi tekte tahmin etme
      if (girdi.length > 1) {
        if (girdi === secilenKelime) {
          collector.stop('kazandi');
          const kazandiEmbed = new EmbedBuilder()
            .setTitle('🔥 İNANILMAZ! Tekte Bildin!')
            .setColor('#22c55e')
            .setDescription(`Kelimeyi tekte doğru tahmin ettin: **${secilenKelime}**\n\n${cizimler[yanlisHak]}`)
            .setFooter({ text: `${message.author.username} kralsın!` });

          return oyunMesaji.edit({ embeds: [kazandiEmbed] });
        } else {
          yanlisHak += 2; // kelimeyi yanlış tahmin ederse 2 hak birden gitsin
        }
      } 
      // 2. senaryo: tek harf tahmini
      else if (girdi.length === 1) {
        if (tahminEdilenler.includes(girdi)) return;

        tahminEdilenler.push(girdi);

        if (!secilenKelime.includes(girdi)) {
          yanlisHak++;
        }
      }

      // harf harf tamamlayarak kazanma durumu
      const kazandi = secilenKelime.split('').every(h => tahminEdilenler.includes(h));

      if (kazandi) {
        collector.stop('kazandi');
        const kazandiEmbed = new EmbedBuilder()
          .setTitle('🎉 Tebrikler, Kazandınız!')
          .setColor('#22c55e')
          .setDescription(`Kelimeyi doğru bildiniz: **${secilenKelime}**\n\n${cizimler[yanlisHak]}`)
          .setFooter({ text: `${message.author.username} kazandı!` });

        return oyunMesaji.edit({ embeds: [kazandiEmbed] });
      }

      // kaybetme durumu
      if (yanlisHak >= maxHak) {
        collector.stop('kaybetti');
        const kaybettiEmbed = new EmbedBuilder()
          .setTitle('💀 Oyun Bitti!')
          .setColor('#ef4444')
          .setDescription(`Maalesef hakların bitti! Doğru kelime: **${secilenKelime}**\n\n${cizimler[6]}`)
          .setFooter({ text: 'Geçmiş olsun!' });

        return oyunMesaji.edit({ embeds: [kaybettiEmbed] });
      }

      // oyuna devam
      const guncelEmbed = new EmbedBuilder()
        .setTitle('🎮 Adam Asmaca Oyunu')
        .setColor('#6366f1')
        .setDescription(`${cizimler[yanlisHak]}\n\n**Kelime:** ${kelimeGosterim()}\n\nDenenen Harfler: ${tahminEdilenler.join(', ') || 'Yok'}`)
        .setFooter({ text: `Kalan Hak: ${maxHak - yanlisHak} | Oyuncu: ${message.author.username}` });

      oyunMesaji.edit({ embeds: [guncelEmbed] });
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        const zamanDolduEmbed = new EmbedBuilder()
          .setTitle('⏰ Süre Doldu!')
          .setColor('#f59e0b')
          .setDescription(`Zaman dolduğu için oyun iptal edildi. Doğru kelime: **${secilenKelime}**`);

        oyunMesaji.edit({ embeds: [zamanDolduEmbed] });
      }
    });
  }
};
