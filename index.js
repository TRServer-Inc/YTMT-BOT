require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection, ActivityType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// --- 1. MONGODB BAĞLANTISI VE ŞEMALAR ---
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('[DATABASE] MongoDB bağlantısı başarıyla kuruldu! 🎉'))
        .catch(err => console.error('[DATABASE HATA] MongoDB bağlantı hatası:', err.message));
} else {
    console.error('[DATABASE HATA] MONGO_URI .env dosyasında bulunamadı!');
}

// HGBB Şeması
const hgbbSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    channelId: { type: String, required: true }
});
const Hgbb = mongoose.model('Hgbb', hgbbSchema);

// Link Engel Şeması (MongoDB Tabanlı)
const linkEngelSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    durum: { type: Boolean, default: false }
});
const LinkEngel = mongoose.model('LinkEngel', linkEngelSchema);

// --- 2. BOT KURULUMU VE INTENTLER ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildPresences
    ],
    partials: [Partials.Channel]
});

// SERVER VE CONSOLE PANELİ BAĞLANTISI
const app = require('./server.js');
app.set('discordClient', client);

client.commands = new Collection();
const aiCooldowns = new Map();

// --- DATA KLASÖRÜ VE KÜFÜR LİSTESİ ---
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const kufurlerPath = path.join(dataDir, 'kufurler.json');
let kufurlerListesi = [];

function kufurleriYukle() {
    try {
        if (fs.existsSync(kufurlerPath)) {
            const rawData = fs.readFileSync(kufurlerPath, 'utf8');
            const parsed = JSON.parse(rawData);
            kufurlerListesi = Array.isArray(parsed) ? parsed : (parsed.kufurler || []);
            console.log(`[SİSTEM] ${kufurlerListesi.length} adet küfür hafızaya yüklendi.`);
        } else {
            console.log('[UYARI] data/kufurler.json dosyası bulunamadı!');
        }
    } catch (e) {
        console.error('[HATA] data/kufurler.json okuma hatası:', e);
    }
}
kufurleriYukle();

// --- 3. KOMUT YÜKLEYİCİ ---
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('execute' in command) {
            client.commands.set(command.name, command);
            console.log(`[KOMUT YÜKLENDİ] ${command.name}`);
        }
    }
}

// --- YAPAY ZEKA SORGULAMA FONKSİYONU ---
async function geminiCevapAl(soru) {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const bodyPayload = {
        systemInstruction: {
            parts: [
                { text: "Sen cana yakın, esprili, Roblox ve Minecraft oyunlarını çok iyi bilen fırlama bir Discord botusun. Lafı uzatmadan, kendini tekrar etmeden direkt olarak net, emojili ve kısa bir cevap ver." }
            ]
        },
        contents: [
            {
                role: "user",
                parts: [{ text: soru }]
            }
        ]
    };

    const response = await axios.post(url, bodyPayload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
    });

    return response.data;
}

// --- TÜRKÇE HARF TEMİZLEME YARDIMCISI ---
function metniNormalizeEt(str) {
    if (!str) return '';
    return str
        .replace(/İ/g, 'i')
        .replace(/I/g, 'ı')
        .toLocaleLowerCase('tr-TR')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c');
}

// --- 4. MERKEZÎ MESAJ DİNLEYİCİSİ ---
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const hamMesaj = message.content ? message.content.trim() : "";
    if (!hamMesaj) return;

    // AFK Kontrolü
    const afkCommand = client.commands.get('afk') || client.commands.get('y!afk');
    if (afkCommand && afkCommand.afkMap) {
        const afkMap = afkCommand.afkMap;

        if (afkMap.has(message.author.id) && !hamMesaj.toLowerCase().startsWith('y!afk')) {
            afkMap.delete(message.author.id);

            try {
                if (message.member && message.member.displayName.startsWith('⏳ ')) {
                    const eskiIsim = message.member.displayName.replace('⏳ ', '');
                    await message.member.setNickname(eskiIsim);
                }
            } catch (err) {
                console.log('[AFK HATA] Rumuz sıfırlanamadı.');
            }

            const hosgeldinEmbed = new EmbedBuilder()
                .setTitle('🎉 Hoş Geldin!')
                .setColor('#22c55e')
                .setDescription(`Tekrardan hoş geldin **${message.author.username}**!\nArtık **AFK** değilsin.`)
                .setFooter({ text: 'AFK modundan çıkarıldın.' });

            message.reply({ embeds: [hosgeldinEmbed] });
        }

        if (message.mentions.users.size > 0) {
            message.mentions.users.forEach(user => {
                if (afkMap.has(user.id)) {
                    const bilgi = afkMap.get(user.id);
                    const dk = Math.floor((Date.now() - bilgi.zaman) / 1000 / 60);

                    const afkUyariEmbed = new EmbedBuilder()
                        .setTitle('⚠️ Kullanıcı AFK')
                        .setColor('#f59e0b')
                        .setDescription(`Etiketlediğin **${user.username}** şu an AFK!\n\n**Sebep:** ${bilgi.sebep}\n**Süre:** ${dk > 0 ? `${dk} dakika önce` : 'az önce'} afk oldu.`);

                    message.reply({ embeds: [afkUyariEmbed] });
                }
            });
        }
    }

    // DM Yapay Zeka Mesajlaşması
    if (!message.guild) {
        const simdi = Date.now();
        const sonKullanim = aiCooldowns.get(message.author.id) || 0;
        if (simdi - sonKullanim < 4000) {
            return message.reply('Yavaş kanka! 4 saniyede bir yazabilirsin 🛑');
        }
        aiCooldowns.set(message.author.id, simdi);

        try {
            await message.channel.sendTyping();
            const data = await geminiCevapAl(hamMesaj);

            if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
                const cevap = data.candidates[0].content.parts[0].text;
                if (cevap.length > 2000) {
                    return message.reply(cevap.substring(0, 1900) + '... (Cevap çok uzun)');
                }
                return message.reply(cevap);
            } else {
                return message.reply('Şu an cevabı tam toparlayamadım kanka, tekrar sorar mısın? 🤔');
            }
        } catch (error) {
            if (error.response && error.response.status === 429) {
                return message.reply('Kanka API biraz yoruldu, 15-20 saniye soluklanıp öyle yaz! 😅');
            }
            console.error('DM Yapay Zeka Hatası:', error.message);
            return message.reply('API bağlantısında ufak bir takılma oldu kanka, bir daha yazsana!');
        }
    }

    const hamKucuk = hamMesaj.toLowerCase();

    // Genel Komut Tetikleme (y! ile başlayan tüm komutlar)
    if (hamKucuk.startsWith('y!')) {
        const args = hamMesaj.slice(2).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName) || client.commands.get(`y!${commandName}`);
        if (command && typeof command.execute === 'function') {
            try {
                return await command.execute(message, args, client);
            } catch (error) {
                console.error(`${commandName} çalışırken hata:`, error);
                return message.reply('Komut çalıştırılırken bir hata oluştu!');
            }
        }
    }

    // Selamlaşma
    if (hamKucuk === 'sa' || hamKucuk === 's.a' || hamKucuk === 'selamun aleyküm' || hamKucuk === 'selamün aleyküm') {
        return message.reply('Aleyküm Selam, hoş geldin!');
    }

    const isYonetici = message.member && message.member.permissions.has(PermissionFlagsBits.Administrator);

    // Caps Lock Engeli
    if (!isYonetici) {
        const buyukHarfSayisi = (hamMesaj.match(/[A-ZÇĞİÖŞÜ]/g) || []).length;
        if (buyukHarfSayisi >= 5 && hamMesaj.length > 7) {
            try {
                await message.delete();
                const rastgeleRenk = Math.floor(Math.random() * 16777215).toString(16);
                const capsEmbed = {
                    color: parseInt(rastgeleRenk, 16),
                    title: '🔠 Caps Lock Yasak!',
                    description: `Yavaş, fazla büyük harf kullanımı yasak ${message.author}!`,
                    thumbnail: { url: 'https://cdn.discordapp.com/emojis/776713577452273706.png?v=1' },
                    footer: { text: `${message.author.username} uyarıldı.`, icon_url: message.author.displayAvatarURL({ dynamic: true }) },
                    timestamp: new Date()
                };
                const capsUyari = await message.channel.send({ embeds: [capsEmbed], allowedMentions: { repliedUser: false } });
                setTimeout(() => capsUyari.delete().catch(() => {}), 5000);
                return;
            } catch (e) {
                console.error('[CAPS SILMA HATASI]', e.message);
            }
        }
    }

    // Link Engelleme (MongoDB Kontrollü)
    if (!isYonetici) {
        try {
            const linkAyar = await LinkEngel.findOne({ guildId: message.guild.id });
            if (linkAyar && linkAyar.durum) {
                const linkRegex = /(https?:\/\/|www\.|discord\.gg|discord\.com\/invite|[a-zA-Z0-9-]+\.(com|net|org|xyz|tk|ml|ga|cf|gq|site|online|store|io|me|tv|co))/i;

                if (linkRegex.test(hamMesaj)) {
                    await message.delete().catch(() => {});
                    const uyari = await message.channel.send(`⚠️ ${message.author}, bu sunucuda **link/reklam** paylaşımı yasaktır!`);
                    setTimeout(() => uyari.delete().catch(() => {}), 5000);
                    return;
                }
            }
        } catch (e) {
            console.error('[LİNK ENGEL HATASI]', e);
        }
    }

    // Küfür Filtresi (kufurler.json üzerinden)
    if (kufurlerListesi.length > 0) {
        const normMesaj = metniNormalizeEt(hamMesaj);
        const temizlenmisNoktalama = normMesaj.replace(/[^a-z0-9\s]/g, ' ');

        const kufurVarMi = kufurlerListesi.some(kufur => {
            if (typeof kufur !== 'string') return false;
            const normKufur = metniNormalizeEt(kufur.trim());
            if (!normKufur) return false;

            const regex = new RegExp(`(?:^|\\s)${normKufur}(?:$|\\s)`, 'i');
            return regex.test(normMesaj) || regex.test(temizlenmisNoktalama);
        });

        if (kufurVarMi) {
            console.log(`[KÜFÜR YAKALANDI] Yazan: ${message.author.tag} | Mesaj: "${hamMesaj}"`);
            
            try {
                await message.delete();
                const rastgeleRenk = Math.floor(Math.random() * 16777215).toString(16);
                const uyariEmbed = {
                    color: parseInt(rastgeleRenk, 16),
                    title: '🚫 Küfür Yasak!',
                    description: `${message.author}, bu sunucuda küfür veya argo kullanımı yasaktır!`,
                    thumbnail: { url: 'https://cdn.discordapp.com/emojis/776713577452273706.png?v=1' },
                    footer: { text: `${message.author.username} uyarıldı.`, icon_url: message.author.displayAvatarURL({ dynamic: true }) },
                    timestamp: new Date()
                };
                const uyariMesaji = await message.channel.send({ embeds: [uyariEmbed], allowedMentions: { repliedUser: false } });
                setTimeout(() => { uyariMesaji.delete().catch(() => {}); }, 5000);
                return;
            } catch (error) {
                console.error('[KÜFÜR SILMA HATASI]', error.message);
            }
        }
    }

    // Bota Etiket/Yanıt ile Yapay Zeka Cevabı
    const botEtiketlendiMi = message.mentions.has(client.user) && !message.mentions.everyone;
    const botaYanitVerildiMi = message.reference && message.referencedMessage && message.referencedMessage.author.id === client.user.id;

    if (botEtiketlendiMi || botaYanitVerildiMi) {
        if (hamKucuk.startsWith('y!')) return;

        const simdi = Date.now();
        const sonKullanim = aiCooldowns.get(message.author.id) || 0;
        if (simdi - sonKullanim < 4000) {
            return message.reply('Yavaş kanka! 4 saniyede bir yazabilirsin 🛑');
        }
        aiCooldowns.set(message.author.id, simdi);

        try {
            const soru = message.content.replace(/<@!?\d+>/g, '').replace(/<a?:\w+:\d+>/g, '').trim();
            if (!soru) {
                return message.reply('Efendim? Benimle konuşmak için bir şeyler yazabilirsin!');
            }

            await message.channel.sendTyping();
            const data = await geminiCevapAl(soru);

            if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
                const cevap = data.candidates[0].content.parts[0].text;
                if (cevap.length > 2000) {
                    return message.reply(cevap.substring(0, 1900) + '... (Cevap çok uzun)');
                }
                return message.reply(cevap);
            } else {
                return message.reply('Şu an cevabı tam toparlayamadım kanka, tekrar sorar mısın? 🤔');
            }

        } catch (error) {
            if (error.response && error.response.status === 429) {
                return message.reply('Kanka API biraz yoruldu, 15-20 saniye soluklanıp öyle yaz! 😅');
            }
            console.error('Yapay Zeka Hatası Detayı:', error.message);
            return message.reply('API bağlantısında ufak bir takılma oldu kanka, bir daha yazsana!');
        }
    }
});

// --- 5. HOŞ GELDİN (GİRİŞ) DİNLENMESİ ---
client.on('guildMemberAdd', async (member) => {
    try {
        const config = await Hgbb.findOne({ guildId: member.guild.id });
        if (!config || !config.channelId) return;

        const kanal = member.guild.channels.cache.get(config.channelId) || await member.guild.channels.fetch(config.channelId).catch(() => null);
        if (!kanal) return;

        const hgEmbed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('🎉 Aramıza Biri Katıldı!')
            .setDescription(`Hoş geldin ${member}! Seninle birlikte **${member.guild.memberCount}** kişi olduk. 🚀`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        await kanal.send({ embeds: [hgEmbed] });
    } catch (e) {
        console.error('[HGBB GİRİŞ HATASI]', e);
    }
});

// --- 6. BAY BAY (ÇIKIŞ) DİNLENMESİ ---
client.on('guildMemberRemove', async (member) => {
    try {
        const config = await Hgbb.findOne({ guildId: member.guild.id });
        if (!config || !config.channelId) return;

        const kanal = member.guild.channels.cache.get(config.channelId) || await member.guild.channels.fetch(config.channelId).catch(() => null);
        if (!kanal) return;

        const bbEmbed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle('👋 Biri Aramızdan Ayrıldı...')
            .setDescription(`Görüşürüz **${member.user.username}**! Toplam **${member.guild.memberCount}** kişi kaldık. 😢`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        await kanal.send({ embeds: [bbEmbed] });
    } catch (e) {
        console.error('[HGBB ÇIKIŞ HATASI]', e);
    }
});

// --- 7. BOT BAŞLATMA VE AKTİFLİK DURUMU ---
client.once('ready', () => {
    console.log(`\n==================================================`);
    console.log(`[BOT AKTİF] ${client.user.tag} başarıyla başlatıldı!`);
    console.log(`==================================================\n`);

    const durumlar = [
        { name: 'DM\'den gelen soruları dinliyor...', type: ActivityType.Listening },
        { name: 'Minecraft & Roblox oynuyor...', type: ActivityType.Playing },
        { name: 'Sunucudaki sohbeti izliyor...', type: ActivityType.Watching }
    ];

    let index = 0;
    const durumuGuncelle = () => {
        const durum = durumlar[index];
        client.user.setPresence({
            activities: [{ name: durum.name, type: durum.type }],
            status: 'online'
        });
        index = (index + 1) % durumlar.length;
    };

    durumuGuncelle();
    setInterval(durumuGuncelle, 15000);
});

client.login(process.env.TOKEN);
