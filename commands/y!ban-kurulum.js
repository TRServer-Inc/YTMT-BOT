const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'ban-kurulum',
    description: 'Banlanmış rolünü oluşturur, tüm kanalları gizler ve belirtilen kanalı istisna tutar.',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ bu komutu kullanmak için **yönetici** yetkisine sahip olmalısın!');
        }

        const istisnaKanal = message.mentions.channels.first();
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

            // 2. Tüm kanalları ve kategorileri gez
            const kanallar = message.guild.channels.cache;

            for (const [id, kanal] of kanallar) {
                // Eğer etiketlenen istisna kanal buysa görünür yap
                if (istisnaKanal && kanal.id === istisnaKanal.id) {
                    await kanal.permissionOverwrites.edit(banRolu, {
                        ViewChannel: true,
                        SendMessages: true
                    }).catch(err => console.error(`[KURULUM HATASI] ${kanal.name} ayarlanamadı:`, err));
                } else {
                    // Diğer tüm kanallarda görünürlüğü ve mesaj atmayı kapat
                    await kanal.permissionOverwrites.edit(banRolu, {
                        ViewChannel: false,
                        SendMessages: false
                    }).catch(err => console.error(`[KURULUM HATASI] ${kanal.name} ayarlanamadı:`, err));
                }
            }

            let sonucMetni = `✅ **ban sistemi kurulumu tamamlandı!**\n\n• **"${banRolu.name}"** rolü oluşturuldu/güncellendi.\n• sunucudaki tüm kanal ve kategoriler bu rol için gizlendi.`;

            if (istisnaKanal) {
                sonucMetni += `\n• 🔓 **İstisna Kanal:** ${istisnaKanal} kanalı **Banlanmış** rolü için görünür hale getirildi!`;
            } else {
                sonucMetni += `\n• 💡 **İpucu:** Banlanan kişilerin sadece bir kanalı görmesini istersen \`y!ban-kurulum #kanal-adı\` şeklinde tekrar çalıştırabilirsin kanka.`;
            }

            return bilgiMesaji.edit(sonucMetni);

        } catch (error) {
            console.error('Ban kurulum hatası:', error);
            return bilgiMesaji.edit('❌ kurulum sırasında bir hata oluştu, lütfen yetkilerimi kontrol et!');
        }
    }
};
