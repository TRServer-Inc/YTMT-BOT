const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// BURAYA KENDİ DİSCORD İD'İNİ YAZABİLİRSİN (veya otomatik sahibini de kontrol ettirebiliriz)
const SAHIP_ID = '1047488395972194334'; // Senin ID'in

module.exports = {
    name: 'realrolkur',
    description: 'sunucu için özel rol şablonunu otomatik kurar.',
    async execute(message, args, client) {
        // Sadece senin ID'in ile çalışmasını istiyorsan:
        if (message.author.id !== SAHIP_ID) {
            return message.reply('bu komutu sadece kurucu (mert) kullanabilir kanka! 🛑');
        }

        // Botun rolleri yönetebilmek için yetkisi var mı kontrol edelim
        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return message.reply('bu komutu uygulamak için botun **Rolleri Yönet** yetkisine sahip olması gerekiyor kanka!');
        }

        const yukleniyor = await message.reply('⏳ roller oluşturuluyor, biraz bekletiyorum kanka...');

        // Kurulacak roller listesi (En üstten alta doğru sıralı)
        const roller = [
            { name: '👑 Real Mert', color: '#ffd700', hoist: true },
            { name: '🥈 Real KY', color: '#c0c0c0', hoist: true },
            { name: '🎬 Sunucu Yönetmeni', color: '#ff4500', hoist: true },
            { name: '🪓 Sunucu Sorumlusu', color: '#8b0000', hoist: true },
            { name: '⚡ Baş Yetkili', color: '#00ffff', hoist: true },
            { name: '🛡️ Real Yardımcı', color: '#1e90ff', hoist: true },
            { name: '👑 Efsanevi Takviyeci', color: '#ff00ff', hoist: true },
            { name: '💎 Mega Takviyeci', color: '#9370db', hoist: true },
            { name: '🥇 Uzman Takviyeci', color: '#ff8c00', hoist: true },
            { name: '🥈 Usta Takviyeci', color: '#d3d3d3', hoist: true },
            { name: '🥉 Takviyeci', color: '#cd7f32', hoist: true },
            { name: '🎬 Real İçerik Üreticisi', color: '#ff1493', hoist: true },
            { name: '🎨 Real Tasarımcı', color: '#00fa9a', hoist: true },
            { name: '🛠️ Real Fan-Game Developer', color: '#4682b4', hoist: true },
            { name: '⚡ Real Aktif Üye', color: '#ffff00', hoist: false },
            { name: '❤️ Real Üye', color: '#ff69b4', hoist: false },
            { name: '🛑 The Void', color: '#2f4f4f', hoist: false }
        ];

        let basariliSayisi = 0;
        let hataSayisi = 0;

        for (const rolBilgi of roller) {
            try {
                // Aynı isimde rol varsa tekrar oluşturmasın
                const varolanRol = message.guild.roles.cache.find(r => r.name === rolBilgi.name);
                if (!varolanRol) {
                    await message.guild.roles.create({
                        name: rolBilgi.name,
                        color: rolBilgi.color,
                        hoist: rolBilgi.hoist,
                        reason: 'Real rol şablonu otomatik kuruldu.'
                    });
                }
                basariliSayisi++;
            } catch (err) {
                console.error(`[ROL KURULUM HATA] ${rolBilgi.name}:`, err);
                hataSayisi++;
            }
        }

        const embed = new EmbedBuilder()
            .setColor('#22c55e')
            .setTitle('✅ rol şablonu başarıyla kuruldu')
            .setDescription(`toplam **${roller.length}** rol kontrol edildi/oluşturuldu!\n\n✨ **başarılı:** ${basariliSayisi}\n❌ **hata:** ${hataSayisi}`)
            .setTimestamp();

        await yukleniyor.edit({ content: null, embeds: [embed] });
    }
};
