const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { Hgbb } = require('../data/db.js');

module.exports = {
    name: 'y!hgbb-kur',
    description: 'Hoş geldin - Bay bay kanalını ayarlar.',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ Bu komutu kullanmak için **Yönetici** yetkisine sahip olmalısın!');
        }

        const targetChannel = message.mentions.channels.first() || message.channel;

        try {
            await Hgbb.findOneAndUpdate(
                { guildId: message.guild.id },
                { channelId: targetChannel.id },
                { upsert: true, new: true }
            );

            const embed = new EmbedBuilder()
                .setTitle('✅ HGBB Kanalı Ayarlandı')
                .setColor('#22c55e')
                .setDescription(`Hoş geldin ve bay bay mesajları artık ${targetChannel} kanalına gönderilecek.\n*(Veri bulut veritabanına kaydedildi)*`)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('[HGBB-KUR HATASI]', error);
            return message.reply('❌ Ayar kaydedilirken bir veritabanı hatası oluştu!');
        }
    }
};
