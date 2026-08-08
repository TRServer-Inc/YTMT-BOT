const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'botbilgi',
    description: 'Botun genel bilgilerini, istatistiklerini ve özelliklerini gösterir.',
    async execute(message, args, client) {
        
        const toplamSunucu = client.guilds.cache.size;
        const toplamKullanici = client.guilds.cache.reduce((a, b) => a + b.memberCount, 0);
        const ping = client.ws.ping;

        const embed = new EmbedBuilder()
            .setTitle(`🤖 ${client.user.username} - Bot Tanıtım & Bilgi`)
            .setColor('#3b82f6')
            .setThumbnail(client.user.displayAvatarURL())
            .setDescription('selam kanka! ben sunucunu yönetmeni, güvenliğini sağlamanı ve üyelerinle eğlenceli vakit geçirmeni sağlayan gelişmiş bir discord botuyum.')
            .addFields(
                { 
                    name: '📊 Bot İstatistikleri', 
                    value: `• **Sunucular:** \`${toplamSunucu}\`\n• **Kullanıcılar:** \`${toplamKullanici}\`\n• **Gecikme (Ping):** \`${ping} ms\``, 
                    inline: true 
                },
                { 
                    name: '⚙️ Altyapı', 
                    value: '• **Kütüphane:** `Discord.js v14`\n• **Komut Ön Ek:** `y!`', 
                    inline: true 
                },
                { 
                    name: '🌟 Öne Çıkan Özellikler', 
                    value: '• **⚠️ Uyarı & Ceza Sistemi:** Kural ihlallerini takip edin ve 10 uyarı sınırıyla yönetin.\n• **⚙️ Sunucu Yönetimi & Kurulum:** Otomatik roller, kayıt sistemi, ban/kick ve hazır sunucu şablonları.\n• **🛡️ Koruma Sistemleri:** Reklam ve link engelleme filtreleri.\n• **🎮 Oyun & Eğlence:** Adam asmaca ve mini oyunlar.\n• **📈 İstatistik Takibi:** Mesaj sıralaması ve aktiflik analizi.\n• **🤖 Yapay Zeka Desteği:** Etiketleyerek veya DM üzerinden akıllı sohbet.', 
                    inline: false 
                }
            )
            .setFooter({ text: 'y!yardım yazarak tüm komut kategorilerine ulaşabilirsin.' })
            .setTimestamp();

        // isteğe bağlı davet ve destek butonu
        const butonSatiri = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Botu Sunucuna Ekle')
                .setStyle(ButtonStyle.Link)
                .setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`),
            new ButtonBuilder()
                .setCustomId('yardim_yonlendir')
                .setLabel('Komut Listesi (y!yardım)')
                .setStyle(ButtonStyle.Primary)
        );

        const mesaj = await message.channel.send({ embeds: [embed], components: [butonSatiri] });

        // buton etkileşimi
        const collector = mesaj.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (i) => {
            if (i.customId === 'yardim_yonlendir') {
                if (i.user.id !== message.author.id) {
                    return i.reply({ content: 'bu butonu sadece komutu yazan kişi kullanabilir kanka!', ephemeral: true });
                }
                
                await i.reply({ content: 'yardım menüsünü açmak için `y!yardım` yazabilirsin kanka!', ephemeral: true });
            }
        });

        collector.on('end', () => {
            // süre dolunca butonu deaktif et
            const disabledRow = new ActionRowBuilder().addComponents(
                ButtonBuilder.from(butonSatiri.components[0]),
                ButtonBuilder.from(butonSatiri.components[1]).setDisabled(true)
            );
            mesaj.edit({ components: [disabledRow] }).catch(() => {});
        });
    }
};
