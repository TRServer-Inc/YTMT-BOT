const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Uyari } = require('../data/db.js');

module.exports = {
    name: 'uyarı',
    description: 'bir kullanıcıya uyarı ekler.',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply('bu komut için mesajları yönet yetkin olmalı kanka!');
        }

        const hedef = message.mentions.members.first();
        if (!hedef) {
            return message.reply('lütfen uyarılacak kişiyi etiketle kanka! Örn: `y!uyarı @kullanici sebep`');
        }

        const sebep = args.slice(1).join(' ') || 'sebep belirtilmedi';

        try {
            const kayit = await Uyari.findOneAndUpdate(
                { guildId: message.guild.id, userId: hedef.id },
                {
                    $push: {
                        uyarilar: {
                            sebep: sebep,
                            uyaran: message.author.id,
                            tarih: new Date()
                        }
                    }
                },
                { upsert: true, new: true }
            );

            const embed = new EmbedBuilder()
                .setColor('#f59e0b')
                .setTitle('⚠️ uyarı eklendi')
                .setDescription(`**${hedef.user.username}** kullanıcısı uyarıldı!\n\n**sebep:** ${sebep}\n**toplam uyarı:** ${kayit.uyarilar.length}`);

            await message.reply({ embeds: [embed] });
        } catch (err) {
            console.error('[UYARI HATA]', err);
            await message.reply('uyarı kaydedilirken bir hata oluştu kanka!');
        }
    }
};
