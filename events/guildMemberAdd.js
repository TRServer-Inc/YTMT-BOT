module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        // SUNUCUNDAKİ LOG KANALININ ID'SİNİ BURAYA YAZ
        const logKanaliID = '1513121681785225438'; 

        const kanal = member.guild.channels.cache.get(logKanaliID);
        if (!kanal) return;

        const rastgeleRenk = Math.floor(Math.random() * 16777215).toString(16);

        const hgEmbed = {
            color: parseInt(rastgeleRenk, 16),
            title: '🎉 Aramıza Yeni Biri Katıldı!',
            description: `Hoş geldin ${member}! Seninle birlikte sunucumuz **${member.guild.memberCount}** kişi oldu.\n\nKuralları okumayı ve iyi vakit geçirmeyi unutma!`,
            thumbnail: { url: member.user.displayAvatarURL({ dynamic: true }) },
            timestamp: new Date(),
            footer: { text: `${member.guild.name} Hoş Geldin Sistemi` }
        };

        try {
            await kanal.send({ content: `Hoş geldin ${member}! ✨`, embeds: [hgEmbed] });
        } catch (error) {
            console.error('HG mesajı gönderilirken hata oluştu:', error);
        }
    }
};