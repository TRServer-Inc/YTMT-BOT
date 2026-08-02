module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        // SUNUCUNDAKİ LOG KANALININ ID'SİNİ BURAYA YAZ
        const logKanaliID = '1513121681785225438'; 

        const kanal = member.guild.channels.cache.get(logKanaliID);
        if (!kanal) return;

        const bbEmbed = {
            color: 0xff0000, 
            title: 'Aramızdan Ayrıldı ⁠o7',
            description: `**${member.user.tag}** sunucudan ayrıldı. Güle güle!\nKalan üye sayısı: **${member.guild.memberCount}**`,
            thumbnail: { url: member.user.displayAvatarURL({ dynamic: true, size: 256 }) },
            timestamp: new Date()
        };

        try {
            await kanal.send({ embeds: [bbEmbed] });
        } catch (error) {
            console.error('BB mesajı gönderilirken hata oluştu:', error);
        }
    }
};