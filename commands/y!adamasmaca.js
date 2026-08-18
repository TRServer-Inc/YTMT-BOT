const { EmbedBuilder } = require('discord.js');

// devasa genişletilmiş kelime havuzu
const kelimeler = {
    kolay: [
        // hayvanlar
        'kedi', 'köpek', 'kuş', 'balık', 'aslan', 'kaplan', 'ayı', 'koyun', 'keçi', 'at', 'inek', 'tavuk', 'ördek', 'fare', 'tilki', 'kurt', 'maymun', 'yılan', 'arı', 'sinek',
        // meyve ve yiyecekler
        'elma', 'armut', 'muz', 'çilek', 'erik', 'kiraz', 'vişne', 'karpuz', 'kavun', 'üzüm', 'ekmek', 'peynir', 'süt', 'çorba', 'pilav', 'makarna', 'pasta', 'börek', 'pizza',
        // günlük eşyalar & nesneler
        'masa', 'sandalye', 'kapı', 'pencere', 'kalem', 'defter', 'kitap', 'çanta', 'saat', 'ayna', 'tarak', 'halı', 'perde', 'kutu', 'şişe', 'bardak', 'tabak', 'kaşık', 'çatal', 'bıçak',
        // doğa & çevre
        'deniz', 'güneş', 'bulut', 'yağmur', 'toprak', 'ağaç', 'çiçek', 'orman', 'ırmak', 'nehir', 'göl', 'rüzgar', 'taş', 'kum',
        // genel kavramlar
        'okul', 'sınıf', 'araba', 'tren', 'gemi', 'uçak', 'ev', 'oda', 'park', 'bahçe', 'şehir', 'köy', 'insan', 'çocuk', 'anne', 'baba'
    ],
    orta: [
        // teknoloji & eşyalar
        'bilgisayar', 'kulaklık', 'televizyon', 'buzdolabı', 'çamaşır makinesi', 'mikrodalga', 'hoparlör', 'projektör', 'fotokopi', 'kameralar', 'mikrofon', 'süpreci', 'klavye', 'farelik',
        // meslekler & kavramlar
        'öğretmen', 'mühendis', 'doktor', 'hemşire', 'avukat', 'mimar', 'gazeteci', 'astronot', 'itfaiyeci', 'polis', 'şoför', 'eczacı', 'psikolog', 'yazılımcı', 'sanatçı',
        // coğrafya & bilim
        'türkiye', 'okyanus', 'yanardağ', 'atmosfer', 'gezegeni', 'galaksi', 'ekosistem', 'biyoloji', 'matematik', 'geometri', 'felsefe', 'edebiyat', 'tarihsel',
        // soyut & genel kelimeler
        'özgürlük', 'gelişim', 'arkadaşlık', 'samimiyet', 'kalabalık', 'tecrübe', 'mücadele', 'başarı', 'cesaret', 'merhamet', 'yolculuk', 'gökyüzü', 'kütüphane', 'tiyatro', 'eğlence'
    ],
    zor: [
        // uzun & karmaşık türkçe kelimeler
        'programlama', 'elektrofizyoloji', 'mikroorganizma', 'asenkronize', 'deoksiribonükleik', 'infrastruktür', 'muvaffakiyetsizleştiricileştiriverme',
        'çekoslovakyalılaştırabildiklerimizdenmişsinizcesine', 'kötüleştiricilik', 'şahsiyetsizleştirilmek', 'demokratikleştirilme', 'kapitalistleşmek',
        'sosyalleştirilebilmek', 'özelleştirilemeyenler', 'milletlerarasılaştırılanlar', 'kavramsallaştırabilmek', 'gerçekleştirilemeyebilir',
        // nadir & ağır kavramlar
        'biyokimya', 'psikoterapi', 'spekülasyon', 'konfigürasyon', 'transformasyon', 'manipülasyon', 'organizasyon', 'standardizasyon',
        'kardiyoloji', 'nörolojik', 'anesteziyoloji', 'enternasyonal', 'paralelleştirme', 'yüzeyselleştirme', 'çerçöpleştirme'
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
    description: 'kategorili, ipucu sistemli ve devasa kelime hazneli adam asmaca oyunu.',
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
        const secilenKelime = havuz[Math.floor(Math.random() * havuz.length)].toLowerCase();
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

*tahmin etmek için harf yazabilirsin.*
*ipucu almak için **"ipucu"** yazabilirsin (1 hak düşer, 1 defa kullanılır).*
            `)
            .setFooter({ text: 'oyunu iptal etmek için "iptal" yazabilirsin.' });

        const oyunMesaji = await message.channel.send({ embeds: [embed] });

        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector({ filter, time: 600000 });

        collector.on('collect', async m => {
            const girdi = m.content.toLowerCase().trim();

            // oyunu iptal etme
            if (girdi === 'iptal') {
                collector.stop('iptal');
                return message.channel.send('oyun iptal edildi.');
            }

            // ipucu sistemi
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

                // henüz açılmamış harfleri bul
                const acilmamisHarfler = [];
                for (let i = 0; i < secilenKelime.length; i++) {
                    if (gizliKelime[i] === '_') {
                        acilmamisHarfler.push(secilenKelime[i]);
                    }
                }

                if (acilmamisHarfler.length === 0) return;

                // rastgele bir harf seç ve aç
                const rastgeleIpucuHarf = acilmamisHarfler[Math.floor(Math.random() * acilmamisHarfler.length)];
                tahminEdilenHarfler.add(rastgeleIpucuHarf);
                ipucuKullanildi = true;
                kalanHak--; // ipucu cezası olarak 1 hak eksilt

                for (let i = 0; i < secilenKelime.length; i++) {
                    if (secilenKelime[i] === rastgeleIpucuHarf) {
                        gizliKelime[i] = rastgeleIpucuHarf;
                    }
                }

                message.channel.send(`💡 **ipucu:** Kelimede **"${rastgeleIpucuHarf.toUpperCase()}"** harfi var! (1 hak harcandı)`).then(msg => {
                    setTimeout(() => msg.delete().catch(() => {}), 4000);
                });

                // ipucu sonrası kazandı mı kontrolü
                if (!gizliKelime.includes('_')) {
                    collector.stop('kazandi');
                    const kazanEmbed = new EmbedBuilder()
                        .setTitle('🎉 tebrikler, kazandın!')
                        .setColor('#2ecc71')
                        .setDescription(`kelimeyi doğru bildin: **${secilenKelime}**\n**zorluk:** \`${zorluk}\``);
                    return oyunMesaji.edit({ embeds: [kazanEmbed] });
                }
            } else {
                // harf tahmini kontrolü
                if (girdi.length !== 1 || !/[a-zçğıöşü]/i.test(girdi)) {
                    return;
                }

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
**ipucu durumu:** ${ipucuKullanildi ? '❌ kullanıldı' : '✅ kullanılabilir (1 hak eksiltir)'}
                `)
                .setFooter({ text: 'oyunu iptal etmek için "iptal", ipucu için "ipucu" yazabilirsin.' });

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
