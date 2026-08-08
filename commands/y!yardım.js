const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    name: 'yardım',
    description: 'Botun tüm komutlarını kategoriler halinde gösterir.',
    async execute(message, args, client) {
        
        // --- SAYFA VE KATEGORİ TANIMLARI ---
        const sayfalar = [
            {
                id: 'ana_sayfa',
                label: 'Ana Sayfa',
                emoji: '🏠',
                embed: new EmbedBuilder()
                    .setTitle('🤖 Bot Yardım Menüsü')
                    .setColor('#3b82f6')
                    .setDescription('Aşağıdaki **seçim menüsünden** veya **butonlardan** istediğin kategoriyi seçerek tüm komutları inceleyebilirsin kanka!\n\n**Kategoriler:**\n• 🎮 **Eğlence & Oyun Komutları:** Adam asmaca ve mini oyunlar\n• 📊 **İstatistik Komutları:** Mesaj ve aktiflik takibi\n• ⚙️ **Yönetim Komutları:** Sunucu ayarları ve güvenlik\n• 💤 **Kullanıcı Komutları:** Genel kullanım ve AFK sistemi\n• 🤖 **Yapay Zeka Komutları:** Akıllı sohbet ve AI özellikleri')
                    .setThumbnail(client.user.displayAvatarURL())
                    .setFooter({ text: 'Sayfa 1/6 | y!yardım' })
                    .setTimestamp()
            },
            {
                id: 'eglence_oyun',
                label: 'Eğlence & Oyun Komutları',
                emoji: '🎮',
                embed: new EmbedBuilder()
                    .setTitle('🎮 Eğlence & Oyun Komutları')
                    .setColor('#ec4899')
                    .setDescription('Sunucuda vakit geçirmek ve eğlenmek için kullanabileceğin oyun komutları.\n\n**Komutlar**\n• `y!adamasmaca` - Kelime tahmin etmeye çalıştığın adam asmaca oyununu başlatır.\n• `y!sayıtahmin` - Botun tuttuğu sayıyı tahmin etme oyunu açar.\n• `y!yazıtura` - Yazı mı tura mı atışı yapar.\n• `y!zar` - Rastgele zar atar.')
                    .setFooter({ text: 'Sayfa 2/6 | y!yardım' })
                    .setTimestamp()
            },
            {
                id: 'istatistik',
                label: 'İstatistik Komutları',
                emoji: '📊',
                embed: new EmbedBuilder()
                    .setTitle('📊 İstatistik Komutları')
                    .setColor('#f59e0b')
                    .setDescription('Sunucudaki aktiflik ve mesaj istatistiklerini gösteren komutlar.\n\n**Komutlar**\n• `y!mesajsayım` - Kendinizin veya etiketlenen kişinin mesaj sayısını gösterir.\n• `y!haftalıkmsjsıralama` - Bu haftanın en aktif 10 kullanıcısını sıralar.')
                    .setFooter({ text: 'Sayfa 3/6 | y!yardım' })
                    .setTimestamp()
            },
            {
                id: 'yonetim',
                label: 'Yönetim Komutları',
                emoji: '⚙️',
                embed: new EmbedBuilder()
                    .setTitle('⚙️ Yönetim ve Koruma Komutları')
                    .setColor('#ef4444')
                    .setDescription('Sunucuyu yönetmek ve güvenliği sağlamak için kullanılan komutlar.\n\n**Komutlar**\n• `y!link-engel [aç/kapat]` - Sunucuda link ve reklam paylaşımını engeller.\n• `y!hg-bb [#kanal]` - Giriş-çıkış bildirimlerinin atılacağı kanalı ayarlar.\n• `y!kufurengel` - Otomatik küfür koruması filtreleme sistemini çalıştırır.')
                    .setFooter({ text: 'Sayfa 4/6 | y!yardım' })
                    .setTimestamp()
            },
            {
                id: 'kullanici',
                label: 'Kullanıcı Komutları',
                emoji: '💤',
                embed: new EmbedBuilder()
                    .setTitle('💤 Kullanıcı Komutları')
                    .setColor('#10b981')
                    .setDescription('Tüm kullanıcıların erişebileceği genel kullanım komutları.\n\n**Komutlar**\n• `y!afk [sebep]` - Sizi AFK moduna alır, mesaj yazınca otomatik çıkar.\n• `y!sa` / `sa` - Otomatik selamlaşma sistemini tetikler.\n• `y!ping` - Botun gecikme süresini gösterir.')
                    .setFooter({ text: 'Sayfa 5/6 | y!yardım' })
                    .setTimestamp()
            },
            {
                id: 'yapayzeka',
                label: 'Yapay Zeka Komutları',
                emoji: '🤖',
                embed: new EmbedBuilder()
                    .setTitle('🤖 Yapay Zeka Komutları')
                    .setColor('#8b5cf6')
                    .setDescription('Bot ile etkileşime geçebileceğiniz yapay zeka özellikleri.\n\n**Özellikler**\n• **DM Sohbeti:** Bota DM atarak direkt sohbet edebilirsiniz.\n• **Etiket/Yanıt Sohbeti:** Sunucuda bota yanıt vererek veya etiketleyerek soru sorabilirsiniz.')
                    .setFooter({ text: 'Sayfa 6/6 | y!yardım' })
                    .setTimestamp()
            }
        ];

        let mevcutSayfaIndex = 0;

        // --- BİLEŞEN OLUŞTURUCU FONKSİYON ---
        function bileşenleriOlustur(index) {
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('yardim_select')
                .setPlaceholder('Bir kategori seçin...')
                .addOptions(
                    sayfalar.map((s, i) => ({
                        label: s.label,
                        value: i.toString(),
                        emoji: s.emoji,
                        default: i === index
                    }))
                );

            const menuRow = new ActionRowBuilder().addComponents(selectMenu);

            const geriButon = new ButtonBuilder()
                .setCustomId('yardim_geri')
                .setLabel('Geri')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(index === 0);

            const anaSayfaButon = new ButtonBuilder()
                .setCustomId('yardim_ana_sayfa')
                .setLabel('Ana Sayfa')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(index === 0);

            const ileriButon = new ButtonBuilder()
                .setCustomId('yardim_ileri')
                .setLabel('İleri')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(index === sayfalar.length - 1);

            const buttonRow = new ActionRowBuilder().addComponents(geriButon, anaSayfaButon, ileriButon);

            return [menuRow, buttonRow];
        }

        // --- İLK MESAJI GÖNDERME ---
        const mesaj = await message.reply({
            embeds: [sayfalar[mevcutSayfaIndex].embed],
            components: bileşenleriOlustur(mevcutSayfaIndex)
        });

        // --- ETKİLEŞİM DİNLEYİCİSİ (COLLECTOR) ---
        const collector = mesaj.createMessageComponentCollector({
            time: 120000
        });

        collector.on('collect', async (i) => {
            if (i.user.id !== message.author.id) {
                return i.reply({ content: 'bu menüyü sadece komutu yazan kişi kullanabilir kanka!', ephemeral: true });
            }

            if (i.componentType === ComponentType.StringSelect) {
                mevcutSayfaIndex = parseInt(i.values[0]);
            } else if (i.componentType === ComponentType.Button) {
                if (i.customId === 'yardim_geri') {
                    if (mevcutSayfaIndex > 0) mevcutSayfaIndex--;
                } else if (i.customId === 'yardim_ileri') {
                    if (mevcutSayfaIndex < sayfalar.length - 1) mevcutSayfaIndex++;
                } else if (i.customId === 'yardim_ana_sayfa') {
                    mevcutSayfaIndex = 0;
                }
            }

            await i.update({
                embeds: [sayfalar[mevcutSayfaIndex].embed],
                components: bileşenleriOlustur(mevcutSayfaIndex)
            });
        });

        collector.on('end', () => {
            mesaj.edit({ components: [] }).catch(() => {});
        });
    }
};
