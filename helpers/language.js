const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database.json');

// Kullanıcının kişisel dilini getir (Varsayılan: tr)
function getUserLanguage(userId) {
    if (!fs.existsSync(dbPath)) return 'tr';
    try {
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        return db[userId] || 'tr';
    } catch {
        return 'tr';
    }
}

// Kullanıcının dilini kaydet
function setUserLanguage(userId, lang) {
    let db = {};
    if (fs.existsSync(dbPath)) {
        try {
            db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        } catch {
            db = {};
        }
    }
    db[userId] = lang;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// Tüm Komutlar için Sözlük
const dictionary = {
    tr: {
        no_perm: "❌ bu komutu kullanmak için yetkin yok kanka!",
        lang_changed: "✅ kişisel dilin başarıyla **Türkçe** olarak ayarlandı!",
        lang_usage: "kanka bir dil seçmelisin! Örnek: `y!dil tr` veya `y!dil en`",
        no_target: "kanka kimi etiketleyeceğimi belirtmedin!",
        reg_setup_success: "✅ **kayıt sistemi kurulumu tamamlandı!**",
        reg_success: "✅ {user} kullanıcısı başarıyla **{name}** olarak kayıt edildi!",
        kayit_buton_text: "Kayıt Et",
        modal_title: "Üye Kayıt Formu",
        modal_name: "Kullanıcı Adı",
        modal_age: "Yaş (İsteğe Bağlı)",
        ban_success: "🔨 {user} başarıyla banlandı!",
        help_title: "🤖 YTMTBot | Komut Menüsü",
        help_desc: "Kişisel komut listen aşağıda sıralanmıştır kanka!"
    },
    en: {
        no_perm: "❌ You don't have permission to use this command!",
        lang_changed: "✅ Your personal language has been set to **English**!",
        lang_usage: "You must specify a language! Example: `y!dil tr` or `y!dil en`",
        no_target: "You didn't specify a user!",
        reg_setup_success: "✅ **Registration system setup completed!**",
        reg_success: "✅ User {user} was successfully registered as **{name}**!",
        kayit_buton_text: "Register Member",
        modal_title: "User Registration Form",
        modal_name: "Username",
        modal_age: "Age (Optional)",
        ban_success: "🔨 {user} has been successfully banned!",
        help_title: "🤖 YTMTBot | Command Menu",
        help_desc: "Here is your personal command list!"
    }
};

function getText(userId, key, replacements = {}) {
    const lang = getUserLanguage(userId);
    let text = dictionary[lang]?.[key] || dictionary['tr'][key] || key;
    
    for (const [placeholder, value] of Object.entries(replacements)) {
        text = text.replace(`{${placeholder}}`, value);
    }
    return text;
}

module.exports = { getUserLanguage, setUserLanguage, getText };
