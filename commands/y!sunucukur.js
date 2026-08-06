module.exports = {
    name: 'sunucukur',
    async execute(message, args, client) {
        if (message.author.id !== message.guild.ownerId) return message.reply('Üzgünüm. Sunucu Sahibi değilsin.');

        try {
            const bilgiMesajı = await message.reply('Sunucu kurulumu başlatıldı... 💥');

            const onemliKanallarKat = await message.guild.channels.create({ name: '|▬▬|Önemli Kanallar|▬▬|', type: 4 });
            const genelKanallarKat = await message.guild.channels.create({ name: '|▬▬|Genel Kanallar|▬▬|', type: 4 });
            const sesliKanallarKat = await message.guild.channels.create({ name: '|▬▬|Sesli Kanallar|▬▬|', type: 4 });
            const oyunOdalariKat = await message.guild.channels.create({ name: '|▬▬|Oyun Odaları|▬▬|', type: 4 });
            const eglenceOdalariKat = await message.guild.channels.create({ name: '|▬▬|Eğlence Odaları|▬▬|', type: 4 });

            const onemliKanallar = ['📜┇Kurallar', '📢┇Duyuru', '🚪┇Gelen-Giden', '🎁┇Çekiliş', '➕️┇Video-Duyuru', '❓️┇Rol-Al', '🔝┇Olup-Bitenler', '😡┇Şikayet', '🎉┇Etkinlik'];
            for (const kanalAdı of onemliKanallar) { await message.guild.channels.create({ name: kanalAdı, type: 0, parent: onemliKanallarKat.id }); }

            const genelKanallar = ['💬┇Sohbet', '📸┇Görsel-Video', '💻┇Bot-Komutları', '💡┇Video-Öneri', '🤝┇Partner'];
            for (const kanalAdı of genelKanallar) { await message.guild.channels.create({ name: kanalAdı, type: 0, parent: genelKanallarKat.id }); }

            const sesliKanallar = ['💬┇Sohbet', '🎶┇Konser', '🔊┇Meydan'];
            for (const kanalAdı of sesliKanallar) { await message.guild.channels.create({ name: kanalAdı, type: 2, parent: sesliKanallarKat.id }); }

            const oyunOdaları = ['🎮┇Oyun Odası 1', '🎮┇Oyun Odası 2', '🎮┇Oyun Odası 3'];
            for (const kanalAdı of oyunOdaları) { await message.guild.channels.create({ name: kanalAdı, type: 2, parent: oyunOdalariKat.id }); }

            const eglenceOdaları = ['🎲┇zar-at', '🐟┇balık-tut', '🌤┇hava-durumu', '💀┇şaşkınlık-seviyesi', '🧠┇iq', '😕┇efkar', '📦┇yeni-yıl-hediyen'];
            for (const kanalAdı of eglenceOdaları) { await message.guild.channels.create({ name: kanalAdı, type: 0, parent: eglenceOdalariKat.id }); }

            await bilgiMesajı.edit({ content: 'Bitti💥', embeds: [{ color: 0xFFFFFF, description: '**Bütün Kanallar Kuruldu!**' }] });
        } catch (error) {
            console.error(error);
            message.reply('Kanallar oluşturulurken bir hata meydana geldi.');
        }
    }
};
