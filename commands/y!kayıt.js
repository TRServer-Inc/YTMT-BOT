const { PermissionFlagsBits } = require('discord.js');
const { getText } = require('../helpers/language');

module.exports = {
    name: 'kayıt',
    description: 'Kullanıcıyı kayıt eder.',
    async execute(message, args, client) {
        const userId = message.author.id; // Mesajı atan kişinin ID'si

        if (!message.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
            return message.reply(getText(userId, 'no_perm'));
        }

        const hedef = message.mentions.members.first();
        if (!hedef) {
            return message.reply(getText(userId, 'no_target'));
        }

        const ad = args[1];
        const yas = args[2];
        const yeniIsim = yas ? `${ad} | ${yas}` : `${ad}`;

        await hedef.setNickname(yeniIsim).catch(() => {});

        // Herkes kendi dilinde yanıt alır!
        return message.reply(getText(userId, 'reg_success', { user: hedef, name: yeniIsim }));
    }
};
