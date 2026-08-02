const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'fullban',
    description: 'Kullanıcıyı sunucudan tamamen banlar.',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('❌ bu komutu kullanmak için **üyeleri banla** yetkisine sahip olmalısın!');
        }

        const hedef = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!hedef) {
            return message.reply('kanka kimi tamamen banlayacağımı yazmadın! Örnek: `y!fullban @kullanıcı [sebep]`');
        }

        if (hedef.id === message.author.id) {
            return message.reply('kendini banlayamazsın kanka!');
        }

        if (!hedef.bannable) {
            return message.reply('bu kullanıcıyı banlamaya yetkim yetmiyor kanka (rolü benden yüksek olabilir)!');
        }

        const sebep = args.slice(1).join(' ') || 'Sebep belirtilmedi.';

        try {
            // DM'den bilgilendir
            await hedef.send(`🚨 **${message.guild.name}** sunucusundan **tamamen banlandın!**\n**Sebep:** ${sebep}`).catch(() => {});

            // Sunucudan banla
            await hedef.ban({ reason: sebep });

            const fullBanEmbed = {
                color: 0x990000,
                title: '⚡ Kullanıcı Sunucudan Banlandı',
                description: `${hedef.user.tag} sunucudan **tamamen** uçuruldu!`,
                fields: [
                    { name: '👤 Banlanan:', value: `${hedef.user.tag} (${hedef.id})`, inline: true },
                    { name: '🛡️ Yetkili:', value: `${message.author.tag}`, inline: true },
                    { name: '📄 Sebep:', value: sebep }
                ],
                timestamp: new Date()
            };

            return message.channel.send({ embeds: [banEmbed] });

        } catch (error) {
            console.error('Fullban hatası:', error);
            return message.reply('Kullanıcı banlanırken bir hata oluştu!');
        }
    }
};
