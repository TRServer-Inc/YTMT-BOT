const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const premiumPath = path.join(process.cwd(), 'premium.json');

module.exports = {
    name: 'premium',
    description: 'Sunucunun premium durumunu gösterir.',
    async execute(message, args, client) {
        let premiumMu = false;

        if (fs.existsSync(premiumPath)) {
            try {
                const premiumData = JSON.parse(fs.readFileSync(premiumPath, 'utf8'));
                if (premiumData.guilds.includes(message.guild.id) || premiumData.users.includes(message.author.id)) {
                    premiumMu = true;
                }
            } catch (e) {}
        }

        const embed = new EmbedBuilder()
            .setTitle('💎 Premium Durumu')
            .setColor(premiumMu ? 0xf1c40f : 0x95a5a6)
            .setDescription(
                premiumMu 
                    ? '🎉 **Bu sunucu Premium üyesidir!** Tüm ayrıcalıklı komutları ve limitsiz özellikleri kullanabilirsiniz.' 
                    : '❌ **Bu sunucuda Premium aktif değil.** Premium ayrıcalıklarından yararlanmak için bot sahibiyle iletişime geçin!'
            )
            .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
};