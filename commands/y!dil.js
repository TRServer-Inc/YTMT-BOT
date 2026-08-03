const fs = require('fs');
const path = require('path');
const { PermissionFlagsBits } = require('discord.js');

const langConfigPath = path.join(process.cwd(), 'language-config.json');

module.exports = {
    name: 'dil',
    description: 'Botun sunucu dilini değiştirir (tr/en).',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply(client.t('yetki_yok_admin', message.guild.id));
        }

        const secilenDil = args[0] ? args[0].toLowerCase() : null;

        if (!secilenDil || (secilenDil !== 'tr' && secilenDil !== 'en')) {
            return message.reply(client.t('dil_gecersiz', message.guild.id));
        }

        let config = {};
        if (fs.existsSync(langConfigPath)) {
            try { 
                config = JSON.parse(fs.readFileSync(langConfigPath, 'utf8')); 
            } catch (e) {}
        }

        config[message.guild.id] = secilenDil;
        fs.writeFileSync(langConfigPath, JSON.stringify(config, null, 2));

        return message.reply(client.t('dil_degisti', message.guild.id));
    }
};
