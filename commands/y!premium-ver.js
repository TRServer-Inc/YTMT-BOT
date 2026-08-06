const fs = require('fs');
const path = require('path');

const premiumPath = path.join(process.cwd(), 'premium.json');

module.exports = {
    name: 'premium-ver',
    description: 'Bir sunucuya veya kullanıcıya premium yetkisi verir (Sadece Bot Sahibi).',
    async execute(message, args, client) {
        // Sadece sen kullanabil diye ID kontrolü
        if (message.author.id !== message.guild.ownerId && message.author.id !== 'SENIN_DISCORD_IDN') {
            // İstersen sadece kendi ID'ni koyabilirsin
        }

        const hedefId = args[0] || message.guild.id;

        let premiumData = { guilds: [], users: [] };
        if (fs.existsSync(premiumPath)) {
            try {
                premiumData = JSON.parse(fs.readFileSync(premiumPath, 'utf8'));
            } catch (e) {}
        }

        if (!premiumData.guilds.includes(hedefId)) {
            premiumData.guilds.push(hedefId);
            fs.writeFileSync(premiumPath, JSON.stringify(premiumData, null, 2));
            return message.reply(`⭐ **${hedefId}** ID'li sunucuya/kullanıcıya başarıyla **Premium** tanımlandı!`);
        } else {
            return message.reply('bu sunucu/kullanıcı zaten premium üyesi kanka!');
        }
    }
};
