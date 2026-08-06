const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'profil',
    description: 'Kullanıcının profil bilgilerini gösterir.',
    async execute(message, args, client) {
        // Etiketlenen kullanıcı varsa onu al, yoksa komutu yazanın profilini göster
        const hedef = message.mentions.users.first() || message.author;
        const uye = message.guild ? message.guild.members.cache.get(hedef.id) : null;

        // Tarih biçimlendirme (Gün/Ay/Yıl)
        const kurulusTarihi = `<t:${Math.floor(hedef.createdTimestamp / 1000)}:F> (<t:${Math.floor(hedef.createdTimestamp / 1000)}:R>)`;
        const katilmaTarihi = uye ? `<t:${Math.floor(uye.joinedTimestamp / 1000)}:F> (<t:${Math.floor(uye.joinedTimestamp / 1000)}:R>)` : 'Sunucu bilgisi yok';

        const embed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle(`👤 ${hedef.username} Profil Bilgileri`)
            .setThumbnail(hedef.displayAvatarURL({ dynamic: true, size: 512 }))
            .addFields(
                { name: '🆔 Kullanıcı ID', value: `\`${hedef.id}\``, inline: true },
                { name: '🏷️ Kullanıcı Adı', value: `${hedef.tag}`, inline: true },
                { name: '📅 Hesabın Açılış Tarihi', value: kurulusTarihi, inline: false },
                { name: '📥 Sunucuya Katılma Tarihi', value: katilmaTarihi, inline: false }
            )
            .setFooter({ text: `${message.author.username} tarafından istendi.`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
};
