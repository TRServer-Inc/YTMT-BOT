const { EmbedBuilder } = require('discord.js');

// detaylı bilgi/ipucu içeren genişletilmiş kelime havuzu
const kelimeler = {
    kolay: [
        { kelime: 'kedi', ipucu: 'evcil, miyavlayan dört ayaklı bir hayvan' },
        { kelime: 'köpek', ipucu: 'sadakat dizisiyle bilinen, havlayan evcil hayvan' },
        { kelime: 'elma', ipucu: 'kırmızı veya yeşil renkli, kabuğu soyularak yenen meyve' },
        { kelime: 'araba', ipucu: 'dört tekerlekli, motorlu kara taşıtı' },
        { kelime: 'okul', ipucu: 'eğitim ve öğretim verilen kurum/bina' },
        { kelime: 'güneş', ipucu: 'dünyamızı ısıtan ve aydınlatan en yakın yıldız' },
        { kelime: 'deniz', ipucu: 'tuzlu su kütlesi, yazın yüzmek için gidilir' },
        { kelime: 'kalem', ipucu: 'kağıda yazı yazmak veya çizim yapmak için kullanılır' },
        { kelime: 'kitap', ipucu: 'okumak için yazılmış, ciltlenmiş kağıt sayfaları' },
        { kelime: 'uçak', ipucu: 'gökyüzünde uçan yolcu veya yük taşıtı' }
    ],
    orta: [
        { kelime: 'bilgisayar', ipucu: 'veri işleyen, klavye ve ekrana sahip elektronik cihaz' },
        { kelime: 'televizyon', ipucu: 'evlerde yayın izlemek için kullanılan ekranlı cihaz' },
        { kelime: 'öğretmen', ipucu: 'okulda öğrencilere bilgi aktaran meslek sahibi' },
        { kelime: 'astronot', ipucu: 'uzaya giden ve orada araştırmalar yapan kişi' },
        { kelime: 'okyanus', ipucu: 'kıtaları ayıran devasa tuzlu su kütlesi' },
        { kelime: 'atmosfer', ipucu: 'dünyamızı saran gaz tabakası' },
        { kelime: 'özgürlük', ipucu: 'hiçbir kısıtlamaya bağlı kalmadan yaşama durumu' },
        { kelime: 'kütüphane', ipucu: 'içinde binlerce kitap barındıran sessiz mekan' },
        { kelime: 'kulaklık', ipucu: 'kulağa takılarak müzik veya ses dinlenen araç' },
        { kelime: 'mühendis', ipucu: 'teknik işler, tasarım ve yapım süreçlerini yöneten meslek' }
    ],
    zor: [
        { kelime: 'programlama', ipucu: 'bilgisayara komutlar ve kodlar yazma süreci' },
        { kelime: 'mikroorganizma', ipucu: 'gözle görülemeyecek kadar küçük canlı varlık' },
        { kelime: 'elektrofizyoloji', ipucu: 'biyolojik hücre ve dokuların elektriksel özelliklerini inceleyen bilim' },
        { kelime: 'spekülasyon', ipucu: 'piyasalarda geleceğe yönelik tahminlerle kâr sağlama çabası' },
        { kelime: 'konfigürasyon', ipucu: 'bir sistemin veya yazılımın yapılandırılması ve ayarları' },
        { kelime: 'psikoterapi', ipucu: 'zihinsel ve duygusal sorunları konuşarak tedavi etme yöntemi' },
        { kelime: 'biyokimya', ipucu: 'canlıların yapısındaki kimyasal maddeleri inceleyen bilim dalı' },
        { kelime: 'milletlerarası', ipucu: 'uluslararası, uluslar arası ilişkileri kapsayan kavram' }
    ]
};

const haklar = {
    kolay: 8,
    orta: 6,
    zor: 4
};

// aktif oyunları tutacağımız obje
const aktifOyunlar = new Map();

module.exports = {
    name: 'adamasmaca',
    description: 'kategori ipuculu, tekte bilme özellikli adam asmaca oyunu.',
    aliases: ['adam-asmaca'],
    async execute(message, args) {
        if (aktifOyunlar.has(message.author.id)) {
            return message.reply('zaten devam eden bir adam asmaca oyunun var!');
        }

        let zorluk = args[0] ? args[0].toLowerCase() : 'orta';

        if (!['kolay', 'orta', 'zor'].includes(zorluk)) {
            return message.reply('lütfen geçerli bir zorluk seviyesi belirt! (`kolay`, `orta`, `zor`)\nörnek: `y!adamasmaca zor`');
        }

        const havuz = kelimeler[zorluk];
        const secilenObje = havuz[Math.floor(Math.random() * havuz.length)];
        const secilenKelime = secilenObje.kelime.toLowerCase();
        const kelimeIpucu = secilenObje.ipucu;

        let kalanHak = haklar[zorluk];
        const tahminEdilenHarfler = new Set();
        let ipucuKullanildi = false;
        
        let gizliKelime = Array.from(secilenKelime).map(ch => ch === ' ' ? ' ' : '_');

        aktifOyunlar.set(message.author.id, true);

        const embed = new EmbedBuilder()
            .setTitle('🎯 adam asmaca başladı!')
            .setColor('#3498db')
            .setDescription(`
**zorluk:** \`${zorluk.toUpperCase()}\`
**kalan hak:** \`${kalanHak}\`
**kelime:** \`${gizliKelime.join(' ')}\`

*tahmin etmek için harf veya **kelimenin tamamını** yazabilirsin!*
*kelime hakkında bilgi almak için **"ipucu"** yazabilirsin (1 hak düşer).*
            `)
            .setFooter({ text: 'oyunu iptal etmek için "iptal" yazabilirsin.' });

        const oyunMesaji = await message.channel.send({ embeds: [embed] });

        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector({ filter, time: 600000 });

        collector.on('collect', async m => {
            // büyük/küçük harf duyarlılığını ortadan kaldırıyoruz
            const girdi = m.content.toLowerCase().trim();

            // oyunu iptal etme
            if (girdi === 'iptal') {
                collector.stop('iptal');
                return message.channel.send('oyun iptal edildi.');
            }

            // ipucu isteme (kelime hakkında bilgi verir)
            if (girdi === 'ipucu') {
                if (ipucuKullanildi) {
                    return message.channel.send('zaten bu oyunda ipucu hakkını kullandın!').then(msg => {
                        setTimeout(() => msg.delete().catch(() => {}), 3000);
                    });
                }

                if (kalanHak <= 1) {
                    return message.channel.send('son 1 hakkın kaldığı için ipucu kullanamazsın!').then(msg => {
                        setTimeout(() => msg.delete().catch(() => {}), 3000);
                    });
                }

                ipucuKullanildi = true;
                kalanHak--; // ipucu cezası

                message.channel.send(`💡 **kelime hakkında ipucu:** ${kelimeIpucu} *(1 hak harcandı)*`).then(msg => {
                    setTimeout(() => msg.delete().catch(() => {}), 6000);
                });
            } 
            // tekte bilme (tam kelime tahmini)
            else if (girdi.length > 1) {
                if (girdi === secilenKelime) {
                    collector.stop('kazandi');
                    const kazanEmbed = new EmbedBuilder()
                        .setTitle('🎯 TEKTE BİLDİN! TEBRİKLER!')
                        .setColor('#2ecc71')
                        .setDescription(`kelimenin tamamını doğru tahmin ettin: **${secilenKelime.toUpperCase()}**\n**zorluk:** \`${zorluk}\``);
                    return oyunMesaji.edit({ embeds: [kazanEmbed] });
                } else {
                    kalanHak--;
                    message.channel.send(`❌ **"${girdi}"** kelimesi yanlış! 1 hakkın gitti.`).then(msg => {
                        setTimeout(() => msg.delete().catch(() => {}), 3000);
                    });

                    if (kalanHak <= 0) {
                        collector.stop('kaybetti');
                        const kaybetEmbed = new EmbedBuilder()
                            .setTitle('💀 kaybettin!')
                            .setColor('#e74c3c')
                            .setDescription(`doğru kelime **${secilenKelime}** idi.\n**zorluk:** \`${zorluk}\``);
                        return oyunMesaji.edit({ embeds: [kaybetEmbed] });
                    }
                }
            } 
            // tek harf tahmini
            else if (girdi.length === 1 && /[a-zçğıöşü]/i.test(girdi)) {
                if (tahminEdilenHarfler.has(girdi)) {
                    return message.channel.send(`\`${girdi}\` harfini zaten tahmin etmiştin!`).then(msg => {
                        setTimeout(() => msg.delete().catch(() => {}), 3000);
                    });
                }

                tahminEdilenHarfler.add(girdi);

                if (secilenKelime.includes(girdi)) {
                    for (let i = 0; i < secilenKelime.length; i++) {
                        if (secilenKelime[i] === girdi) {
                            gizliKelime[i] = girdi;
                        }
                    }

                    if (!gizliKelime.includes('_')) {
                        collector.stop('kazandi');
                        const kazanEmbed = new EmbedBuilder()
                            .setTitle('🎉 tebrikler, kazandın!')
                            .setColor('#2ecc71')
                            .setDescription(`kelimeyi doğru bildin: **${secilenKelime}**\n**zorluk:** \`${zorluk}\``);
                        return oyunMesaji.edit({ embeds: [kazanEmbed] });
                    }
                } else {
                    kalanHak--;

                    if (kalanHak <= 0) {
                        collector.stop('kaybetti');
                        const kaybetEmbed = new EmbedBuilder()
                            .setTitle('💀 kaybettin!')
                            .setColor('#e74c3c')
                            .setDescription(`doğru kelime **${secilenKelime}** idi.\n**zorluk:** \`${zorluk}\``);
                        return oyunMesaji.edit({ embeds: [kaybetEmbed] });
                    }
                }
            }

            // durumu güncelle
            const guncelEmbed = new EmbedBuilder()
                .setTitle('🎯 adam asmaca')
                .setColor('#3498db')
                .setDescription(`
**zorluk:** \`${zorluk.toUpperCase()}\`
**kalan hak:** \`${kalanHak}\`
**kelime:** \`${gizliKelime.join(' ')}\`
**denenen harfler:** ${Array.from(tahminEdilenHarfler).join(', ') || 'yok'}
**ipucu durumu:** ${ipucuKullanildi ? '❌ kullanıldı' : '✅ kullanılabilir ("ipucu" yaz)'}
                `)
                .setFooter({ text: 'oyunu iptal etmek için "iptal" yazabilirsin.' });

            oyunMesaji.edit({ embeds: [guncelEmbed] });
        });

        collector.on('end', (collected, reason) => {
            aktifOyunlar.delete(message.author.id);
            if (reason === 'time') {
                message.channel.send(`<@${message.author.id}>, süren dolduğu için adam asmaca oyunu sonlandırıldı.`);
            }
        });
    }
};
