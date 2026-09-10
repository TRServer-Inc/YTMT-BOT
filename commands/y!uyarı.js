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

        // 2. Etiket veya ID üzerinden kullanıcıyı bul
        let hedefUye = message.mentions.members.first();
        if (!hedefUye) {
            // Sadece rakamlardan oluşuyorsa ID olarak ara
            const idRegex = /^\d{17,19}$/;
            if (idRegex.test(hedefInput)) {
                try {
                    hedefUye = await message.guild.members.fetch(hedefInput);
                } catch (e) {
                    return message.reply('belirttiğin ID\'ye sahip bir kullanıcı sunucuda bulunamadı kanka!');
                }
            } else {
                return message.reply('geçersiz bir etiket veya ID girdin kanka!');
            }
        }

        // 3. Kendini uyarmaya çalışıyorsa engelle
        if (hedefUye.id === message.author.id) {
            return message.reply('kendine uyarı veremezsin kanka! 😂');
        }

        // 4. Botu uyarmaya çalışıyorsa engelle
        if (hedefUye.user.bot) {
            return message.reply('botları uyaramazsın kanka!');
        }

        // 5. Sunucu sahibini uyarmaya çalışıyorsa engelle
        if (hedefUye.id === message.guild.ownerId) {
            return message.reply('sunucu sahibini uyarmaya gücün yetmez kanka! 👑🛑');
        }

        // 6. Rol hiyerarşi kontrolü (senin rolünden aşağıdaki kişileri uyarma mantığı)
        if (message.author.id !== message.guild.ownerId) {
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
            let kayit = await Uyari.findOne({ guildId: message.guild.id, userId: hedefUye.id });
            
            if (!kayit) {
                kayit = new Uyari({
                    guildId: message.guild.id,
                    userId: hedefUye.id,
                    count: 1,
                    reasons: [sebep]
                });
            } else {
                kayit.count += 1;
                kayit.reasons.push(sebep);
            }

            await kayit.save();

            const uyariEmbed = new EmbedBuilder()
                .setColor('#f59e0b')
                .setTitle('⚠️ kullanıcı uyarıldı!')
                .setDescription(`${hedefUye} kullanıcısına uyarı verildi.\n\n**uyaran:** ${message.author}\n**sebep:** ${sebep}\n**toplam uyarı:** ${kayit.count}/3`)
                .setTimestamp();

            await message.channel.send({ embeds: [uyariEmbed] });

            // 3. Uyarıya ulaştıysa "🛑 The Void" rolü ver
            if (kayit.count >= 3) {
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
            }

        } catch (err) {
            console.error('[UYARI KOMUT HATA]', err);
            return message.reply('uyarı verilirken veritabanı hatası oluştu kanka!');
        }
    }
};
