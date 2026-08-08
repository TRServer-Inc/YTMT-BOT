const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'veriler',
    description: 'Canlı sunucudaki database.json dosyasını sadece bot sahibine gönderir.',
    async execute(message, args, client) {
        
        // kendi discord id'ni buraya yaz kanka
        const SAHIP_ID = '1050069485421334549';
        
        if (message.author.id !== SAHIP_ID) {
            return message.reply('bu komutu sadece bot sahibi kullanabilir kanka!');
        }

        const dbPath = path.join(__dirname, '../database.json');

        if (!fs.existsSync(dbPath)) {
            return message.reply('henüz `database.json` dosyası oluşturulmamış veya bulunamıyor kanka.');
        }

        try {
            await message.reply({
                content: '📁 işte canlı sunucudaki güncel `database.json` dosyan kanka:',
                files: [dbPath]
            });
        } catch (error) {
            console.error('dosya gönderme hatası:', error);
            message.reply('dosya gönderilirken bir hata oluştu kanka.');
        }
    }
};
