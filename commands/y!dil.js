const { PermissionFlagsBits } = require('discord.js');
const { setLanguage, getText } = require('../helpers/language');

module.exports = {
    name: 'dil',
    description: 'Botun sunucudaki dilini değiştirir (tr / en).',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply(getText(message.guild.id, 'no_perm'));
        }

        const secilenDil = args[0]?.toLowerCase();

        if (!secilenDil || (secilenDil !== 'tr' && secilenDil !== 'en')) {
            return message.reply('kanka geçerli bir dil belirtmelisin! Örnek: `y!dil tr` veya `y!dil en`');
        }

        setLanguage(message.guild.id, secilenDil);

        return message.reply(getText(message.guild.id, 'lang_changed'));
    }
};
