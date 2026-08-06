const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        // 1. Kayıtsız Rolü Ver
        const kayitsizRolu = member.guild.roles.cache.find(r => r.name === 'Kayıtsız');
        if (kayitsizRolu) {
            await member.roles.add(kayitsizRolu).catch(() => {});
        }

        // 2. Senin Mevcut Hoş Geldin Log Mesajın
        const logKanaliID = '1513121681785225438'; 
        const logKanali = member.guild.channels.cache.get(logKanaliID);

        if (logKanali) {
            const rastgeleRenk = Math.floor(Math.random() * 16777215).toString(16);

            const hgEmbed = {
                color: parseInt(rastgeleRenk, 16),
                title: '🎉 Aramıza Yeni Biri Katıldı!',
                description: `Hoş geldin ${member}! Seninle birlikte sunucumuz **${member.guild.memberCount}** kişi oldu.\n\nKuralları okumayı ve iyi vakit geçirmeyi unutma!`,
                thumbnail: { url: member.user.displayAvatarURL({ dynamic: true }) },
                timestamp: new Date(),
                footer: { text: `${member.guild.name} Hoş Geldin Sistemi` }
            };

            await logKanali.send({ content: `Hoş geldin ${member}! ✨`, embeds: [hgEmbed] }).catch(err => console.error('HG mesajı hatası:', err));
        }

        // 3. Kayıt Kanalına Butonlu Mesaj Gönderme
        const kayitKanali = member.guild.channels.cache.find(c => c.name.includes('kayıt') || c.name.includes('kayit'));
        if (kayitKanali) {
            const buton = new ButtonBuilder()
                .setCustomId(`kayit_buton_${member.id}`)
                .setLabel('Kayıt Et')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📝');

            const row = new ActionRowBuilder().addComponents(buton);

            const kayitEmbed = {
                color: 0x3498db,
                title: '📋 Yeni Kayıt İstegi',
                description: `${member} sunucuya katıldı. Kayıt etmek için aşağıdaki butona tıkla kanka.`,
                fields: [
                    { name: '👤 Kullanıcı:', value: `${member.user.tag}`, inline: true },
                    { name: '🆔 ID:', value: `${member.id}`, inline: true }
                ],
                timestamp: new Date()
            };

            await kayitKanali.send({ embeds: [kayitEmbed], components: [row] }).catch(err => console.error('Kayıt butonu atılamadı:', err));
        }
    }
};
