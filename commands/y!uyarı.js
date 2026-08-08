const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/uyarilar.json');

// json dosyasını okuma yardımcı fonksiyonu
function uyarilariOku() {
    if (!fs.existsSync(path.dirname(dataPath))) {
        fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    }
    if (!fs.existsSync(dataPath)) {
        fs.writeFileSync(dataPath, '{}', 'utf-8');
    }
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(rawData || '{}');
}

// json dosyasına yazma yardımcı fonksiyonu
function uyarilariYaz(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
    name: 'uyarı',
    description: 'Kullanıcıya kural ihlali nedeniyle uyarı verir.',
    async execute(message, args, client) {
        // yetki kontrolü (sadece yetkisi olan adminler)
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages) && !message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply({ content: 'bu komutu kullanmak için mesajları yönet yetkisine sahip olmalısın kanka!' });
        }

        const hedef = message.mentions.members.first();
        if (!hedef) {
            return message.reply({ content: 'lütfen uyarılacak kullanıcıyı etiketle kanka! Örnek: `y!uyarı @kullanıcı sebep`' });
        }

        if (hedef.id === message.author.id) {
            return message.reply({ content: 'kendine uyarı veremezsin kanka!' });
        }

        if (hedef.user.bot) {
            return message.reply({ content: 'botlara uyarı veremezsin kanka!' });
        }

        const sebep = args.slice(1).join(' ') || 'Sebep belirtilmedi.';
        const guildId = message.guild.id;
        const userId = hedef.id;

        const uyarilar = uyarilariOku();

        if (!uyarilar[guildId]) uyarilar[guildId] = {};
        if (!uyarilar[guildId][userId]) uyarilar[guildId][userId] = [];

        // yeni uyarıyı ekle
        uyarilar[guildId][userId].push({
            sebep: sebep,
            yazan: message.author.id,
            tarih: new Date().toISOString()
        });

        uyarilariYaz(uyarilar);

        const toplamUyari = uyarilar[guildId][userId].length;
        const kalanUyari = 10 - toplamUyari;

        const embed = new EmbedBuilder()
            .setTitle('⚠️ Kullanıcıya Uyarı Verildi')
            .setColor('#f59e0b')
            .setThumbnail(hedef.user.displayAvatarURL())
            .addFields(
                { name: '👤 Uyarılan Kullanıcı', value: `${hedef.user.tag} (${hedef})`, inline: true },
                { name: '🛡️ Uyarı Veren Yetkili', value: `${message.author.tag}`, inline: true },
                { name: '📝 Uyarı Sebebi', value: sebep, inline: false },
                { name: '📊 Toplam Uyarı Sayısı', value: `${toplamUyari} / 10`, inline: true },
                { name: '🚨 Ban Yeme İhtimaline Kalan', value: `${kalanUyari > 0 ? kalanUyari : 0} uyarı`, inline: true }
            )
            .setFooter({ text: '10 uyarıya ulaşan kullanıcılar ban riski taşır.' })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });

        // kullanıcıya dm üzerinden bilgilendirme
        try {
            await hedef.send({ content: `**${message.guild.name}** sunucusunda **${sebep}** sebebiyle uyarı aldın. Toplam Uyarın: **${toplamUyari}/10**` });
        } catch (e) {
            // dm kapalıysa hata vermesin
        }
    }
};
