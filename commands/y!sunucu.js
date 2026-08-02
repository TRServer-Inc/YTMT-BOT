const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'sunucu',
    description: 'sunucu istatistiklerini ve bilgilerini gösterir.',
    async execute(message, args, client) {
        const guild = message.guild;

        // sunucu verilerini topluyoruz
        const embedOlustur = () => {
            const memberCount = guild.memberCount;
            const categoryCount = guild.channels.cache.filter(c => c.type === 4).size; // 4 = GuildCategory
            const channelCount = guild.channels.cache.filter(c => c.type !== 4).size;
            const emoteCount = guild.emojis.cache.size;
            const boostCount = guild.premiumSubscriptionCount || 0;
            const roleCount = guild.roles.cache.size;

            const rastgeleRenk = Math.floor(Math.random() * 16777215);

            return new EmbedBuilder()
                .setAuthor({ 
                    name: `Sunucu / ${message.author.username}`, 
                    iconURL: message.author.displayAvatarURL({ dynamic: true }) 
                })
                .setTitle('Sunucu')
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .setDescription(
                    `**Üye Sayısı :** ${memberCount}\n` +
                    `**Kategori Sayısı :** ${categoryCount}\n` +
                    `**Kanal Sayısı :** ${channelCount}\n` +
                    `**Emoji Sayısı :** ${emoteCount}\n` +
                    `**Takviye Sayısı :** ${boostCount}\n` +
                    `**Rol Sayısı :** ${roleCount}`
                )
                .setColor(rastgeleRenk)
                .setFooter({ 
                    text: `${message.author.username} Kullandı`, 
                    iconURL: message.author.displayAvatarURL({ dynamic: true }) 
                })
                .setTimestamp();
        };

        // yenile butonu
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('tsay_yenile')
                .setLabel('🔟・Yenile')
                .setStyle(ButtonStyle.Primary)
        );

        const mesaj = await message.reply({ 
            embeds: [embedOlustur()], 
            components: [row] 
        });

        // buton tıklama dinleyicisi (60 saniye boyunca çalışır)
        const collector = mesaj.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (i) => {
            if (i.customId === 'tsay_yenile') {
                if (i.user.id !== message.author.id) {
                    return i.reply({ content: 'bu butonu sadece komutu yazan kişi kullanabilir!', ephemeral: true });
                }

                // kanalları/üyeleri güncel çekip embed'i tazeliyoruz
                await guild.channels.fetch();
                await guild.roles.fetch();
                
                await i.update({ embeds: [embedOlustur()] });
            }
        });

        collector.on('end', () => {
            // süre dolunca butonu pasif yapar
            const pasifRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('tsay_yenile')
                    .setLabel('🔟・Yenile')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true)
            );
            mesaj.edit({ components: [pasifRow] }).catch(() => {});
        });
    }
};