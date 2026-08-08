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
        const dbPath = path.join(__dirname, '../database.json');

        let dbData = {};
        if (fs.existsSync(dbPath)) {
            try {
                dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            } catch (err) {
                dbData = {};
            }
        }

        const guildID = message.guild.id;
        const userID = hedef.id;

        if (!dbData.uyarilar) dbData.uyarilar = {};
        if (!dbData.uyarilar[guildID]) dbData.uyarilar[guildID] = {};
        if (!dbData.uyarilar[guildID][userID]) dbData.uyarilar[guildID][userID] = [];

        dbData.uyarilar[guildID][userID].push({
            sebep: sebep,
            yetkili: message.author.id,
            tarih: new Date().toISOString()
        });

        fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 4));

        const toplamUyari = dbData.uyarilar[guildID][userID].length;
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
