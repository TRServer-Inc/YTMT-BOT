const { EmbedBuilder } = require('discord.js');
const { Uyari } = require('../data/db.js');

module.exports = {
    name: 'y!uyarılar',
    description: 'bir kullanıcının uyarı geçmişini listeler.',
    async execute(message, args, client) {
        const hedef = message.mentions.users.first() || message.author;

        try {
            const kayit = await Uyari.findOne({ guildId: message.guild.id, userId: hedef.id });

            if (!kayit || kayit.uyarilar.length === 0) {
                return message.reply(`**${hedef.username}** kullanıcısının hiç uyarısı yok, tertemiz! ✨`);
            }

            const liste = kayit.uyarilar.map((u, i) => `**${i + 1}.** ${u.sebep} — *(uyaran: <@${u.uyaran}>)*`).join('\n');

            const embed = new EmbedBuilder()
                .setColor('#ef4444')
                .setTitle(`📜 ${hedef.username} uyarı geçmişi`)
                .setDescription(liste)
                .setFooter({ text: `toplam uyarı sayısı: ${kayit.uyarilar.length}` });

            await message.reply({ embeds: [embed] });
        } catch (err) {
            console.error('[UYARILAR LISTE HATA]', err);
            await message.reply('uyarılar veritabanından çekilirken bir hata oluştu kanka!');
        }
    }
};
