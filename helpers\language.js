const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database.json');

// Sunucunun dilini getir
function getLanguage(guildId) {
    if (!fs.existsSync(dbPath)) return 'tr';
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    return db[guildId] || 'tr';
}

// Sunucunun dilini ayarla
function setLanguage(guildId, lang) {
    let db = {};
    if (fs.existsSync(dbPath)) {
        db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    }
    db[guildId] = lang;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// Sözlük
const dictionary = {
    tr: {
        no_perm: "❌ bu komutu kullanmak için yetkin yok kanka!",
        lang_changed: "✅ sunucu dili başarıyla **Türkçe** olarak ayarlandı!",
        reg_setup_success: "✅ **kayıt sistemi kurulumu tamamlandı!**",
        reg_success: "✅ {user} kullanıcısı başarıyla **{name}** olarak kayıt edildi!",
        ban_setup_success: "✅ **ban sistemi kurulumu tamamlandı!**",
        help_title: "🤖 YTMTBot | Komut Menüsü",
        help_desc: "Aşağıda sunucuda kullanabileceğin tüm güncel komutlar listelenmiştir kanka!"
    },
    en: {
        no_perm: "❌ You don't have permission to use this command!",
        lang_changed: "✅ Server language successfully set to **English**!",
        reg_setup_success: "✅ **Registration system setup complete!**",
        reg_success: "✅ User {user} has been successfully registered as **{name}**!",
        ban_setup_success: "✅ **Ban system setup complete!**",
        help_title: "🤖 YTMTBot | Command Menu",
        help_desc: "Here is the list of all active commands you can use on this server!"
    }
};

function getText(guildId, key, replacements = {}) {
    const lang = getLanguage(guildId);
    let text = dictionary[lang][key] || dictionary['tr'][key] || key;
    
    for (const [placeholder, value] of Object.entries(replacements)) {
        text = text.replace(`{${placeholder}}`, value);
    }
    return text;
}

module.exports = { getLanguage, setLanguage, getText };
