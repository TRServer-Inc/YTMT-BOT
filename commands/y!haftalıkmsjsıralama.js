const { EmbedBuilder } = require('discord.js');
const { MesajSayim } = require('../data/db.js');

module.exports = {
    name: 'y!haftalıkmsjsıralama',
    description: 'sunucuda en çok mesaj atan ilk 10 kullanıcıyı sıralar.',
    async execute(message, args, client) {
        try {
            // sunucuya ait tüm mesaj verilerini en yüksekten düşüğe doğru çekiyoruz
            const sıralama = await MesajSayim.find({ guildId: message.guild.id })
                .sort({ count: -1 })
                .limit(10);

            if (!sıralama || sıralama.length === 0) {
                return message.reply('bu sunucuda henüz kaydedilmiş bir mesaj verisi yok kanka!');
            }

            let listeMetni = '';
            for (let i = 0; i < sıralama.length; i++) {
                const verı = sıralama[i];
                const kullanıcı = await client.users.fetch(verı.userId).catch(() => null);
                const isim = kullanıcı ? kullanıcı.username : 'Bilinmeyen Kullanıcı';

                let madalya = `**${i + 1}.**`;
                if (i === 0) madalya = '🥇';
                else if (i === 1) madalya = '🥈';
                else if (i === 2) madalya = '🥉';

                listeMetni += `${madalya} **${isim}** — \`${verı.count}\` mesaj\n`;
            }

            const embed = new EmbedBuilder()
                .setColor('#f59e0b')
                .setTitle('🏆 haftalık mesaj sıralaması')
                .setDescription(listeMetni)
                .setFooter({ text: `${message.guild.name} liderlik tablosu`, iconURL: message.guild.iconURL({ dynamic: true }) })
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } catch (err) {
            console.error('[HAFTALIK MSJ SIRALAMA HATA]', err);
            await message.reply('sıralama çekilirken bir veritabanı hatası oluştu kanka!');
        }
    }
};
