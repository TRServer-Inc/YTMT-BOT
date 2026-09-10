const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Uyari } = require('../data/db.js');

module.exports = {
    name: 'uyarılar',
    description: 'bir kullanıcının toplam uyarılarını ve sebeplerini gösterir.',
    async execute(message, args, client) {
        // 1. Yetki kontrolü (Yönetici veya Mesajları Yönet yetkisi)
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages) && message.author.id !== message.guild.ownerId) {
            return message.reply('bu komutu kullanmak için **Mesajları Yönet** yetkisine sahip olmalısın kanka! 🛑');
        }

        // Eğer argüman girilmediyse komutu atan kişinin kendisine baksın, girildiyse o hedefi arasın
        const hedefInput = args[0];
        let hedefUye = message.mentions.members.first();
        let hedefUser = null;

        if (!hedefInput) {
            hedefUser = message.author;
            hedefUye = message.member;
        } else if (hedefUye) {
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

        try {
            // MongoDB'den kullanıcının uyarı kaydını çek
            const kayit = await Uyari.findOne({ guildId: message.guild.id, userId: hedefUser.id });

            if (!kayit || !kayit.count || kayit.count === 0) {
                return message.reply(`<@${hedefUser.id}> kullanıcısının hiç uyarısı yok kanka! 🥳`);
            }

            // Sebepleri liste haline getir
            const sebeplerListesi = Array.isArray(kayit.reasons) && kayit.reasons.length > 0
                ? kayit.reasons.map((sebep, index) => `**${index + 1}.** ${sebep}`).join('\n')
                : 'sebep kaydı bulunamadı.';

            const embed = new EmbedBuilder()
                .setColor('#f59e0b')
                .setTitle(`⚠️ ${hedefUser.tag} - Uyarı Geçmişi`)
                .setDescription(`<@${hedefUser.id}> kullanıcısının veritabanındaki uyarı bilgileri:`)
                .addFields(
                    { name: '📊 Toplam Uyarı Sayısı', value: `\`${kayit.count}\``, inline: true },
                    { name: '📜 Uyarı Sebepleri', value: sebeplerListesi, inline: false }
                )
                .setThumbnail(hedefUser.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error('[UYARILAR KOMUT HATA DETAILS]:', err);
            return message.reply('uyarılar listelenirken veritabanı hatası oluştu kanka!');
        }
    }
};
