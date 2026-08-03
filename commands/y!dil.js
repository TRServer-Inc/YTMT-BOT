const { setUserLanguage, getText } = require('../helpers/language');

module.exports = {
    name: 'dil',
    description: 'Kendi kişisel dilini değiştirir (tr / en).',
    async execute(message, args, client) {
        const userId = message.author.id;
        const secilenDil = args[0]?.toLowerCase();

        if (!secilenDil || (secilenDil !== 'tr' && secilenDil !== 'en')) {
            return message.reply(getText(userId, 'lang_usage'));
        }

        setUserLanguage(userId, secilenDil);

        return message.reply(getText(userId, 'lang_changed'));
    }
};
