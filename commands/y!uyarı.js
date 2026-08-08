const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'uyarı',
    description: 'Belirtilen kullanıcıya uyarı verir.',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply('bu komutu kullanmak için `Mesajları Yönet` yetkisine sahip olmalısın kanka!');
        }

        const hedef = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!hedef) {
            return message.reply('lütfen uyarılacak kullanıcıyı etiketle veya ID\'sini yaz kanka!');
        }

        if (hedef.user.bot) {
            return message.reply('botlara uyarı veremezsin kanka!');
        }

        const sebep = args.slice(1).join(' ') || 'Sebep belirtilmedi.';
        const dataPath = path.join(__dirname, '../data/uyarilar.json');

        // klasör ve dosya kontrolü
        if (!fs.existsSync(path.dirname(dataPath))) {
            fs.mkdirSync(path.dirname(dataPath), { recursive: true });
        }

        let uyarilarData = {};
        if (fs.existsSync(dataPath)) {
            try {
                uyarilarData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            } catch (err) {
                uyarilarData = {};
            }
        }

        const guildID = message.guild.id;
        const userID = hedef.id;

        if (!uyarilarData[guildID]) uyarilarData[guildID] = {};
        if (!uyarilarData[guildID][userID]) uyarilarData[guildID][userID] = [];

        uyarilarData[guildID][userID].push({
            sebep: sebep,
            yetkili: message.author.id,
            tarih: new Date().toISOString()
        });

        fs.writeFileSync(dataPath, JSON.stringify(uyarilarData, null, 4));

        const toplamUyari = uyarilarData[guildID][userID].length;
        const kalanHak = 10 - toplamUyari;

        const embed = new EmbedBuilder()
            .setTitle('⚠️ Kullanıcı Uyarıldı')
            .setColor('#f59e0b')
            .addFields(
                { name: 'Uyarılan Kullanıcı', value: `${hedef.user.tag} (\`${hedef.id}\`)`, inline: true },
                { name: 'Yetkili', value: `${message.author.tag}`, inline: true },
                { name: 'Sebep', value: sebep, inline: false },
                { name: 'Toplam Uyarı', value: `\`${toplamUyari} / 10\``, inline: true },
                { name: 'Kalan Hak', value: `\`${kalanHak}\``, inline: true }
            )
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });

        if (toplamUyari >= 10) {
            if (hedef.bannable) {
                await hedef.ban({ reason: '10 uyarı sınırına ulaşıldı.' });
                message.channel.send(`🚨 **${hedef.user.tag}** kullanıcısı 10 uyarı sınırına ulaştığı için otomatik olarak sunucudan banlandı!`);
            }
        }
    }
};
