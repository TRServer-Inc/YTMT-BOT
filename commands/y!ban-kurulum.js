const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'ban-kurulum',
    description: 'Banlanmış rolünü oluşturur ve tüm kanallarda görünürlüğünü kapatır.',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ bu komutu kullanmak için **yönetici** yetkisine sahip olmalısın!');
        }

        const bilgiMesaji = await message.channel.send('⏳ **ban sistemi kuruluyor...** rol oluşturulup tüm kanallar ayarlanıyor, lütfen bekleyin.');

        try {
            // 1. "Banlanmış" rolünü bul veya oluştur
            let banRolu = message.guild.roles.cache.find(r => r.name === 'Banlanmış');
            if (!banRolu) {
                banRolu = await message.guild.roles.create({
                    name: 'Banlanmış',
                    color: '#34495e',
                    reason: 'Fake Ban sistemi için oluşturuldu.'
                });
            }

            // 2. Tüm kanalları ve kategorileri gez, Banlanmış rolünün görünürlüğünü kapat
            const kanallar = message.guild.channels.cache;

            for (const [id, kanal] of kanallar) {
                await kanal.permissionOverwrites.edit(banRolu, {
                    ViewChannel: false, // Kanalı görme kapatıldı
                    SendMessages: false // Mesaj atma kapatıldı
                }).catch(err => console.error(`[KURULUM HATASI] ${kanal.name} ayarlanamadı:`, err));
            }

            return bilgiMesaji.edit(`✅ **ban sistemi kurulumu tamamlandı!**\n\n• **"${banRolu.name}"** rolü oluşturuldu/güncellendi.\n• sunucudaki tüm kanal ve kategoriler bu rol için gizlendi.\n• **not:** banlanan kişinin görmesini istediğin özel bir kanal varsa (örn: *#ban-affı* veya *#destek*), o kanalın izinlerinden **"Banlanmış"** rolüne **kanalları gör = açık** yetkisi vermen yeterlidir kanka!`);

        } catch (error) {
            console.error('Ban kurulum hatası:', error);
            return bilgiMesaji.edit('❌ kurulum sırasında bir hata oluştu, lütfen yetkilerimi kontrol et!');
        }
    }
};
