const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'rolver',
    description: 'belirtilen üyeye belirtilen rolü verir.',
    async execute(message, args, client) {
        // yetki kontrolü (rolleri yönet yetkisi lazım)
        if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return message.reply('Bu komutu kullanmak için `Rolleri Yönet` yetkisine sahip olmalısın.');
        }

        const kurban = message.mentions.members.first();
        if (!kurban) {
            return message.reply('Lütfen rol vermek istediğin üyeyi etiketle. Örnek: `y!rolver @kullanici @rol`');
        }

        // etiketlenen rolü veya ID ile yazılan rolü bulur
        const rol = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
        if (!rol) {
            return message.reply('Lütfen verilecek rolü etiketle veya ID\'sini gir. Örnek: `y!rolver @kullanici @rol`');
        }

        // botun rol hiyerarşisi kontrolü
        const botMember = message.guild.members.me;
        if (rol.position >= botMember.roles.highest.position) {
            return message.reply('Bu rol benim rolümden daha üstte veya eşit seviyede olduğu için bu rolü kimseye veremem!');
        }

        // komutu yazan kişinin rol hiyerarşisi kontrolü (sunucu sahibi hariç)
        if (message.author.id !== message.guild.ownerId && rol.position >= message.member.roles.highest.position) {
            return message.reply('Kendi en yüksek rolünden daha üstte veya eşit bir rolü kimseye veremezsin!');
        }

        // kullanıcının o role zaten sahip olup olmadığını kontrol etme
        if (kurban.roles.cache.has(rol.id)) {
            return message.reply(`**${kurban.user.tag}** isimli kullanıcı zaten **${rol.name}** rolüne sahip!`);
        }

        try {
            await kurban.roles.add(rol);
            return message.reply(`✅ **${kurban.user.tag}** isimli kullanıcıya **${rol.name}** rolü başarıyla verildi!`);
        } catch (error) {
            console.error('Rol verme hatası:', error);
            return message.reply('Rol verilirken bir hata oluştu. Botun yetkilerini ve rol sıralamasını kontrol et kanka!');
        }
    }
};