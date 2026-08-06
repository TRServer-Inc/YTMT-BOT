const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'kurallar',
    description: 'sunucu kurallarını ve onay butonunu gönderir.',
    async execute(message, args, client) {
        // yetki kontrolü
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('Bu komutu kullanmak için `Yönetici` yetkisine sahip olmalısın.');
        }

        // komut mesajını sil
        try { await message.delete(); } catch (e) {}

        const rastgeleRenk = Math.floor(Math.random() * 16777215).toString(16);

        // kurallar embed
        const kurallarEmbed = new EmbedBuilder()
            .setColor(parseInt(rastgeleRenk, 16))
            .setTitle(' - - - KURALLAR - - - ')
            .setDescription(`
- Nazik ve medeni olun. Tüm üyelere saygılı davranın ve düşüncelerinizi yapıcı bir şekilde ifade edin.
- Uygun bir isim ve avatar kullanın. Özel karakterler, emoji, küfür ve kaba isimlerden kaçının.
- Reklam içeren her türlü mesaj cezalandırılmanıza neden olur.
- Küfür, hakaret, aşağılayıcı bir dil içeren tüm mesajlar yasaktır.
- Spam-flood yapmayın. Aşırı mesaj, resim, biçimlendirme, emoji, komutlar ve bahsetmelerden kaçının.
- Yetkililere gereksiz etiket atmayın.
- Kişisel bilgi yok. Gizliliğinizi ve başkalarının mahremiyetini koruyun.
- Taciz ve zorbalık yapmayın.
- Irkçı, cinsiyetçi veya başka türlü saldırgan söylemlerde bulunmayın.
- Siyasi veya dini konular hakkında tartışma konusu açmayın.
- Yazı ve görsel kanalları içeriği dışında kullanmayın.
- Mesaj yazarken büyük harf kullanmak bağırmak anlamına geleceği için kesinlikle büyük harf kullanarak yazı yazmayınız.
- Discord kanallarında gereksiz-kişisel tartışmalara-atışmalara girmek yasaktır.
- Discord birbirinize meydan okuyacak bir yer değildir.
- Başkasına ait kişisel bilgiler yayınlamak yasaktır. (Telefon numarası E-Posta adresi, Fotoğraf v.b)
- Yetkililer her yazılan mesajı kontrol edemeyebilirler. Yöneticilerden önce uygunsuz bir mesajla karşılaştığınızda lütfen sorumlu yöneticilere bildiriniz.
- Yetkililer sunucudan sorumlu kişilerdir. Gereksiz tartışmalara girmek yasaktır.
- Durum kısmında şahsa yönelik küfür ve kaba yazılar yazmanız sunucudan atılmanıza sebeptir. Saygısızca yazılar yazmaktan kaçının.
- Gereksiz emoji, spoiler, embed vs. atmayın.
- Bilgilendirme kanalını okumayıp bilgilendirme kanalında cevabı olan bir soruyu sormayın.
- Sohbette bir suç gördüğünüzde suçu sohbette yazmak yerine talep oluşturunuz.
- Chati kirletecek mesajlardan kaçının.

**NOT:** Moderatörler özel durumlarda kuralları değiştirebilir, değiştirme hakkını gizli tutar.

@everyone @here
            `)
            .setFooter({ text: 'Kurallara Uymayan Kişi 1 Gün Ban' });

        // kabul et butonu
        const buton = new ButtonBuilder()
            .setCustomId('kural_kabul')
            .setLabel('Kabul Et')
            .setStyle(ButtonStyle.Success);

        const satir = new ActionRowBuilder().addComponents(buton);

        const anaMesaj = await message.channel.send({ 
            embeds: [kurallarEmbed], 
            components: [satir] 
        });

        try {
            await anaMesaj.react('✅');
            await anaMesaj.react('❌');
        } catch (error) {
            console.error('Reaksiyon hatası:', error);
        }
    }
};
