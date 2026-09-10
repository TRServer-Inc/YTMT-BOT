const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Uyari } = require('../data/db.js');

module.exports = {
    name: 'uyarılar',
    description: 'bir kullanıcının toplam uyarılarını ve sebeplerini gösterir.',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages) && message.author.id !== message.guild.ownerId) {
            return message.reply('bu komutu kullanmak için **Mesajları Yönet** yetkisine sahip olmalısın kanka! 🛑');
        }

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
            const kayit = await Uyari.findOne({ guildId: String(message.guild.id), userId: String(hedefUser.id) });

            if (!kayit || !Array.isArray(kayit.uyarilar) || kayit.uyarilar.length === 0) {
                return message.reply(`<@${hedefUser.id}> kullanıcısının hiç uyarısı yok kanka! 🥳`);
            }

            // Şemandaki obje yapısından 'sebep' ve 'uyaran' bilgilerini çekiyoruz
            const sebeplerListesi = kayit.uyarilar
                .map((u, index) => {
                    const sebepMetni = typeof u === 'object' && u.sebep ? u.sebep : u;
                    const uyaranMetni = typeof u === 'object' && u.uyaran ? `<@${u.uyaran}>` : 'Bilinmiyor';
                    return `**${index + 1}.** ${sebepMetni} *(Uyaran: ${uyaranMetni})*`;
                })
                .join('\n');

            const embed = new EmbedBuilder()
                .setColor('#f59e0b')
                .setTitle(`⚠️ ${hedefUser.tag} - Uyarı Geçmişi`)
                .setDescription(`<@${hedefUser.id}> kullanıcısının veritabanındaki uyarı bilgileri:`)
                .addFields(
                    { name: '📊 Toplam Uyarı Sayısı', value: `\`${kayit.uyarilar.length}\``, inline: true },
                    { name: '📜 Uyarı Sebepleri', value: sebeplerListesi.length > 1024 ? sebeplerListesi.slice(0, 1000) + '...' : sebeplerListesi, inline: false }
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
