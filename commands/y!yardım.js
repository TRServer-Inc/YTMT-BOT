module.exports = {
    name: 'yardım',
    description: 'Botun tüm komutlarını ve kullanım kılavuzunu listeler.',
    async execute(message, args, client) {
        const yardimEmbed = {
            color: 0x3498db,
            title: '🤖 YTMTBot | Komut Menüsü',
            description: 'Aşağıda sunucuda kullanabileceğin tüm güncel komutlar kategorilere ayrılmış olarak listelenmiştir, kanka!',
            thumbnail: { url: client.user.displayAvatarURL({ dynamic: true }) },
            fields: [
                {
                    name: '🛡️ Moderasyon & Ceza Sistemleri',
                    value: [
                        '`y!ban @üye [sebep]` • Kullanıcıya **Banlanmış** rolü verir ve kanallardan kısıtlar.',
                        '`y!fullban @üye [sebep]` • Kullanıcıyı sunucudan **tamamen banlar**.',
                        '`y!kick @üye [sebep]` • Kullanıcıyı sunucudan atar.',
                        '`y!unban <id>` • Banlanmış üyenin banını kaldırır.',
                        '`y!ban-kurulum [#kanal]` • Banlanmış rolünü ve kanal erişim izinlerini ayarlar.'
                    ].join('\n')
                },
                {
                    name: '📝 Kayıt Sistemleri',
                    value: [
                        '`y!kayıt @üye Ad [Yaş]` • Üyeyi manuel olarak kayıt eder.',
                        '`y!kayıt-kurulum #kanal` • Kayıtsız/Kayıtlı rollerini ve kayıt kanalını kurar.'
                    ].join('\n')
                },
                {
                    name: '👑 Yönetim & Sunucu Ayarları',
                    value: [
                        '`y!oto-rol` • Sunucuya katılana otomatik rol verme ayarı.',
                        '`y!hgbb-kur` • Hoş geldin ve güle güle log kanalını ayarlar.',
                        '`y!link-engel` • Link paylaşım korumasını açar/kapatır.',
                        '`y!rolekle @üye @rol` • Kullanıcıya rol verir.',
                        '`y!rolver @üye @rol` • Rol verme işlemini yönetir.',
                        '`y!rolal @üye @rol` • Kullanıcıdan rol alır.',
                        '`y!rolleri-sil` • Oluşturulan fazla rollerı temizler.'
                    ].join('\n')
                },
                {
                    name: '⭐ Premium & Ekstra Sistemler',
                    value: [
                        '`y!premium` • Premium durumunuzu ve ayrıcalıkları kontrol eder.',
                        '`y!premium-ver @üye` • Üyeye premium üyelik tanımlar.',
                        '`y!premium-al @üye` • Üyenin premium üyeliğini geri alır.'
                    ].join('\n')
                },
                {
                    name: '⚙️ Genel & Bilgi Komutları',
                    value: [
                        '`y!ping` • Botun gecikme sürelerini gösterir.',
                        '`y!profil [@üye]` • Kullanıcı profil bilgilerini ve kartını gösterir.',
                        '`y!sunucu` • Sunucu istatistiklerini ve bilgilerini gösterir.',
                        '`y!sunucukur` • Otomatik sunucu şablonu kurar.',
                        '`y!kurallar` • Sunucu kurallarını kanala yazdırır.',
                        '`y!sa` • Otomatik selamlaşma sistemini yönetir.'
                    ].join('\n')
                }
            ],
            footer: {
                text: `${message.guild.name} • Toplam Komut Sayısı: 21`,
                icon_url: message.guild.iconURL({ dynamic: true })
            },
            timestamp: new Date()
        };

        return message.channel.send({ embeds: [yardimEmbed] });
    }
};
