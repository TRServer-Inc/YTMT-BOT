const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'uyarılar',
    description: 'Kullanıcının uyarı geçmişini ve toplam uyarısını gösterir.',
    async execute(message, args, client) {
        const hedef = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        const uyarilarPath = path.join(__dirname, '../data/uyarilar.json');

        if (!fs.existsSync(uyarilarPath)) {
            return message.reply(`**${hedef.user.tag}** kullanıcısının hiç uyarısı bulunmuyor kanka!`);
        }

        let uyarilarData = {};
        try {
            uyarilarData = JSON.parse(fs.readFileSync(uyarilarPath, 'utf8'));
        } catch (err) {
            uyarilarData = {};
        }

        const guildID = message.guild.id;
        const userID = hedef.id;

        const kullaniciUyarilari = uyarilarData[guildID]?.[userID] || [];

        if (kullaniciUyarilari.length === 0) {
            return message.reply(`**${hedef.user.tag}** kullanıcısının hiç uyarısı bulunmuyor kanka!`);
        }

        const toplamUyari = kullaniciUyarilari.length;
        const kalanHak = 10 - toplamUyari;

        const liste = kullaniciUyarilari.map((u, i) => `**${i + 1}.** Sebep: \`${u.sebep}\` | Yetkili: <@${u.yetkili}>`).join('\n');

        const embed = new EmbedBuilder()
            .setTitle(`📊 Uyarı Geçmişi - ${hedef.user.username}`)
            .setColor('#3b82f6')
            .setThumbnail(hedef.user.displayAvatarURL())
            .addFields(
                { name: 'Toplam Uyarı', value: `\`${toplamUyari} / 10\``, inline: true },
                { name: 'Kalan Ban Hakkı', value: `\`${kalanHak}\``, inline: true },
                { name: 'Uyarı Detayları', value: liste.length > 1024 ? liste.substring(0, 1020) + '...' : liste, inline: false }
            )
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    }
};
