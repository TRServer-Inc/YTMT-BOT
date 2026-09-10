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
            return message.reply('kullanım şekli: `y!uyarı <kaç_uyarı> <id_veya_etiket> <sebep>`\nörnek: `y!uyarı 2 @kullanıcı küfür`');
        }

        // 2. Argüman ayıklama (mühim kısım: sayı, etiket/id ve sebep)
        let uyariMiktari = parseInt(args[0]);
        let hedefIndex = 1;

        if (isNaN(uyariMiktari) || uyariMiktari <= 0) {
            uyariMiktari = 1;
            hedefIndex = 0;
        }

        const hedefInput = args[hedefIndex];
        if (!hedefInput) {
            return message.reply('lütfen uyarmak istediğin kullanıcıyı etiketle veya ID\'sini gir kanka!');
        }

        let hedefUye = message.mentions.members.first();
        let hedefUser = null;

        // 3. Kullanıcıyı bul
        if (hedefUye) {
            hedefUser = hedefUye.user;
        } else {
            const idRegex = /^\d{17,19}$/;
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

        // 5. Rol hiyerarşisi
        if (hedefUye && message.author.id !== message.guild.ownerId) {
            const atanEnYuksekRol = message.member.roles.highest.position;
            const hedefEnYuksekRol = hedefUye.roles.highest.position;

            if (hedefEnYuksekRol >= atanEnYuksekRol) {
                return message.reply('seninle aynı seviyede veya senden üst rolde olan birini uyaramazsın kanka! 🛡️');
            }
        }

        // Sebep alma
        const sebep = args.slice(hedefIndex + 1).join(' ') || 'sebep belirtilmedi';

        try {
            // Önceki çalışan veritabanı kaydetme mantığı
            let kayit = await Uyari.findOne({ guildId: message.guild.id, userId: hedefUser.id });
            
            if (!kayit) {
                kayit = new Uyari({
                    guildId: message.guild.id,
                    userId: hedefUser.id,
                    count: uyariMiktari,
                    reasons: [sebep]
                });
            } else {
                kayit.count += uyariMiktari;
                kayit.reasons.push(sebep);
            }

            await kayit.save();

            const sunucudaMiMesaj = hedefUye ? '' : ' *(Kullanıcı şu an sunucuda bulunmuyor, uyarı veritabanına işlendi)*';

            const uyariEmbed = new EmbedBuilder()
                .setColor('#f59e0b')
                .setTitle('⚠️ kullanıcı uyarıldı!')
                .setDescription(`<@${hedefUser.id}> (${hedefUser.tag}) kullanıcısına **+${uyariMiktari}** uyarı eklendi.${sunucudaMiMesaj}\n\n**uyaran:** ${message.author}\n**sebep:** ${sebep}\n**toplam uyarı:** ${kayit.count}`)
                .setTimestamp();

            await message.channel.send({ embeds: [uyariEmbed] });

        } catch (err) {
            console.error('[UYARI KOMUT HATA]', err);
            return message.reply('uyarı verilirken veritabanı hatası oluştu kanka!');
        }
    }
};
