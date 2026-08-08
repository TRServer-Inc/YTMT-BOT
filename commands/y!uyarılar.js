const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/uyarilar.json');

function uyarilariOku() {
    if (!fs.existsSync(dataPath)) return {};
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(rawData || '{}');
}

module.exports = {
    name: 'uyarılar',
    description: 'Uyarı geçmişini ve sınır durumunu gösterir.',
    async execute(message, args, client) {
        const isAdmin = message.member.permissions.has(PermissionFlagsBits.ManageMessages) || message.member.permissions.has(PermissionFlagsBits.Administrator);
        const etiketlenen = message.mentions.members.first();

        let hedef;

        if (etiketlenen) {
            if (!isAdmin) {
                return message.reply({ content: 'başka kullanıcıların uyarılarına bakmak için yetkin yok kanka! sadece kendi uyarılarına bakabilirsin (`y!uyarılar`).' });
            }
            hedef = etiketlenen;
        } else {
            hedef = message.member;
        }

        const guildId = message.guild.id;
        const userId = hedef.id;

        const uyarilar = uyarilariOku();
        const kullaniciUyarilari = uyarilar[guildId]?.[userId] || [];

        const toplamUyari = kullaniciUyarilari.length;
        const kalanUyari = 10 - toplamUyari;

        const embed = new EmbedBuilder()
            .setTitle(`📋 Uyarı Bilgisi - ${hedef.user.username}`)
            .setColor('#3b82f6')
            .setThumbnail(hedef.user.displayAvatarURL())
            .addFields(
                { name: '👤 Kullanıcı', value: `${hedef.user.tag}`, inline: true },
                { name: '📊 Toplam Uyarı', value: `${toplamUyari} / 10`, inline: true },
                { name: '🚨 Ban Sınırına Kalan', value: `${kalanUyari > 0 ? kalanUyari : 0} uyarı`, inline: true }
            )
            .setFooter({ text: 'Sınır 10 uyarıdır.' })
            .setTimestamp();

        if (toplamUyari > 0) {
            const sonUyarilar = kullaniciUyarilari.slice(-5).map((u, i) => `**${i + 1}.** Sebep: \`${u.sebep}\``).join('\n');
            embed.addFields({ name: '📜 Son Uyarı Sebepleri', value: sonUyarilar, inline: false });
        } else {
            embed.addFields({ name: '📜 Uyarı Geçmişi', value: 'Temiz! Hiç uyarısı yok kanka.', inline: false });
        }

        await message.channel.send({ embeds: [embed] });
    }
};
