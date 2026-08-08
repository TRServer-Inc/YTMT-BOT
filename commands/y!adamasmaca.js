const { EmbedBuilder } = require('discord.js');

// dev kelime ve ipucu veritabanı
const kelimeHavuzu = [
  // oyunlar
  { kelime: "MINECRAFT", ipucu: "bloklardan oluşan popüler hayatta kalma oyunu" },
  { kelime: "ROBLOX", ipucu: "kullanıcıların kendi oyunlarını geliştirebildiği platform" },
  { kelime: "UNDERTALE", ipucu: "canavarlarla dost olabildiğin efsanevi piksel RPG oyunu" },
  { kelime: "VALORANT", ipucu: "riot games yapımı ajanlı ve yetenekli FPS oyunu" },
  { kelime: "FORTNITE", ipucu: "yapı yapmalı ve dans etmeli battle royale oyunu" },
  { kelime: "GTA", ipucu: "açık dünyada çete ve araba görevleri yaptığın kült oyun serisi" },
  { kelime: "POKEMON", ipucu: "sevimli yaratıkları yakalayıp dövüştürdüğün Seri" },
  { kelime: "TETRIS", ipucu: "yukarıdan düşen blokları sıraya dizdiğin klasik oyun" },
  { kelime: "PACMAN", ipucu: "labirentte hayaletlerden kaçıp sarı noktaları yediğin oyun" },

  // spor & futbol
  { kelime: "GALATASARAY", ipucu: "sarı-kırmızı renklere sahip uefa kupalı ilk türk takımı" },
  { kelime: "STADYUM", ipucu: "binlerce taraftarın maç izlediği devasa spor alanı" },
  { kelime: "SAMPIONLUK", ipucu: "bir ligi veya turnuvayı zirvede bitirme başarısı" },
  { kelime: "TARAFTAR", ipucu: "takımını tribünde tutkuyla destekleyen topluluk" },
  { kelime: "PENALTI", ipucu: "ceza sahası içinde yapılan ihlal sonucu verilen kale atışı" },
  { kelime: "KAPTAIN", ipucu: "sahada takıma liderlik eden oyuncu" },
  { kelime: "BASKETBOL", ipucu: "pota içine turuncu topu atmaya çalıştığın spor" },
  { kelime: "VOLEYBOL", ipucu: "file üzerinden topu karşı sahaya düşürme sporu" },
  { kelime: "STOPER", ipucu: "savunmanın göbeğinde görev yapan futbolcu" },

  // coğrafya & şehirler
  { kelime: "TURKIYE", ipucu: "asya ve avrupa kıtalarını birbirine bağlayan eşsiz ülke" },
  { kelime: "ISTANBUL", ipucu: "iki kıta üzerine kurulu, boğazı ile ünlü tarihi metropol" },
  { kelime: "ANKARA", ipucu: "türkiye cumhuriyeti'nin başkenti" },
  { kelime: "IZMIR", ipucu: "ege'nin incisi olarak bilinen sahil şehri" },
  { kelime: "ANTALYA", ipucu: "akdeniz kıyısındaki ünlü turizm şehri" },
  { kelime: "EKVATOR", ipucu: "dünyayı kuzey ve güney olarak ikiye bölen hayali çizgi" },
  { kelime: "OKYANUS", ipucu: "kıtaları birbirinden ayıran devasa su birikintisi" },
  { kelime: "YANARDAG", ipucu: "içinden lav ve kül püskürten dağ" },
  { kelime: "BUZUL", ipucu: "kutuplarda ve yüksek dağlarda donmuş dev kar kütlesi" },
  { kelime: "JAPONYA", ipucu: "doğuda bulunan, teknoloji ve animeleriyle ünlü ada ülkesi" },

  // bilim & doğa & evren
  { kelime: "GALAKSI", ipucu: "milyarlarca yıldız ve gezegenden oluşan devasa gök sistemi" },
  { kelime: "ASTRONOT", ipucu: "uzay araştırmaları için uzaya giden insan" },
  { kelime: "YERCEKIMI", ipucu: "dünyanın nesneleri kendine doğru çekme kuvveti" },
  { kelime: "KARADELIK", ipucu: "ışığın bile kaçamadığı çok güçlü çekim alanı olan gök cismi" },
  { kelime: "METEOR", ipucu: "uzaydan atmosfere girip yanan gök taşı" },
  { kelime: "TELESKOP", ipucu: "uzaydaki gök cisimlerini incelemeye yarayan optik alet" },
  { kelime: "ATMOSFER", ipucu: "gezegeni saran gaz tabakası" },
  { kelime: "DOLUNAY", ipucu: "ay'ın tam bir daire şeklinde tamamen parladığı evre" },

  // günlük yaşam & nesneler
  { kelime: "BILGISAYAR", ipucu: "ekranı, klavyesi ve işlemcisi olan dijital çalışma cihazı" },
  { kelime: "TELEFON", ipucu: "cebimizde taşıdığımız iletişim ve internet cihazı" },
  { kelime: "KULAKLIK", ipucu: "müziği sadece kendimizin duymasını sağlayan aksesuar" },
  { kelime: "TELEVIZYON", ipucu: "salonun ortasında duran yayın izleme ekranı" },
  { kelime: "KAHVE", ipucu: "sabahları uyanmak ve odaklanmak için içilen sıcak içecek" },
  { kelime: "KUTUPHANE", ipucu: "binlerce kitabın bulunduğu sessiz çalışma ortamı" },
  { kelime: "SANDALYE", ipucu: "masanın kenarına koyup üzerine oturduğumuz eşya" },
  { kelime: "KAMERA", ipucu: "fotoğraf ve video çekmeye yarayan cihaz" },
  { kelime: "MIKROFON", ipucu: "sesi alıp hoparlöre veya bilgisayara aktaran araç" },

  // genel kültür & kavramlar
  { kelime: "MEDENIYET", ipucu: "bir toplumun ulaştığı gelişmişlik seviyesi" },
  { kelime: "GIZEMLI", ipucu: "sırrı henüz çözülememiş saklı olay" },
  { kelime: "MACERA", ipucu: "heyecanlı ve riskli yolculuk veya deneyim" },
  { kelime: "OZGURLUK", ipucu: "kendi iradenle kısıtlanmadan hareket edebilme durumu" },
  { kelime: "TEKNOLOJI", ipucu: "insan hayatını kolaylaştıran bilimsel yenilikler" },
  { kelime: "GELECEK", ipucu: "şimdi'den sonra yaşanacak olan zaman dilimi" },
  { kelime: "EFSANE", ipucu: "dilden dile dolaşan olağanüstü hikaye veya kişi" },
  { kelime: "SANATKAR", ipucu: "resim, müzik gibi alanlarda eser üreten yetenekli kişi" },
  { kelime: "KUTLAMA", ipucu: "özel bir günü parti veya etkinlikle anma" }
];

const cizimler = [
  "```\n  +---+\n  |   |\n      |\n      |\n      |\n      |\n========```",
  "```\n  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n========```",
  "```\n  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n========```",
  "```\n  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n========```",
  "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n========```",
  "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n========```",
  "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n========```"
];

module.exports = {
  name: 'adamasmaca',
  aliases: ['y!adamasmaca'],
  description: 'adam asmaca oyunu başlatır.',
  async execute(message, args) {
    const secilenObje = kelimeHavuzu[Math.floor(Math.random() * kelimeHavuzu.length)];
    const secilenKelime = secilenObje.kelime;
    const ipucuMetni = secilenObje.ipucu;

    let tahminEdilenler = [];
    let yanlisHak = 0;
    let ipucuKullanildi = false;
    let aktifIpucu = "Henüz istenmedi.";
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
      .setDescription(`${cizimler[yanlisHak]}\n\n**Kelime:** ${kelimeGosterim()}\n\n💡 **İpucu almak için:** \`ipucu\` yazabilirsiniz (-1 hak eksiltir).\nHarf veya tüm kelimeyi tahmin etmek için chata yazın!`)
      .setFooter({ text: `Kalan Hak: ${maxHak - yanlisHak} | Oyuncu: ${message.author.username}` });

    const oyunMesaji = await message.channel.send({ embeds: [embed] });

    const filter = m => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector({ filter, time: 90000 });

    collector.on('collect', async m => {
      const girdi = m.content.toUpperCase('tr-TR').trim();

      if (m.deletable) m.delete().catch(() => {});

      // ipucu alma senaryosu
      if (girdi === 'IPUCU' || girdi === 'İPUCU') {
        if (!ipucuKullanildi) {
          ipucuKullanildi = true;
          aktifIpucu = ipucuMetni;
          yanlisHak++;
        }
      } 
      // tüm kelimeyi tahmin etme senaryosu
      else if (girdi.length > 1) {
        if (girdi === secilenKelime) {
          collector.stop('kazandi');
          const kazandiEmbed = new EmbedBuilder()
            .setTitle('🔥 İNANILMAZ! Tekte Bildin!')
            .setColor('#22c55e')
            .setDescription(`Kelimeyi doğru tahmin ettin: **${secilenKelime}**\n\n${cizimler[yanlisHak]}`)
            .setFooter({ text: `${message.author.username} kralsın!` });

          return oyunMesaji.edit({ embeds: [kazandiEmbed] });
        } else {
          yanlisHak += 2;
        }
      } 
      // tek harf tahmini senaryosu
      else if (girdi.length === 1) {
        if (tahminEdilenler.includes(girdi)) return;

        tahminEdilenler.push(girdi);

        if (!secilenKelime.includes(girdi)) {
          yanlisHak++;
        }
      }

      // kazanma kontrolü
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

      // kaybetme kontrolü
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
        .setDescription(`${cizimler[yanlisHak]}\n\n**Kelime:** ${kelimeGosterim()}\n\nDenenen Harfler: ${tahminEdilenler.join(', ') || 'Yok'}\n💡 **İpucu:** ${aktifIpucu}`)
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
