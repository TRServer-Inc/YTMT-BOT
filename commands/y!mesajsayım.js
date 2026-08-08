const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'mesajsayım',
    description: 'Etiketlenen kişinin veya kendinizin mesaj sayısını gösterir.',
    async execute(message, args, client) {
        const hedefKullanici = message.mentions.users.first() || message.author;
        const mesajDataPath = path.join(process.cwd(), 'mesaj-data.json');

        if (!fs.existsSync(mesajDataPath)) {
            return message.reply('henüz hiç mesaj verisi kaydedilmedi kanka!');
        }

        const mesajData = JSON.parse(fs.readFileSync(mesajDataPath, 'utf8'));
        const guildData = mesajData[message.guild.id] || {};
        const userData = guildData[hedefKullanici.id] || { toplam: 0, haftalik: {} };

        // Mevcut haftayı hesapla
        const bugun = new Date();
        const d = new Date(Date.UTC(bugun.getFullYear(), bugun.getMonth(), bugun.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        const haftaKey = `${d.getUTCFullYear()}-${weekNo}`;

        const haftalikMesaj = (userData.haftalik && userData.haftalik[haftaKey]) ? userData.haftalik[haftaKey] : 0;

        const embed = new EmbedBuilder()
            .setTitle(`💬 Mesaj İstatistikleri`)
            .setColor('#3b82f6')
            .setThumbnail(hedefKullanici.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Kullanıcı', value: `${hedefKullanici}`, inline: true },
                { name: 'Toplam Mesaj', value: `\`${userData.toplam}\``, inline: true },
                { name: 'Bu Haftaki Mesaj', value: `\`${haftalikMesaj}\``, inline: true }
            )
            .setFooter({ text: `${message.guild.name} • Mesaj Sayacı` })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
};
