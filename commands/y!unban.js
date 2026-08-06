const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'unban',
    description: 'belirtilen kullanıcının sunucudaki yasağını kaldırır.',
    async execute(message, args, client) {
        // yetki kontrolü
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('Bu komutu kullanmak için `Üyeleri Yasakla` yetkisine sahip olmalısın.');
        }

        const hedef = args[0];
        if (!hedef) {
            return message.reply('Lütfen yasağını kaldırmak istediğin kullanıcının ID\'sini veya Ad#Etiket formatını gir. Örnek: `y!unban 123456789012345678`');
        }

        try {
            // sunucudaki banlı listesini çekiyoruz
            const banlar = await message.guild.bans.fetch();
            
            // girilen argümana göre kullanıcıyı buluyoruz (ID veya kullanıcı adı/tag eşleşmesi)
            const banliUye = banlar.find(b => b.user.id === hedef || b.user.tag === hedef || b.user.username === hedef);

            if (!banliUye) {
                return message.reply('Bu kullanıcı sunucunun ban listesinde bulunamadı!');
            }

            // banı kaldırıyoruz
            await message.guild.members.unban(banliUye.user.id);
            return message.reply(`🔓 **${banliUye.user.tag}** isimli kullanıcının sunucudaki yasağı başarıyla kaldırıldı!`);

        } catch (error) {
            console.error('Unban hatası:', error);
            return message.reply('Kullanıcının yasağı kaldırılırken bir hata oluştu.');
        }
    }
};
