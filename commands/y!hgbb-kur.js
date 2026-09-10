const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Hgbb } = require('../data/db.js');

module.exports = {
    name: 'hgbb-kur',
    description: 'giriş çıkış kanalını ayarlar.',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('bu komutu kullanmak için yönetici yetkisine sahip olmalısın kanka!');
        }

        const kanal = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
        if (!kanal) {
            return message.reply('lütfen geçerli bir kanal etiketle kanka! Örn: `y!hgbb-kur #kanal`');
        }

        try {
            await Hgbb.findOneAndUpdate(
                { guildId: message.guild.id },
                { channelId: kanal.id },
                { upsert: true, new: true }
            );

            const embed = new EmbedBuilder()
                .setColor('#22c55e')
                .setTitle('✅ hg-bb kanalı ayarlandı')
                .setDescription(`giriş-çıkış mesajları artık ${kanal} kanalına gönderilecek!`)
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } catch (err) {
            console.error('[HGBB-KUR HATA]', err);
            await message.reply('veritabanına kaydedilirken bir sorun oluştu kanka!');
        }
    }
};
