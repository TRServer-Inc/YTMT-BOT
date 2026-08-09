const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'veriler',
    description: 'Canlı sunucudaki veri dosyalarını sadece bot sahibine gönderir.',
    async execute(message, args, client) {
        
        // kendi discord id'ni buraya yaz kanka
        const SAHIP_ID = '1050069485421334549';
        
        if (message.author.id !== SAHIP_ID) {
            return message.reply('bu komutu sadece bot sahibi kullanabilir kanka!');
        }

        const dbPath = path.join(__dirname, '../database.json');
        const dataDir = path.join(__dirname, '../data');

        const gonderilecekDosyalar = [];

        // ana database.json kontrolü
        if (fs.existsSync(dbPath)) {
            gonderilecekDosyalar.push(dbPath);
        }

        // data klasöründeki json dosyalarının kontrolü
        if (fs.existsSync(dataDir)) {
            const files = fs.readdirSync(dataDir);
            files.forEach(file => {
                if (file.endsWith('.json')) {
                    gonderilecekDosyalar.push(path.join(dataDir, file));
                }
            });
        }

        if (gonderilecekDosyalar.length === 0) {
            return message.reply('henüz gönderilecek hiçbir veri dosyası bulunamadı kanka.');
        }

        try {
            await message.reply({
                content: '📁 işte canlı sunucudaki güncel veri dosyaların kanka:',
                files: gonderilecekDosyalar
            });
        } catch (error) {
            console.error('dosya gönderme hatası:', error);
            message.reply('dosyalar gönderilirken bir hata oluştu kanka.');
        }
    }
};
