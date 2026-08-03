const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('./server.js');
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

client.commands = new Collection();
const aiCooldowns = new Map(); // Yapay Zeka Cooldown (Spam Engelleme)

// --- 2. AYAR DOSYALARI VE KÜFÜR LİSTESİ HAZIRLIĞI ---
const kufurlerPath = path.join(process.cwd(), 'kufurler.json');
let kufurlerListesi = [];

try {
    if (fs.existsSync(kufurlerPath)) {
        kufurlerListesi = JSON.parse(fs.readFileSync(kufurlerPath, 'utf8'));
        console.log('[SİSTEM] Küfür listesi başarıyla hafızaya yüklendi.');
    } else {
        console.log('[SİSTEM] kufurler.json bulunamadı, boş liste başlatılıyor.');
    }
} catch (e) {
    console.error('[HATA] kufurler.json okunurken bir sorun oluştu:', e);
}

const hgbbConfigPath = path.join(process.cwd(), 'hgbb-config.json');
const linkEngelConfigPath = path.join(process.cwd(), 'linkengel-config.json');

// --- 3. KOMUT YÜKLEYİCİ (MODÜLER) ---
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if (command.name && typeof command.execute === 'function') {
            client.commands.set(command.name, command);
            console.log(`[KOMUT YÜKLENDİ] ${command.name}`);
        } else {
            console.log(`[UYARI] ${file} geçerli bir komut yapısına sahip değil.`);
        }
    }
}

// --- 4. EVENT YÜKLEYİCİ (MODÜLER) ---
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        const eventName = file.split('.')[0];
        
        if (event.once) {
            client.once(eventName, (...args) => event.execute(...args, client));
        } else {
            client.on(eventName, (...args) => event.execute(...args, client));
        }
        console.log(`[EVENT YÜKLENDİ] ${eventName}`);
    }
}

// --- YAPAY ZEKA SORGULAMA FONKSİYONU ---
async function geminiCevapAl(soru) {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const bodyPayload = {
        system_instruction: {
            parts: [
                { text: "sen cana yakın, esprili, roblox ve minecraft oyunlarını çok iyi bilen fırlama bir discord botusun. lafı uzatmadan, kendini tekrar etmeden direkt olarak net, emojili ve kısa bir cevap ver. her zaman küçük harflerle yaz." }
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
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 15000
    });

    return response.data;
}

// --- 5. MERKEZÎ MESAJ DİNLEYİCİSİ VE SİSTEMLER ---
client.on('messageCreate', async (message) => {
    // Botların kendi mesajlarını ve boş mesajları yoksay
    if (message.author.bot) return;

    const hamMesaj = message.content ? message.content.trim() : "";
    if (!hamMesaj) return;

    // ==========================================
    // SİSTEM 0: DM İÇİ YAPAY ZEKA SOHBETİ
    // ==========================================
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
                return message.reply('şu an cevabı tam toparlayamadım kanka, tekrar sorar mısın? 🤔');
            }
        } catch (error) {
            if (error.response && error.response.status === 429) {
                return message.reply('kanka yapay zeka azıcık beklemeni söylüyor, daha sonra yaz!');
            }
            console.error('DM Yapay Zeka Hatası:', error.message);
            return message.reply('kanka kafam karıştı, daha sonra yazar mısın?');
        }
    }

    // ==========================================
    // SUNUCU İÇİ İŞLEMLER VE KONTROLLER
    // ==========================================
    const temizMetin = hamMesaj.replace(/I/g, 'i').replace(/İ/g, 'i').toLowerCase();

    // ==========================================
    // SİSTEM A: SELAMLAMA ("SA") TESPİTİ
    // ==========================================
    if (temizMetin === 'sa' || temizMetin === 's.a' || temizMetin === 'selamun aleyküm' || temizMetin === 'selamün aleyküm') {
        return message.reply('Aleyküm Selam, hoş geldin!');
    }

    // ==========================================
    // SİSTEM B: REKLAM / LINK ENGELLEYİCİ
    // ==========================================
    if (fs.existsSync(linkEngelConfigPath)) {
        try {
            const linkConfig = JSON.parse(fs.readFileSync(linkEngelConfigPath, 'utf8'));
            const sistemAcikMi = linkConfig[message.guild.id];

            // Kullanıcı yönetici yetkisine sahip mi kontrol et
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

    // ==========================================
    // SİSTEM C: KÜFÜR VE ARGO ENGELLEYİCİ
    // ==========================================
    const kelimeler = temizMetin.split(/\s+/);
    const duzlesmisMesaj = temizMetin.replace(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ]/g, '');

    const iceriyorMu = kufurlerListesi.some(kufur => {
        const temizKufur = kufur.toLowerCase().trim();
        if (!temizKufur) return false;
        
        return kelimeler.includes(temizKufur) || (temizKufur.length > 3 && (temizMetin.includes(temizKufur) || duzlesmisMesaj.includes(temizKufur)));
    });

    if (iceriyorMu) {
        try {
            await message.delete().catch(() => {});
            
            const rastgeleRenk = Math.floor(Math.random() * 16777215);
            const uyariEmbed = {
                color: rastgeleRenk,
                title: '🚫 Küfür Yasak!',
                description: `${message.author}, bu sunucuda küfür veya argo kullanımı yasaktır!`,
                thumbnail: {
                    url: 'https://cdn.discordapp.com/emojis/776713577452273706.png?v=1'
                },
                footer: {
                    text: `${message.author.username} uyarıldı.`,
                    icon_url: message.author.displayAvatarURL({ dynamic: true })
                },
                timestamp: new Date().toISOString()
            };

            const uyariMesaji = await message.channel.send({
                embeds: [uyariEmbed],
                allowedMentions: { repliedUser: false }
            });

            setTimeout(() => {
                uyariMesaji.delete().catch(() => {});
            }, 5000);

            return;
        } catch (error) {
            console.error('Mesaj silme yetki hatası:', error);
        }
    }

    // ==========================================
    // SİSTEM D: "y!" ÖN TAKILI KOMUT ALGILAYICI
    // ==========================================
    if (hamMesaj.toLowerCase().startsWith('y!')) {
        const args = hamMesaj.split(/ +/);
        const commandName = args[0].toLowerCase();

        const command = client.commands.get(commandName);
        if (command && typeof command.execute === 'function') {
            try {
                return await command.execute(message, args.slice(1), client);
            } catch (error) {
                console.error(`${commandName} çalıştırılırken bir hata oluştu:`, error);
                return message.reply('komut çalıştırılırken sunucuda bir hata meydana geldi!');
            }
        }
    }

    // ==========================================
    // SİSTEM E: BOTU ETİKETLEME VEYA YANITLAMA (YAPAY ZEKA)
    // ==========================================
    const botEtiketlendiMi = message.mentions.has(client.user) && !message.mentions.everyone;
    const botaYanitVerildiMi = message.reference && message.referencedMessage && message.referencedMessage.author.id === client.user.id;

    if (botEtiketlendiMi || botaYanitVerildiMi) {
        if (hamMesaj.toLowerCase().startsWith('y!')) return;

        const simdi = Date.now();
        const sonKullanim = aiCooldowns.get(message.author.id) || 0;
        if (simdi - sonKullanim < 4000) {
            return message.reply('yavaş kanka! 4 saniyede bir yazabilirsin 🛑');
        }
        aiCooldowns.set(message.author.id, simdi);

        try {
            const soru = message.content
                .replace(/<@!?\d+>/g, '')
                .replace(/<a?:\w+:\d+>/g, '')
                .trim();

            if (!soru) {
                return message.reply('efendim? benimle konuşmak için bir şeyler yazabilirsin!');
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
                return message.reply('şu an cevabı tam toparlayamadım kanka, tekrar sorar mısın? 🤔');
            }

        } catch (error) {
            if (error.response && error.response.status === 429) {
                return message.reply('kanka api biraz yoruldu, 15-20 saniye soluklanıp öyle yaz! 😅');
            }
            console.error('Yapay Zeka Hatası Detayı:', error.message);
            return message.reply('api bağlantısında ufak bir takılma oldu kanka, bir daha yazsana!');
        }
    }
});

// --- 6. BOT GİRİŞİ ---
client.login(process.env.TOKEN);
