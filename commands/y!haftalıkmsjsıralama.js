const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'haftalıkmsjsıralama',
    description: 'Bu hafta en çok mesaj atan kullanıcıları sıralar.',
    async execute(message, args, client) {
        const mesajDataPath = path.join(process.cwd(), 'mesaj-data.json');

        if (!fs.existsSync(mesajDataPath)) {
            return message.reply('henüz hiç mesaj verisi kaydedilmedi kanka!');
        }

        const mesajData = JSON.parse(fs.readFileSync(mesajDataPath, 'utf8'));
        const guildData = mesajData[message.guild.id] || {};

        // Mevcut haftayı hesapla
        const bugun = new Date();
        const d = new Date(Date.UTC(bugun.getFullYear(), bugun.getMonth(), bugun.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        const haftaKey = `${d.getUTCFullYear()}-${weekNo}`;

        let siralama = [];

        for (const userId in guildData) {
            const userHaftalik = guildData[userId].haftalik || {};
            const msjSayisi = userHaftalik[haftaKey] || 0;
            if (msjSayisi > 0) {
                siralama.push({ userId, msjSayisi });
            }
        }

        if (siralama.length === 0) {
            return message.reply('bu hafta henüz kimse mesaj atmamış kanka!');
        }

        siralama.sort((a, b) => b.msjSayisi - a.msjSayisi);

        const ilk10 = siralama.slice(0, 10);
        let listeMetni = '';
        const madalyalar = ['🥇', '🥈', '🥉'];

        ilk10.forEach((item, index) => {
            const simge = madalyalar[index] || `**#${index + 1}**`;
            listeMetni += `${simge} <@${item.userId}> - **${item.msjSayisi}** mesaj\n`;
        });

        const embed = new EmbedBuilder()
            .setTitle(`🏆 Haftalık Mesaj Sıralaması`)
            .setColor('#f59e0b')
            .setDescription(listeMetni)
            .setFooter({ text: `${message.guild.name} • Bu Haftanın En Aktifleri` })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
};
