module.exports = {
    name: 'rolleri-sil',
    async execute(message, args, client) {
        if (message.author.id !== message.guild.ownerId) return message.reply('Üzgünüm. Sunucu Sahibi değilsin.');

        try {
            const bilgiMesajı = await message.reply('Silinebilecek tüm roller temizleniyor... 🧹');
            let silinenRolSayisi = 0;
            const roller = message.guild.roles.cache;

            for (const [id, role] of roller) {
                if (role.name !== '@everyone' && role.editable && !role.managed) {
                    await role.delete();
                    silinenRolSayisi++;
                }
            }
            await bilgiMesajı.edit({ content: 'Yaptım💥', embeds: [{ color: 0xFFFFFF, description: `**Başarıyla sunucudaki ${silinenRolSayisi} adet özel rol silindi!** 🧹` }] });
        } catch (error) {
            console.error(error);
            message.reply('Roller silinirken bir hata oluştu.');
        }
    }
};
