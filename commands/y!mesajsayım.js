const { EmbedBuilder } = require('discord.js');
const { MesajSayim } = require('../data/db.js');

module.exports = {
    name: 'y!mesajsayım',
    description: 'sunucudaki toplam mesaj sayını gösterir.',
    async execute(message, args, client) {
        const hedef = message.mentions.users.first() || message.author;

        try {
            const kayit = await MesajSayim.findOne({ guildId: message.guild.id, userId: hedef.id });
            const sayi = kayit ? kayit.count : 0;

            const embed = new EmbedBuilder()
                .setColor('#3b82f6')
                .setTitle('📊 mesaj istatistiği')
                .setThumbnail(hedef.displayAvatarURL({ dynamic: true }))
                .setDescription(`**${hedef.username}** kullanıcısının bu sunucudaki kayıtlı mesaj sayısı: **${sayi}**`)
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } catch (err) {
            console.error('[MESAJ SAYIM HATA]', err);
            await message.reply('istatistikler veritabanından çekilirken bir hata oluştu kanka!');
        }
    }
};
