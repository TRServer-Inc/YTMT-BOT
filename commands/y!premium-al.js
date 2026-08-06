const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'premium-al',
    description: 'YTMT-BOT Ömür Boyu Premium satın alma bağlantısını gönderir.',
    async execute(message, args, client) {
        const billgangLinki = 'https://ytmtbot.bgng.io/product/ytmt-premium-omur-boyu-'; 

        const embed = new EmbedBuilder()
            .setTitle('💎 YTMT-BOT Ömür Boyu Premium')
            .setColor(0xf1c40f)
            .setThumbnail(client.user.displayAvatarURL())
            .setDescription(
                `🚀 **Sınırsız Ayrıcalıkların Tadını Çıkar!**\n\n` +
                `• **Fiyat:** Sadece **25 TRY** (Ömür Boyu / Kalıcı)\n` +
                `• **Ayrıcalıklar:** İsminin yanında rengarenk **[PRM]** rozeti, gelişmiş AI komutları ve tüm sınırların kalkması!\n\n` +
                `🛒 Satın almak için aşağıdaki **"Premium Satın Al"** butonuna tıkla. Ödeme ekranında Discord ID'ni girmeyi unutma kanka!`
            )
            .setFooter({ text: `${message.author.username} • Güvenli Ödeme`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('💳 Premium Satın Al (25 TRY / Kalıcı)')
                .setStyle(ButtonStyle.Link)
                .setURL(billgangLinki)
        );

        return message.reply({ embeds: [embed], components: [row] });
    }
};
