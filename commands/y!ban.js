const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'ban',
    description: 'Kullanıcıya Banlanmış rolü verir ve sunucudaki kanallara erişimini keser.',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('❌ bu komutu kullanmak için **üyeleri banla** yetkisine sahip olmalısın!');
        }

        const hedef = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!hedef) {
            return message.reply('kanka kimi banlayacağımı belirtmedin! Örnek: `y!ban @kullanıcı [sebep]`');
        }

        if (hedef.id === message.author.id) {
            return message.reply('kendini banlayamazsın kanka 😅');
        }

        if (hedef.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply('bu kullanıcının rolü senden yüksek veya seninle aynı seviyede, banlayamazsın!');
        }

        const sebep = args.slice(1).join(' ') || 'Sebep belirtilmedi.';
        const banRolu = message.guild.roles.cache.find(r => r.name === 'Banlanmış');

        if (!banRolu) {
            return message.reply('❌ **Banlanmış** rolü bulunamadı! Lütfen önce `y!ban-kurulum` komutunu çalıştırın.');
        }

        try {
            await hedef.roles.add(banRolu);

            const banEmbed = {
                color: 0xe74c3c,
                title: '🚫 Kullanıcı Kısıtlandı (Rol Banı)',
                description: `${hedef} kullanıcısına **Banlanmış** rolü verildi ve kanalları gizlendi!`,
                fields: [
                    { name: '👤 Banlanan:', value: `${hedef.user.tag}`, inline: true },
                    { name: '🛡️ Yetkili:', value: `${message.author.tag}`, inline: true },
                    { name: '📄 Sebep:', value: sebep }
                ],
                timestamp: new Date()
            };

            // Kullanıcıya DM üzerinden bilgi ver
            await hedef.send(`⚠️ **${message.guild.name}** sunucusunda kısıtlandın (Banlandın).\n**Sebep:** ${sebep}`).catch(() => {});

            return message.channel.send({ embeds: [banEmbed] });

        } catch (error) {
            console.error('Ban hatası:', error);
            return message.reply('Kullanıcıya rol verilirken bir hata oluştu! Botun rol sırasını kontrol et kanka.');
        }
    }
};
