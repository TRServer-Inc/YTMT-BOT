const { EmbedBuilder } = require('discord.js');
const { getText } = require('../helpers/language');

module.exports = {
    name: 'yardım',
    description: 'Botun komut listesini tamamen sana özel dilde gösterir.',
    async execute(message, args, client) {
        const userId = message.author.id;

        const helpEmbed = new EmbedBuilder()
            .setColor('#ff1e27')
            .setTitle(getText(userId, 'help_title'))
            .setDescription(getText(userId, 'help_desc'))
            .addFields(
                { name: '🌐 Language / Dil', value: getText(userId, 'help_cmd_lang') },
                { name: '📝 Registration / Kayıt', value: `${getText(userId, 'help_cmd_reg_setup')}\n${getText(userId, 'help_cmd_reg')}` },
                { name: '🛡️ Moderation / Moderasyon', value: getText(userId, 'help_cmd_ban_setup') }
            )
            .setFooter({ text: getText(userId, 'help_footer') })
            .setTimestamp();

        return message.reply({ embeds: [helpEmbed] });
    }
};
