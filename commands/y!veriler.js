const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'veriler',
    description: 'Uyarı verilerinin bulunduğu json dosyasını gönderir.',
    async execute(message, args, client) {
        
        // sadece bot sahibinin kullanması için id kontrolü (kendi discord id'ni yaz kanka)
        const SAHIP_ID = '1050069485421334549';
        
        if (message.author.id !== SAHIP_ID) {
            return message.reply('bu komutu sadece bot sahibi kullanabilir kanka!');
        }

        const dataPath = path.join(__dirname, '../data/uyarilar.json');

        if (!fs.existsSync(dataPath)) {
            return message.reply('henüz hiç kayıtlı uyarı verisi yok veya dosya oluşturulmamış kanka.');
        }

        try {
            await message.reply({
                content: '📁 işte canlı sunucudaki güncel `uyarilar.json` dosyan kanka:',
                files: [dataPath]
            });
        } catch (error) {
            console.error('dosya gönderme hatası:', error);
            message.reply('dosya gönderilirken bir hata oluştu kanka.');
        }
    }
};
