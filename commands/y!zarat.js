module.exports = {
    name: 'zarat',
    aliases: ['zar-at'],
    async execute(message, args, client) {
        const rastgeleRenk = Math.floor(Math.random() * 16777215).toString(16);
        const zarlar = ['1', '2', '3', '4', '5', '6'];
        const rastgeleZar = zarlar[Math.floor(Math.random() * zarlar.length)];
        const avatarURL = message.author.displayAvatarURL({ dynamic: true });

        const zarEmbed = {
            color: parseInt(rastgeleRenk, 16),
            title: 'Oyun Zamanı!',
            description: `Zar Attın Ve\n**${rastgeleZar}** Çıktı!`,
            thumbnail: { url: 'https://cdn.discordapp.com/emojis/776713577452273706.png?v=1' },
            footer: { text: `${message.author.username} Zar Attı!`, icon_url: avatarURL },
            timestamp: new Date()
        };
        return message.reply({ embeds: [zarEmbed], allowedMentions: { repliedUser: false } });
    }
};
