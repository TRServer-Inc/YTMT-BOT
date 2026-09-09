const { Client, GatewayIntentBits, Partials, Collection, ActivityType, EmbedBuilder } = require('discord.js');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// --- 1. BOT KURULUMU VE INTENTLER ---
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

// SERVER VE CONSOLE PANELİ BAGLANTISI
const app = require('./server.js');
app.set('discordClient', client);

client.commands = new Collection();
const aiCooldowns = new Map();

// --- DATA KLASÖRÜ KONTROLÜ VE OLUŞTURMA ---
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// --- 2. AYAR DOSYALARI VE HAFIZA HAZIRLIĞI ---
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

const hgbbConfigPath = path.join(dataDir, 'hgbb-config.json');
const linkEngelConfigPath = path.join(dataDir, 'linkengel-config.json');

// --- MESAJ SAYACI VERİTABANI HAFIZASI ---
const mesajDataPath = path.join(dataDir, 'mesaj-data.json');
let mesajData = {};

if (fs.existsSync(mesajDataPath)) {
    try {
        mesajData = JSON.parse(fs.readFileSync(mesajDataPath, 'utf8'));
    } catch (e) {
        mesajData = {};
    }
}

function mesajKaydet(guildId, userId) {
    const bugun = new Date();
    const d = new Date(Date.UTC(bugun.getFullYear(), bugun.getMonth(), bugun.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    const haftaKey = `${d.getUTCFullYear()}-${weekNo}`;

    if (!mesajData[guildId]) mesajData[guildId] = {};
    if (!mesajData[guildId][userId]) mesajData[guildId][userId] = { toplam: 0, haftalik: {} };

    mesajData[guildId][userId].toplam = (mesajData[guildId][userId].toplam || 0) + 1;

    if (!mesajData[guildId][userId].haftalik) mesajData[guildId][userId].haftalik = {};
    mesajData[guildId][userId].haftalik[haftaKey] = (mesajData[guildId][userId].haftalik[haftaKey] || 0) + 1;

    fs.writeFileSync(mesajDataPath, JSON.stringify(mesajData, null, 2));
}

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

    if (message.guild) {
        mesajKaydet(message.guild.id, message.author.id);
    }

    const afkCommand = client.commands.get('afk');
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
                .setDescription(`tekrardan hoş geldin **${message.author.username}**!\nartık **AFK** değilsin.`)
                .setFooter({ text: 'afk modundan çıkarıldın.' });

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
                        .setDescription(`etiketlediğin **${user.username}** şu an AFK!\n\n**Sebep:** ${bilgi.sebep}\n**Süre:** ${dk > 0 ? `${dk} dakika önce` : 'az önce'} afk oldu.`);

                    message.reply({ embeds: [afkUyariEmbed] });
                }
            });
        }
    }

    if (!message.guild) {
        const simdi = Date.now();
        const sonKullanim = aiCooldowns.get(message.author.id) || 0;
        if (simdi - sonKullanim < 4000) {
            return message.reply('yavaş kanka! 4 saniyede bir yazabilirsin 🛑');
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
                return message.reply('kanka api biraz yoruldu, 15-20 saniye soluklanıp öyle yaz! 😅');
            }
            console.error('DM Yapay Zeka Hatası:', error.message);
            return message.reply('API bağlantısında ufak bir takılma oldu kanka, bir daha yazsana!');
        }
    }

    const hamKucuk = hamMesaj.toLowerCase();

    if (hamKucuk.startsWith('y!')) {
        const args = hamMesaj.slice(2).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName);
        if (command && typeof command.execute === 'function') {
            try {
                return await command.execute(message, args, client);
            } catch (error) {
                console.error(`${commandName} çalışırken hata:`, error);
                return message.reply('Komut çalıştırılırken bir hata oluştu!');
            }
        }
    }

    if (hamKucuk === 'sa' || hamKucuk === 's.a' || hamKucuk === 'selamun aleyküm' || hamKucuk === 'selamün aleyküm') {
        return message.reply('Aleyküm Selam, hoş geldin!');
    }

    // --- CAPS LOCK ENGELLEYİCİ (5 VEYA DAHA FAZLA BÜYÜK HARF) ---
    const buyukHarfSayisi = (hamMesaj.match(/[A-ZÇĞİÖŞÜ]/g) || []).length;
    if (buyukHarfSayisi >= 5) {
        try {
            await message.delete();
            const capsUyari = await message.channel.send(`yavaş caps yasak ${message.author.username}`);
            setTimeout(() => capsUyari.delete().catch(() => {}), 5000);
            return;
        } catch (e) {
            console.error('[CAPS SILMA HATASI] Botun mesaj silme yetkisi yok!', e.message);
        }
    }

    if (fs.existsSync(linkEngelConfigPath)) {
        try {
            const linkConfig = JSON.parse(fs.readFileSync(linkEngelConfigPath, 'utf8'));
            const sistemAcikMi = linkConfig[message.guild.id];
            const yoneticiMi = message.member && message.member.permissions.has('Administrator');

            if (sistemAcikMi && !yoneticiMi) {
                const linkRegex = /(https?:\/\/|www\.|discord\.gg|discord\.com\/invite|[a-zA-Z0-9-]+\.(com|net|org|xyz|tk|ml|ga|cf|gq|site|online|store|io|me|tv|co))/i;

                if (linkRegex.test(hamMesaj)) {
                    await message.delete().catch(() => {});
                    const uyari = await message.channel.send(`⚠️ ${message.author}, bu sunucuda **link/reklam** paylaşımı yasaktır!`);
                    setTimeout(() => uyari.delete().catch(() => {}), 5000);
                    return;
                }
            }
        } catch (e) {
            console.error('Link engel kontrol hatası:', e);
        }
    }

    // --- HASSAS KÜFÜR ENGELLEYİCİ (KELİME İÇİ YANLIŞ POZİTİF KORUMALI) ---
    if (kufurlerListesi.length > 0) {
        const normMesaj = metniNormalizeEt(hamMesaj);
        
        // Noktalama ve sembolleri boşluğa çevirerek sansürlü/noktalı yazımları ayırıyoruz
        const temizlenmisNoktalama = normMesaj.replace(/[^a-z0-9\s]/g, ' ');

        const kufurVarMi = kufurlerListesi.some(kufur => {
            if (typeof kufur !== 'string') return false;
            const normKufur = metniNormalizeEt(kufur.trim());
            if (!normKufur) return false;

            // Kelime sınırları (\b) kullanarak kelime içi eşleşmeleri engelliyoruz
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
                console.error('[KÜFÜR SILMA HATASI] Botun mesaj silme yetkisi yok! Hata:', error.message);
            }
        }
    }

    const botEtiketlendiMi = message.mentions.has(client.user) && !message.mentions.everyone;
    const botaYanitVerildiMi = message.reference && message.referencedMessage && message.referencedMessage.author.id === client.user.id;

    if (botEtiketlendiMi || botaYanitVerildiMi) {
        if (hamKucuk.startsWith('y!')) return;

        const simdi = Date.now();
        const sonKullanim = aiCooldowns.get(message.author.id) || 0;
        if (simdi - sonKullanim < 4000) {
            return message.reply('yavaş kanka! 4 saniyede bir yazabilirsin 🛑');
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
                return message.reply('kanka api biraz yoruldu, 15-20 saniye soluklanıp öyle yaz! 😅');
            }
            console.error('Yapay Zeka Hatası Detayı:', error.message);
            return message.reply('API bağlantısında ufak bir takılma oldu kanka, bir daha yazsana!');
        }
    }
});

// --- 5. KURAL KABUL BUTON DİNLEYİCİSİ ---
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'kural_kabul') {
        const uyeRolu = interaction.guild.roles.cache.find(role => role.name === 'Üye' || role.name === 'Uye');
        
        if (uyeRolu) {
            try {
                await interaction.member.roles.add(uyeRolu);
                return interaction.reply({ 
                    content: '🎉 **Kuralları başarıyla kabul ettiniz!** Sunucumuza hoş geldiniz, keyifli vakit geçirmeniz dileğiyle!', 
                    ephemeral: true 
                });
            } catch (err) {
                console.error('Rol verme hatası:', err);
                return interaction.reply({ 
                    content: '❌ Rol verilirken bir hata oluştu, lütfen yetkililere bildirin!', 
                    ephemeral: true 
                });
            }
        } else {
            return interaction.reply({ 
                content: '🎉 **Kuralları başarıyla kabul ettiniz!** (Not: Sunucuda "Üye" adında bir rol bulunamadı.)', 
                ephemeral: true 
            });
        }
    }
});

// --- 6. HOŞ GELDİN MESAJI (GİRİŞ) ---
client.on('guildMemberAdd', async (member) => {
    console.log(`[GİRİŞ BİLDİRİMİ] ${member.user.tag} sunucuya katıldı.`);
    if (!fs.existsSync(hgbbConfigPath)) return;
    try {
        const config = JSON.parse(fs.readFileSync(hgbbConfigPath, 'utf8'));
        const kanalId = config[member.guild.id];
        if (!kanalId) return;

        const kanal = await member.guild.channels.fetch(kanalId).catch(() => null);
        if (!kanal) return;

        const hgEmbed = {
            color: 0x2ecc71,
            title: '🎉 Aramıza Biri Katıldı!',
            description: `Hoş geldin ${member}! Seninle birlikte **${member.guild.memberCount}** kişi olduk. 🚀`,
            thumbnail: { url: member.user.displayAvatarURL({ dynamic: true }) },
            timestamp: new Date()
        };

        await kanal.send({ embeds: [hgEmbed] });
    } catch (e) {
        console.error('hg mesajı gönderme hatası:', e);
    }
});

// --- 7. BAY BAY MESAJI (ÇIKIŞ) ---
client.on('guildMemberRemove', async (member) => {
    console.log(`[ÇIKIŞ BİLDİRİMİ] ${member.user.tag} sunucudan ayrıldı.`);
    if (!fs.existsSync(hgbbConfigPath)) return;
    try {
        const config = JSON.parse(fs.readFileSync(hgbbConfigPath, 'utf8'));
        const kanalId = config[member.guild.id];
        if (!kanalId) return;

        const kanal = await member.guild.channels.fetch(kanalId).catch(() => null);
        if (!kanal) return;

        const bbEmbed = {
            color: 0xe74c3c,
            title: '👋 Biri Aramızdan Ayrıldı...',
            description: `Görüşürüz **${member.user.username}**! Toplam **${member.guild.memberCount}** kişi kaldık. 😢`,
            thumbnail: { url: member.user.displayAvatarURL({ dynamic: true }) },
            timestamp: new Date()
        };

        await kanal.send({ embeds: [bbEmbed] });
    } catch (e) {
        console.error('bb mesajı gönderme hatası:', e);
    }
});

// --- 8. BOT GİRİŞ VE DİNAMİK DURUM (PRESENCE) AYARI ---
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
