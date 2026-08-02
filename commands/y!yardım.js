module.exports = {
    name: 'yardım',
    aliases: ['help'],
    async execute(message, args, client) {
        const rastgeleRenk = Math.floor(Math.random() * 16777215).toString(16);
        const avatarURL = message.author.displayAvatarURL({ dynamic: true });

        const yardimEmbed = {
            color: parseInt(rastgeleRenk, 16),
            title: '🤖 Bot Yardım Menüsü',
            description: `Merhaba ${message.author}! Aşağıda sunucuda kullanabileceğin bütün komutlar listelenmiştir.`,
            thumbnail: { url: 'https://cdn.discordapp.com/emojis/776713577452273706.png?v=1' },
            fields: [
                { name: '🛡️ Moderasyon Komutları', value: '`y!kick <@üye> [sebep]` - Üyeyi atar.\n`y!ban <@üye> [sebep]` - Üyeyi yasaklar.' },
                { name: '🛠️ Sunucu Yönetim Komutları', value: '`y!sunucukur` - Kanalları kurar.\n`y!rolekle` - Rolleri kurar.\n`y!rolleri-sil` - Rolleri temizler.\n`y!hgbb-kur <#kanal>` - Hoş geldin & bay bay kanalını ayarlar.' },
                { name: '🎲 Eğlence & Genel Komutlar', value: '`y!zarat` - Rastgele zar atar.\n`y!ping` - Gecikmeyi gösterir.\n`y!sa` - Selam verir.' },
                { name: '🚫 Aktif Koruma Sistemleri', value: '**Gelişmiş Oto Küfür Engel:** Küfürlü mesajları anında siler.' }
            ],
            footer: { text: `${message.author.username} tarafından istendi.`, icon_url: avatarURL },
            timestamp: new Date()
        };
        return message.reply({ embeds: [yardimEmbed], allowedMentions: { repliedUser: false } });
    }
};