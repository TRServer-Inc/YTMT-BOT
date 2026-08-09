const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'mesajsayım',
    description: 'sunucudaki mesaj istatistiklerinizi gösterir.',
    async execute(message, args, client) {
        const dataPath = path.join(process.cwd(), 'data', 'mesaj-data.json');

        if (!fs.existsSync(dataPath)) {
            return message.reply('henüz kaydedilmiş herhangi bir mesaj verisi yok!');
        }

        let mesajData = {};
        try {
            const rawData = fs.readFileSync(dataPath, 'utf8');
            mesajData = JSON.parse(rawData);
        } catch (e) {
            return message.reply('mesaj verisi okunurken bir hata oluştu!');
        }

        const guildData = mesajData[message.guild.id];
        if (!guildData || !guildData[message.author.id]) {
            return message.reply('bu sunucuda henüz kayıtlı bir mesaj verin bulunmuyor kanka!');
        }

        const userData = guildData[message.author.id];
        const toplamMesaj = userData.toplam || 0;

        // bu haftanın anahtarını hesapla
        const bugun = new Date();
        const d = new Date(Date.UTC(bugun.getFullYear(), bugun.getMonth(), bugun.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        const buHaftaKey = `${d.getUTCFullYear()}-${weekNo}`;

        const haftalikMesaj = (userData.haftalik && userData.haftalik[buHaftaKey]) ? userData.haftalik[buHaftaKey] : 0;

        const embed = new EmbedBuilder()
            .setTitle(`📊 ${message.author.username} - Mesaj İstatistikleri`)
            .setColor('#3b82f6')
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '💬 Toplam Mesaj', value: `**${toplamMesaj}** mesaj`, inline: true },
                { name: '📅 Bu Haftaki Mesaj', value: `**${haftalikMesaj}** mesaj`, inline: true }
            )
            .setFooter({ text: `${message.guild.name} sohbet analizi` })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
};
