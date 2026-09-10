const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { LinkEngel } = require('../data/db.js');

module.exports = {
    name: 'link-engel',
    description: 'link engelleme sistemini açar veya kapatır.',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('bu komutu kullanmak için yönetici olmalısın kanka!');
        }

        const secim = args[0]?.toLowerCase();
        if (!secim || (secim !== 'aç' && secim !== 'kapat' && secim !== 'ac')) {
            return message.reply('lütfen geçerli bir durum belirt kanka! Örn: `y!link-engel aç` veya `y!link-engel kapat`');
        }

        const yeniDurum = (secim === 'aç' || secim === 'ac');

        try {
            await LinkEngel.findOneAndUpdate(
                { guildId: message.guild.id },
                { durum: yeniDurum },
                { upsert: true, new: true }
            );

            const embed = new EmbedBuilder()
                .setColor(yeniDurum ? '#22c55e' : '#ef4444')
                .setTitle('🔗 link engel sistemi')
                .setDescription(`link engelleme sistemi **${yeniDurum ? 'AÇILDI 🟢' : 'KAPATILDI 🔴'}**.`);

            await message.reply({ embeds: [embed] });
        } catch (err) {
            console.error('[LİNK ENGEL HATA]', err);
            await message.reply('veri tabanına işlenirken bir sorun oluştu kanka!');
        }
    }
};
