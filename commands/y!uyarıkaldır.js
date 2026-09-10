const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Uyari } = require('../data/db.js');

module.exports = {
    name: 'uyarıkaldır',
    description: 'kullanıcının veritabanındaki belirtilen miktardaki uyarısını kaldırır.',
    async execute(message, args, client) {
        // 1. Yetki kontrolü (Mesajları Yönet veya Sunucu Sahibi)
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages) && message.author.id !== message.guild.ownerId) {
            return message.reply('bu komutu kullanmak için **Mesajları Yönet** yetkisine sahip olmalısın kanka! 🛑');
        }

        if (!args[0]) {
            return message.reply('kullanım şekli: `y!uyarıkaldır <miktar> <id_veya_etiket>` veya `y!uyarıkaldır <id_veya_etiket>`');
        }

        // 2. Akıllı Argüman Kontrolü ve Max 15 Sınırı
        let kaldirilacakMiktar = 1;
        let hedefIndex = 0;

        const idRegex = /^\d{17,21}$/;
        const mentionRegex = /^<@!?\d{17,21}>$/;

        // İlk argüman direkt ID veya Etiket ise (yani miktar yazılmadıysa)
        if (idRegex.test(args[0]) || mentionRegex.test(args[0])) {
            kaldirilacakMiktar = 1;
            hedefIndex = 0;
        } else {
            // İlk argüman miktar ise
            const girilenSayi = parseInt(args[0]);

            if (isNaN(girilenSayi) || girilenSayi <= 0) {
                return message.reply('lütfen geçerli bir uyarı kaldırma miktarı gir veya direkt kullanıcıyı etiketle kanka!');
            }

            if (girilenSayi > 15) {
                return message.reply('dur kanka naptın! tek atışta en fazla **15** uyarı kaldırabilirsin. 🛑');
            }

            kaldirilacakMiktar = girilenSayi;
            hedefIndex = 1;
        }

        const hedefInput = args[hedefIndex];
        if (!hedefInput) {
            return message.reply('lütfen uyarısını kaldırmak istediğin kullanıcıyı etiketle veya ID\'sini gir kanka!');
        }

        // 3. Kullanıcı Bulma (Etiket / ID)
        let hedefUye = message.mentions.members.first();
        let hedefUser = null;

        if (hedefUye) {
            hedefUser = hedefUye.user;
        } else {
            if (idRegex.test(hedefInput)) {
                try {
                    hedefUye = await message.guild.members.fetch(hedefInput);
                    hedefUser = hedefUye.user;
                } catch (e) {
                    try {
                        hedefUser = await client.users.fetch(hedefInput);
                    } catch (err) {
                        return message.reply('geçersiz veya bulunamayan bir Discord ID\'si girdin kanka!');
                    }
                }
            } else {
                return message.reply('geçersiz bir etiket veya ID girdin kanka!');
            }
        }

        try {
            // Veritabanındaki uyarı kaydını bul
            const kayit = await Uyari.findOne({ guildId: String(message.guild.id), userId: String(hedefUser.id) });

            if (!kayit || !Array.isArray(kayit.uyarilar) || kayit.uyarilar.length === 0) {
                return message.reply(`<@${hedefUser.id}> kullanıcısının zaten veritabanında hiç uyarısı yok kanka! 🥳`);
            }

            const mevcutUyariSayisi = kayit.uyarilar.length;

            // Eğer silinmek istenen miktar mevcuttan fazlaysa hepsini sıfırlayalım
            const silinecekAdet = Math.min(kaldirilacakMiktar, mevcutUyariSayisi);

            // Son eklenen uyarılardan itibaren kırpıyoruz (dizinin sonundan siler)
            kayit.uyarilar.splice(-silinecekAdet, silinecekAdet);

            await kayit.save();

            const kalanUyariSayisi = kayit.uyarilar.length;
            const sunucudaMiMesaj = hedefUye ? '' : ' *(Kullanıcı şu an sunucuda bulunmuyor, işlem veritabanında yapıldı)*';

            const embed = new EmbedBuilder()
                .setColor('#22c55e')
                .setTitle('✅ uyarı(lar) kaldırıldı!')
                .setDescription(`<@${hedefUser.id}> (${hedefUser.tag}) kullanıcısının **-${silinecekAdet}** uyarısı silindi.${sunucudaMiMesaj}\n\n**işlemi yapan:** ${message.author}\n**kalan uyarı sayısı:** ${kalanUyariSayisi}`)
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error('[UYARI KALDIR HATA DETAILS]:', err);
            return message.reply('uyarı kaldırılırken veritabanı hatası oluştu kanka!');
        }
    }
};
