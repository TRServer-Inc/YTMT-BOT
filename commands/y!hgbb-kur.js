const { PermissionsBitField, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(process.cwd(), 'hgbb-config.json');

module.exports = {
    name: 'hgbb-kur',
    description: 'hoş geldin & bay bay kanalını ayarlar.',
    async execute(message, args, client) {
        // yetki kontrolü (sadece yönetici kullanabilir)
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('kanka bu komutu kullanmak için `yönetici` yetkisine sahip olman lazım!');
        }

        // kanal etiketlendi mi kontrol et
        const kanal = message.mentions.channels.first();
        if (!kanal || kanal.type !== ChannelType.GuildText) {
            return message.reply('lütfen geçerli bir yazı kanalı etiketle! örnek: `y!hgbb-kur #hoşgeldin`');
        }

        // mevcut ayarları oku veya yeni obje oluştur
        let hgbbAyarlari = {};
        if (fs.existsSync(configPath)) {
            try {
                hgbbAyarlari = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            } catch (e) {
                hgbbAyarlari = {};
            }
        }

        // sunucu id'sine göre kanalı kaydet
        hgbbAyarlari[message.guild.id] = kanal.id;

        // json dosyasına yaz
        try {
            fs.writeFileSync(configPath, JSON.stringify(hgbbAyarlari, null, 4));
            return message.reply(`harika! hg-bb bildirim kanalı başarıyla ${kanal} olarak ayarlandı. 🎉`);
        } catch (error) {
            console.error('hgbb kaydetme hatası:', error);
            return message.reply('ayarlar kaydedilirken bir hata oluştu kanka!');
        }
    }
};
