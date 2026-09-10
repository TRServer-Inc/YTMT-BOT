const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Uyari } = require('../data/db.js');

module.exports = {
    name: 'uyarı',
    description: 'kullanıcıya uyarı verir, 3 uyarıda the void rolü atar.',
    async execute(message, args, client) {
        // 1. Komutu atan kişinin yetkisi var mı? (Yönetici veya Mesajları Yönet yetkisi olmalı)
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages) && message.author.id !== message.guild.ownerId) {
            return message.reply('bu komutu kullanmak için **Mesajları Yönet** yetkisine sahip olmalısın kanka! 🛑');
        }

        const hedefInput = args[0];
        if (!hedefInput) {
            return message.reply('lütfen uyarmak istediğin kullanıcıyı etiketle veya ID\'sini gir kanka! Örnek: `y!uyarı @kullanıcı sebep` veya `y!uyarı 123456789012345678 sebep`');
        }

        let hedefUye = message.mentions.members.first();
        let hedefUser = null;

        // 2. Kullanıcıyı sunucuda veya global Discord ID üzerinden bul
        if (hedefUye) {
            hedefUser = hedefUye.user;
        } else {
            const idRegex = /^\d{17,19}$/;
            if (idRegex.test(hedefInput)) {
                // Öncelik: Sunucudaki üyeyi bulmaya çalış
                try {
                    hedefUye = await message.guild.members.fetch(hedefInput);
                    hedefUser = hedefUye.user;
                } catch (e) {
                    // Sunucuda yoksa global Discord kullanıcısı olarak çek
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

        // 3. Kendini uyarmaya çalışıyorsa engelle
        if (hedefUser.id === message.author.id) {
            return message.reply('kendine uyarı veremezsin kanka! 😂');
        }

        // 4. Botu uyarmaya çalışıyorsa engelle
        if (hedefUser.bot) {
            return message.reply('botları uyaramazsın kanka!');
        }

        // 5. Sunucu sahibini uyarmaya çalışıyorsa engelle
        if (hedefUser.id === message.guild.ownerId) {
            return message.reply('sunucu sahibini uyarmaya gücün yetmez kanka! 👑🛑');
        }

        // 6. Rol hiyerarşi kontrolü (Sadece kullanıcı sunucudaysa yapılır)
        if (hedefUye && message.author.id !== message.guild.ownerId) {
            const atanEnYuksekRol = message.member.roles.highest.position;
            const hedefEnYuksekRol = hedefUye.roles.highest.position;

            if (hedefEnYuksekRol >= atanEnYuksekRol) {
                return message.reply('seninle aynı seviyede veya senden üst rolde olan birini uyaramazsın kanka! 🛡️');
            }
        }

        // Sebep kontrolü
        const sebep = args.slice(1).join(' ') || 'sebep belirtilmedi';

        try {
            // MongoDB kaydı güncelle/oluştur
            let kayit = await Uyari.findOne({ guildId: message.guild.id, userId: hedefUser.id });
            
            if (!kayit) {
                kayit = new Uyari({
                    guildId: message.guild.id,
                    userId: hedefUser.id,
                    count: 1,
                    reasons: [sebep]
                });
            } else {
                kayit.count += 1;
                kayit.reasons.push(sebep);
            }

            await kayit.save();

            const sunucudaMiMesaj = hedefUye ? '' : ' *(Kullanıcı şu an sunucuda bulunmuyor, uyarı veritabanına işlendi)*';

            const uyariEmbed = new EmbedBuilder()
                .setColor('#f59e0b')
                .setTitle('⚠️ kullanıcı uyarıldı!')
                .setDescription(`<@${hedefUser.id}> (${hedefUser.tag}) kullanıcısına uyarı verildi.${sunucudaMiMesaj}\n\n**uyaran:** ${message.author}\n**sebep:** ${sebep}\n**toplam uyarı:** ${kayit.count}/3`)
                .setTimestamp();

            await message.channel.send({ embeds: [uyariEmbed] });

            // 3. Uyarıya ulaştıysa "🛑 The Void" rolü ver (Sadece sunucudaysa rol verilebilir)
            if (kayit.count >= 3) {
                if (hedefUye) {
                    const voidRol = message.guild.roles.cache.find(r => r.name === '🛑 The Void');
                    if (voidRol) {
                        await hedefUye.roles.add(voidRol).catch(err => console.error('[VOID ROL HATA]', err));
                        
                        const voidEmbed = new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('🛑 the void katmanına gönderildi!')
                            .setDescription(`${hedefUye} 3 uyarıya ulaştığı için **The Void** rolü verilerek susturuldu!`)
                            .setTimestamp();

                        await message.channel.send({ embeds: [voidEmbed] });
                    } else {
                        await message.channel.send('⚠️ kullanıcı 3 uyarıya ulaştı ama sunucuda **🛑 The Void** rolü bulunamadı!');
                    }
                } else {
                    await message.channel.send('⚠️ kullanıcı 3 uyarıya ulaştı ama sunucuda olmadığı için **The Void** rolü verilemedi!');
                }
            }

        } catch (err) {
            console.error('[UYARI KOMUT HATA]', err);
            return message.reply('uyarı verilirken veritabanı hatası oluştu kanka!');
        }
    }
};
