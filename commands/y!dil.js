const { setUserLanguage, getText } = require('../helpers/language');

module.exports = {
    name: 'dil',
    description: 'Kendi kişisel dilini ayarlar (tr / en).',
    async execute(message, args, client) {
        const secilenDil = args[0]?.toLowerCase();

        if (!secilenDil || (secilenDil !== 'tr' && secilenDil !== 'en')) {
            return message.reply(getText(message.author.id, 'lang_usage'));
        }

        setUserLanguage(message.author.id, secilenDil);

        return message.reply(getText(message.author.id, 'lang_changed'));
    }
};
