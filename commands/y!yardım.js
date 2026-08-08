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
                    .setDescription('Aşağıdaki **seçim menüsünden** veya **butonlardan** istediğin kategoriyi seçerek tüm komutları inceleyebilirsin kanka!\n\n**Kategoriler:**\n• 🎮 **Eğlence & Oyun Komutları:** Adam asmaca ve mini oyunlar\n• 📊 **İstatistik Komutları:** Mesaj ve aktiflik takibi\n• ⚙️ **Yönetim & Güvenlik Komutları:** Sunucu yönetimi, ceza, uyarı ve koruma sistemleri\n• 💤 **Kullanıcı Komutları:** Genel kullanım, bot bilgisi ve AFK sistemi\n• 💎 **Premium Komutları:** Premium ayrıcalıkları ve yönetimi\n• 🤖 **Yapay Zeka Komutları:** Akıllı sohbet ve AI özellikleri')
                    .setThumbnail(client.user.displayAvatarURL())
                    .setFooter({ text: 'Sayfa 1/7 | y!yardım' })
                    .setTimestamp()
            },
            {
                id: 'eglence_oyun',
                label: 'Eğlence & Oyun Komutları',
                emoji: '🎮',
                embed: new EmbedBuilder()
                    .setTitle('🎮 Eğlence & Oyun Komutları')
                    .setColor('#ec4899')
                    .setDescription('Sunucuda vakit geçirmek ve eğlenmek için kullanabileceğin oyun komutları.\n\n**Komutlar:**\n• `y!adamasmaca` - Kelime tahmin etmeye çalıştığın adam asmaca oyununu başlatır.\n• `y!zarat` - Rastgele zar atar.\n• `y!erensibot` - Eğlenceli bir espri mesajı ve tepkiler gönderir.')
                    .setFooter({ text: 'Sayfa 2/7 | y!yardım' })
                    .setTimestamp()
            },
            {
                id: 'istatistik',
                label: 'İstatistik Komutları',
                emoji: '📊',
                embed: new EmbedBuilder()
                    .setTitle('📊 İstatistik Komutları')
                    .setColor('#f59e0b')
                    .setDescription('Sunucudaki aktiflik ve mesaj istatistiklerini gösteren komutlar.\n\n**Komutlar:**\n• `y!mesajsayım` - Kendinizin veya etiketlenen kişinin mesaj sayısını gösterir.\n• `y!haftalıkmsjsıralama` - Bu haftanın en aktif 10 kullanıcısını sıralar.')
                    .setFooter({ text: 'Sayfa 3/7 | y!yardım' })
                    .setTimestamp()
            },
            {
                id: 'yonetim',
                label: 'Yönetim & Güvenlik Komutları',
                emoji: '⚙️',
                embed: new EmbedBuilder()
                    .setTitle('⚙️ Yönetim ve Koruma Komutları')
                    .setColor('#ef4444')
                    .setDescription('Sunucuyu yönetmek ve güvenliği sağlamak için kullanılan komutlar.\n\n**Komutlar:**\n• `y!uyarı @kullanıcı [sebep]` - Kullanıcıya kural ihlali nedeniyle uyarı verir.\n• `y!uyarılar [@kullanıcı]` - Kullanıcının toplam uyarı sayısını ve kalan ban sınırını gösterir.\n• `y!ban` - Kullanıcıya Banlanmış rolü verir ve kanallara erişimini keser.\n• `y!fullban` - Kullanıcıyı sunucudan tamamen banlar.\n• `y!unban` - Kullanıcının sunucudaki yasağını kaldırır.\n• `y!kick` - Belirtilen üyeyi sunucudan atar.\n• `y!link-engel [aç/kapat]` - Sunucuda link ve reklam paylaşımını engeller.\n• `y!ban-kurulum` - Fake ban sistemi için Banlanmış rolü ve kanal izinlerini kurar.\n• `y!kayıt-kurulum` - Kayıtsız ve Kayıtlı rollerini ve kanal izinlerini kurar.\n• `y!kayıt` - Kullanıcıyı manuel olarak kayıt eder.\n• `y!hgbb-kur [#kanal]` - Giriş-çıkış bildirimlerinin atılacağı kanalı ayarlar.\n• `y!kurallar` - Sunucu kurallarını ve onay butonunu gönderir.\n• `y!rolekle` - Sunucu için hazır temel rollerin tamamını otomatik oluşturur.\n• `y!rolleri-sil` - Sunucudaki özel rolleri topluca siler.\n• `y!sunucukur` - Sunucu için hazır kanal ve kategorileri oluşturur.\n• `y!rolver` - Belirtilen üyeye rol verir.\n• `y!rolal` - Belirtilen üyeden rol alır.')
                    .setFooter({ text: 'Sayfa 4/7 | y!yardım' })
                    .setTimestamp()
            },
            {
                id: 'kullanici',
                label: 'Kullanıcı Komutları',
                emoji: '💤',
                embed: new EmbedBuilder()
                    .setTitle('💤 Kullanıcı Komutları')
                    .setColor('#10b981')
                    .setDescription('Tüm kullanıcıların erişebileceği genel kullanım komutları.\n\n**Komutlar:**\n• `y!botbilgi` - Botun istatistiklerini, ping değerini ve tanıtım kartını gösterir.\n• `y!afk [sebep]` - Sizi AFK moduna alır, mesaj yazınca otomatik çıkar.\n• `y!sa` / `sa` - Otomatik selamlaşma sistemini tetikler.\n• `y!ping` - Botun gecikme süresini gösterir.\n• `y!profil` - Kullanıcının profil bilgilerini gösterir.\n• `y!sunucu` - Sunucu istatistiklerini ve bilgilerini gösterir.')
                    .setFooter({ text: 'Sayfa 5/7 | y!yardım' })
                    .setTimestamp()
            },
            {
                id: 'premium',
                label: 'Premium Komutları',
                emoji: '💎',
                embed: new EmbedBuilder()
                    .setTitle('💎 Premium Komutları')
                    .setColor('#f1c40f')
                    .setDescription('Premium sistemi ve ayrıcalıklı komutlar.\n\n**Komutlar:**\n• `oto-rol` - Sunucuya yeni katılanlara otomatik rol verir (Premium Özel).\n• `y!premium` - Sunucunun premium durumunu gösterir.\n• `y!premium-al` - Premium satın alma bağlantısını gönderir.\n• `y!premium-ver` - Sunucu veya kullanıcıya premium verir (Bot Sahibi).')
                    .setFooter({ text: 'Sayfa 6/7 | y!yardım' })
                    .setTimestamp()
            },
            {
                id: 'yapayzeka',
                label: 'Yapay Zeka Komutları',
                emoji: '🤖',
                embed: new EmbedBuilder()
                    .setTitle('🤖 Yapay Zeka Komutları')
                    .setColor('#8b5cf6')
                    .setDescription('Bot ile etkileşime geçebileceğiniz yapay zeka özellikleri.\n\n**Özellikler:**\n• **DM Sohbeti:** Bota DM atarak direkt sohbet edebilirsiniz.\n• **Etiket/Yanıt Sohbeti:** Sunucuda bota yanıt vererek veya etiketleyerek soru sorabilirsiniz.')
                    .setFooter({ text: 'Sayfa 7/7 | y!yardım' })
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
