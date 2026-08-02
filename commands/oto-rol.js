const fs = require('fs');
const path = require('path');

const premiumPath = path.join(process.cwd(), 'premium.json');

module.exports = {
    name: 'oto-rol',
    description: 'Sunucuya yeni katılanlara otomatik rol verir (Premium Özel).',
    async execute(message, args, client) {
        // --- PREMİUM KONTROLÜ (execute içinde olmalı) ---
        let premiumMu = false;

        if (fs.existsSync(premiumPath)) {
            try {
                const premiumData = JSON.parse(fs.readFileSync(premiumPath, 'utf8'));
                if (premiumData.guilds && premiumData.guilds.includes(message.guild.id)) {
                    premiumMu = true;
                }
            } catch (e) {
                console.error('Premium kontrol hatası:', e);
            }
        }

        if (!premiumMu) {
            return message.reply('⭐ Bu komutu kullanabilmek için sunucunuzun **Premium** olması gerekmektedir! Bilgi için: `y!premium`');
        }

        // --- KOMUTUN NORMAL İŞLEYİŞİ ---
        const rol = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);

        if (!args[0]) {
            return message.reply('kanka otomatik verilecek rolü etiketlemelisin veya ID yazmalısın! Örnek: `y!oto-rol @Üye`');
        }

        if (!rol) {
            return message.reply('belirttiğin rol sunucuda bulunamadı kanka!');
        }

        const configPath = path.join(process.cwd(), 'otorol-config.json');
        let config = {};

        if (fs.existsSync(configPath)) {
            try {
                config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            } catch (e) {}
        }

        config[message.guild.id] = rol.id;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        return message.reply(`✅ Sunucuya yeni katılanlara artık otomatik olarak **${rol.name}** rolü verilecek!`);
    }
};