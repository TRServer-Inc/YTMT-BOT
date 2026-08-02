const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'ban',
    description: 'belirtilen üyeyi sunucudan yasaklar.',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('Bu komutu kullanmak için `Üyeleri Yasakla` yetkisine sahip olmalısın.');
        }

        const kurban = message.mentions.members.first();
        if (!kurban) return message.reply('Lütfen sunucudan yasaklamak istediğin üyeyi etiketle.');

        if (kurban.id === message.guild.ownerId) return message.reply('Sunucu sahibini yasaklayamazsın.');
        if (!kurban.bannable) return message.reply('Bu üyeyi yasaklamaya yetkim yetmiyor.');

        const sebep = args.slice(1).join(' ') || 'Belirtilmedi';

        try {
            await kurban.ban({ reason: sebep });
            return message.reply(`🚫 **${kurban.user.tag}** sunucudan yasaklandı. \n**Sebep:** ${sebep}`);
        } catch (error) {
            console.error(error);
            return message.reply('Üye yasaklanırken bir hata oluştu.');
        }
    }
};