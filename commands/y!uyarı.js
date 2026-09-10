const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Uyari } = require('../data/db.js');

module.exports = {
    name: 'uyarı',
    description: 'kullanıcıya belirtilen miktarda uyarı verir ve veritabanına kaydeder.',
    async execute(message, args, client) {
        // 1. Yetki kontrolü
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages) && message.author.id !== message.guild.ownerId) {
            return message.reply('bu komutu kullanmak için **Mesajları Yönet** yetkisine sahip olmalısın kanka! 🛑');
        }

        if (!args[0]) {
            return message.reply('kullanım şekli: `y!uyarı <mektar> <id_veya_etiket> <sebep>` veya `y!uyarı <id_veya_etiket> <sebep>`');
        }

        // 2. Akıllı Argüman Kontrolü (Sayı var mı yok mu?)
        let uyariMiktari = parseInt(args[0]);
        let hedefIndex = 1;

        // İlk argüman bir sayı değilse, varsayılan olarak 1 uyarı say ve hedefi args[0] yap
        if (isNaN(uyariMiktari) || uyariMiktari <= 0) {
            uyariMiktari = 1;
            hedefIndex = 0;
        }

        const hedefInput = args[hedefIndex];
        if (!hedefInput) {
            return message.reply('lütfen uyarmak istediğin kullanıcıyı etiketle veya ID\'sini gir kanka!');
        }

        // 3. Kullanıcı bulma (ID / Etiket)
        let hedefUye = message.mentions.members.first();
        let hedefUser = null;

        if (hedefUye) {
            hedefUser = hedefUye.user;
        } else {
            const idRegex = /^\d{17,21}$/;
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

        // Sebep dinamik olarak sayı girildiyse 2, girilmediyse 1. indeksten başlar
        const sebepMetni = args.slice(hedefIndex + 1).join(' ') || 'sebep belirtilmedi';

        try {
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
