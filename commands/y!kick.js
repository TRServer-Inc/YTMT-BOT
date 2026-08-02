const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'kick',
    description: 'belirtilen üyeyi sunucudan atar.',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return message.reply('Bu komutu kullanmak için `Üyeleri At` yetkisine sahip olmalısın.');
        }

        const kurban = message.mentions.members.first();
        if (!kurban) return message.reply('Lütfen sunucudan atmak istediğin üyeyi etiketle. Örnek: `y!kick @kullanici [sebep]`');

        if (kurban.id === message.guild.ownerId) return message.reply('Sunucu sahibini sunucudan atamazsın.');
        if (!kurban.kickable) return message.reply('Bu üyeyi atmaya yetkim yetmiyor. Rolüm onun rolünden daha üstte olmalı.');

        const sebep = args.slice(1).join(' ') || 'Belirtilmedi';

        try {
            await kurban.kick(sebep);
            return message.reply(`🔨 **${kurban.user.tag}** isimli üye başarıyla sunucudan atıldı. \n**Sebep:** ${sebep}`);
        } catch (error) {
            console.error(error);
            return message.reply('Üye atılırken bir hata oluştu.');
        }
    }
};