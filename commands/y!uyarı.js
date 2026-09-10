const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Uyari } = require('../data/db.js');

module.exports = {
    name: 'uyarı',
    description: 'kullanıcıya belirtilen miktarda uyarı verir ve veritabanına kaydeder.',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages) && message.author.id !== message.guild.ownerId) {
            return message.reply('bu komutu kullanmak için **Mesajları Yönet** yetkisine sahip olmalısın kanka! 🛑');
        }

        if (!args[0]) {
            return message.reply('kullanım şekli: `y!uyarı <miktar> <id_veya_etiket> <sebep>` veya `y!uyarı <id_veya_etiket> <sebep>`');
        }

        // 2. Çok Akıllı Argüman ve Max 10 Kontrolü
        let uyariMiktari = 1;
        let hedefIndex = 0;

        const idRegex = /^\d{17,21}$/;
        const mentionRegex = /^<@!?\d{17,21}>$/;

        // Eğer ilk argüman direkt ID veya Etiket ise (yani sayı girilmemiş)
        if (idRegex.test(args[0]) || mentionRegex.test(args[0])) {
            uyariMiktari = 1;
            hedefIndex = 0;
        } else {
            // İlk argüman ID/Etiket değilse, uyarı sayısı olmak zorundadır
            const girilenSayi = parseInt(args[0]);
            
            if (isNaN(girilenSayi) || girilenSayi <= 0) {
                return message.reply('lütfen geçerli bir uyarı miktarı (1-10 arası) gir veya direkt kullanıcıyı etiketle kanka!');
            }
            
            if (girilenSayi > 10) {
                return message.reply('yavaşşş! tek seferde en fazla **10** uyarı verebilirsin kanka. adamı mı katlediyon? 🛑');
            }

            uyariMiktari = girilenSayi;
            hedefIndex = 1;
        }

        const hedefInput = args[hedefIndex];
        if (!hedefInput) {
            return message.reply('lütfen uyarmak istediğin kullanıcıyı etiketle veya ID\'sini gir kanka!');
        }

        // 3. Kullanıcı bulma
        let hedefUye = message.mentions.members.first();
        let hedefUser = null;

        if (hedefUye) {
            hedefUser = hedefUye.user;
        } else {
            if (idRegex.test(hedefInput)) {
                try {
                    hedefUye = await message.guild.members.fetch(hedefInput);
                    hedefUser = hedefUye.user;
                } catch (e) {
                    try {
                        hedefUser = await client.users.fetch(hedefInput);
                    } catch (err) {
                        return message.reply('geçersiz veya bulunamayan bir Discord ID\'si girdin kanka!');
                    }
                }
            } else {
                return message.reply('geçersiz bir etiket veya ID girdin kanka!');
            }
        }

        // 4. Korumalar
        if (hedefUser.id === message.author.id) {
            return message.reply('kendine uyarı veremezsin kanka! 😂');
        }

        if (hedefUser.bot) {
            return message.reply('botları uyaramazsın kanka!');
        }

        if (hedefUser.id === message.guild.ownerId) {
            return message.reply('sunucu sahibini uyarmaya gücün yetmez kanka! 👑🛑');
        }

        // 5. Hiyerarşi kontrolü
        if (hedefUye && message.author.id !== message.guild.ownerId) {
            const atanEnYuksekRol = message.member.roles.highest.position;
            const hedefEnYuksekRol = hedefUye.roles.highest.position;

            if (hedefEnYuksekRol >= atanEnYuksekRol) {
                return message.reply('seninle aynı seviyede veya senden üst rolde olan birini uyaramazsın kanka! 🛡️');
            }
        }

        // Sebep belirleme
        const sebepMetni = args.slice(hedefIndex + 1).join(' ') || 'sebep belirtilmedi';

        try {
            // Şemandaki Obje yapısına tam uygun obje
            const yeniUyariObjesi = {
                sebep: sebepMetni,
                uyaran: message.author.id,
                tarih: new Date()
            };

            const eklenecekUyarilar = Array(uyariMiktari).fill(yeniUyariObjesi);

            const guncelKayit = await Uyari.findOneAndUpdate(
                { guildId: String(message.guild.id), userId: String(hedefUser.id) },
                { $push: { uyarilar: { $each: eklenecekUyarilar } } },
                { new: true, upsert: true }
            );

            const sunucudaMiMesaj = hedefUye ? '' : ' *(Kullanıcı şu an sunucuda bulunmuyor, uyarı veritabanına işlendi)*';
            const toplamSayi = guncelKayit && guncelKayit.uyarilar ? guncelKayit.uyarilar.length : 0;

            const uyariEmbed = new EmbedBuilder()
                .setColor('#f59e0b')
                .setTitle('⚠️ kullanıcı uyarıldı!')
                .setDescription(`<@${hedefUser.id}> (${hedefUser.tag}) kullanıcısına **+${uyariMiktari}** uyarı eklendi.${sunucudaMiMesaj}\n\n**uyaran:** ${message.author}\n**sebep:** ${sebepMetni}\n**toplam uyarı:** ${toplamSayi}`)
                .setTimestamp();

            await message.channel.send({ embeds: [uyariEmbed] });

        } catch (err) {
            console.error('[UYARI KOMUT HATA DETAILS]:', err);
            return message.reply('uyarı verilirken veritabanı hatası oluştu kanka!');
        }
    }
};
