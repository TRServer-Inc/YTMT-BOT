const fs = require('fs');
const path = require('path');
const { PermissionFlagsBits } = require('discord.js');

const configPath = path.join(process.cwd(), 'linkengel-config.json');

module.exports = {
    name: 'link-engel',
    description: 'link ve reklam engelleyiciyi açar veya kapatır.',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('Bu komutu kullanmak için `Yönetici` yetkisine sahip olmalısın.');
        }

        const secim = args[0] ? args[0].toLowerCase() : null;

        if (!secim || (secim !== 'aç' && secim !== 'ac' && secim !== 'kapat')) {
            return message.reply('Lütfen geçerli bir seçenek girin! Örnek: `y!link-engel aç` veya `y!link-engel kapat`');
        }

        let config = {};
        if (fs.existsSync(configPath)) {
            try {
                config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            } catch (e) {
                config = {};
            }
        }

        const guildId = message.guild.id;

        if (secim === 'aç' || secim === 'ac') {
            config[guildId] = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            return message.reply('🔗 **Link Engelleme Sistemi Başarıyla AÇILDI!** Artık sunucuda link ve reklam atanların mesajları silinecek.');
        }

        if (secim === 'kapat') {
            config[guildId] = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            return message.reply('🔓 **Link Engelleme Sistemi KAPATILDI.**');
        }
    }
};