const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'kayıt-kurulum',
    description: 'Kayıtsız ve Kayıtlı rollerini oluşturur, kanalları kısıtlar.',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ bu komutu kullanmak için **yönetici** yetkisine sahip olmalısın!');
        }

        const kayitKanali = message.mentions.channels.first();
        if (!kayitKanali) {
            return message.reply('kanka kayıt kanalını etiketlemeyi unuttun! Örnek: `y!kayıt-kurulum #kayıt-kanalı`');
        }

        const bilgiMesaji = await message.channel.send('⏳ **kayıt sistemi kuruluyor...** roller ve kanal izinleri ayarlanıyor, lütfen bekleyin.');

        try {
            // 1. Kayıtsız Rolü
            let kayitsizRolu = message.guild.roles.cache.find(r => r.name === 'Kayıtsız');
            if (!kayitsizRolu) {
                kayitsizRolu = await message.guild.roles.create({
                    name: 'Kayıtsız',
                    color: '#7f8c8d',
                    reason: 'Kayıt sistemi için oluşturuldu.'
                });
            }

            // 2. Kayıtlı Rolü
            let kayitliRolu = message.guild.roles.cache.find(r => r.name === 'Kayıtlı');
            if (!kayitliRolu) {
                kayitliRolu = await message.guild.roles.create({
                    name: 'Kayıtlı',
                    color: '#2ecc71',
                    reason: 'Kayıt sistemi için oluşturuldu.'
                });
            }

            // 3. Kanalları Kayıtsız rolüne kapat, sadece etiketlenen kayıt kanalını aç
            const kanallar = message.guild.channels.cache;

            for (const [id, kanal] of kanallar) {
                if (kanal.id === kayitKanali.id) {
                    await kanal.permissionOverwrites.edit(kayitsizRolu, {
                        ViewChannel: true,
                        SendMessages: true
                    }).catch(err => console.error(`[KURULUM HATASI] ${kanal.name} ayarlanamadı:`, err));

                    // Kayıtlı olanlar kayıt kanalını görmesin
                    await kanal.permissionOverwrites.edit(kayitliRolu, {
                        ViewChannel: false
                    }).catch(err => console.error(`[KURULUM HATASI] ${kanal.name} ayarlanamadı:`, err));

                } else {
                    await kanal.permissionOverwrites.edit(kayitsizRolu, {
                        ViewChannel: false,
                        SendMessages: false
                    }).catch(err => console.error(`[KURULUM HATASI] ${kanal.name} ayarlanamadı:`, err));
                }
            }

            return bilgiMesaji.edit(`✅ **kayıt sistemi kurulumu tamamlandı!**\n\n• **"Kayıtsız"** ve **"Kayıtlı"** roller hazırlandı.\n• ${kayitKanali} dışındaki tüm kanallar kayıtsızlara gizlendi.\n• kayıt olan kişilerden kayıt kanalı otomatik gizlenecek kanka!`);

        } catch (error) {
            console.error('Kayıt kurulum hatası:', error);
            return bilgiMesaji.edit('❌ kurulum sırasında bir hata oluştu, bot yetkilerini kontrol et!');
        }
    }
};
