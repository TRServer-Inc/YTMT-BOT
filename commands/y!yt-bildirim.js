const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { YtBildirim } = require('../data/db.js');

module.exports = {
    name: 'yt-bildirim',
    description: 'youtube kanal bildirimlerini discord kanalına bağlar.',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator) && message.author.id !== message.guild.ownerId) {
            return message.reply('bu komutu kullanmak için **Yönetici** yetkisine sahip olmalısın kanka! 🛑');
        }

        if (args.length < 3) {
            return message.reply(
                'kullanım şekli:\n' +
                '`y!yt-bildirim <yt_url> <#discord_kanal> <video|yayin|hepsi> [özel_mesaj]`\n\n' +
                'örnek:\n' +
                '`y!yt-bildirim https://www.youtube.com/@RealMertty #duyuru hepsi Hey millet yeni video geldi!`'
            );
        }

        const ytUrl = args[0];
        const hedefKanal = message.mentions.channels.first() || message.guild.channels.cache.get(args[1].replace(/[<#>]/g, ''));
        const bildirimTipi = args[2].toLowerCase();
        const ozelMesaj = args.slice(3).join(' ') || 'Hey @everyone, yeni bir YouTube içeriği yayınlandı!';

        if (!hedefKanal) {
            return message.reply('lütfen bildirimlerin gönderileceği geçerli bir Discord kanalı etiketle kanka!');
        }

        if (!['video', 'yayin', 'hepsi'].includes(bildirimTipi)) {
            return message.reply('bildirim tipi sadece `video`, `yayin` veya `hepsi` olabilir kanka!');
        }

        try {
            await YtBildirim.findOneAndUpdate(
                { guildId: String(message.guild.id), ytUrl: ytUrl },
                {
                    guildId: String(message.guild.id),
                    channelId: String(hedefKanal.id),
                    ytUrl: ytUrl,
                    tip: bildirimTipi,
                    mesaj: ozelMesaj
                },
                { new: true, upsert: true }
            );

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('📺 YouTube Bildirimi Ayarlandı!')
                .setDescription(
                    `**YouTube Adresi:** ${ytUrl}\n` +
                    `**Gönderilecek Kanal:** ${hedefKanal}\n` +
                    `**Bildirim Tipi:** \`${bildirimTipi}\`\n` +
                    `**Özel Mesaj:** ${ozelMesaj}`
                )
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error('[YT BILDIRIM KOMUT HATA]:', err);
            return message.reply('YouTube bildirimi ayarlanırken bir veritabanı hatası oluştu kanka!');
        }
    }
};
