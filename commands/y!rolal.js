const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'rolal',
    description: 'belirtilen üyeden belirtilen rolü alır.',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return message.reply('Bu komutu kullanmak için `Rolleri Yönet` yetkisine sahip olmalısın.');
        }

        const kurban = message.mentions.members.first();
        if (!kurban) {
            return message.reply('Lütfen rolünü almak istediğin üyeyi etiketle. Örnek: `y!rolal @kullanici @rol`');
        }

        // etiketlenen rol yoksa, yazılan metinden rol adını veya ID'sini arar
        const rolAramasi = args.slice(1).join(' ').trim();
        const rol = message.mentions.roles.first() 
            || message.guild.roles.cache.get(args[1]) 
            || message.guild.roles.cache.find(r => r.name.toLowerCase() === rolAramasi.toLowerCase());

        if (!rol) {
            return message.reply('Lütfen geçerli bir rol etiketle veya rol adı gir. Örnek: `y!rolal @kullanici @rol`');
        }

        const botMember = message.guild.members.me;
        if (rol.position >= botMember.roles.highest.position) {
            return message.reply('Bu rol benim rolümden daha üstte veya eşit seviyede olduğu için bu rolü kimseden alamam!');
        }

        if (message.author.id !== message.guild.ownerId && rol.position >= message.member.roles.highest.position) {
            return message.reply('Kendi en yüksek rolünden daha üstte veya eşit bir rolü kimseden alamazsın!');
        }

        if (!kurban.roles.cache.has(rol.id)) {
            return message.reply(`**${kurban.user.tag}** isimli kullanıcıda zaten **${rol.name}** rolü yok!`);
        }

        try {
            await kurban.roles.remove(rol);
            return message.reply(`✅ **${kurban.user.tag}** isimli kullanıcıdan **${rol.name}** rolü başarıyla alındı!`);
        } catch (error) {
            console.error('Rol alma hatası:', error);
            return message.reply('Rol alınırken bir hata oluştu. Botun yetkilerini ve rol sıralamasını kontrol et!');
        }
    }
};
