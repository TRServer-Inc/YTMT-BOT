const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database.json');

// kullanıcının dilini çek (varsayılan: tr)
function getUserLanguage(userId) {
    if (!fs.existsSync(dbPath)) return 'tr';
    try {
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        return db[userId] || 'tr';
    } catch {
        return 'tr';
    }
}

// kullanıcının seçtiği dili kaydet
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

// FULL DİL SÖZLÜĞÜ
const dictionary = {
    tr: {
        no_perm: "❌ bu komutu kullanmak için gerekli yetkiye sahip değilsin!",
        bot_no_perm: "❌ botun bu işlemi gerçekleştirmek için yetkisi yetersiz!",
        user_not_found: "❌ belirtilen kullanıcı bulunamadı!",
        
        lang_usage: "kanka geçerli bir dil seçmelisin! Kullanım: `y!dil tr` veya `y!dil en`",
        lang_changed: "✅ kişisel dilin başarıyla **Türkçe** olarak ayarlandı!",

        help_title: "🤖 YTMTBot | Komut Menüsü",
        help_desc: "Aşağıda senin diline özel hazırlanan tüm komut listesi bulunmaktadır kanka:",
        help_cmd_lang: "`y!dil <tr/en>` - Botun sana özel dilini değiştirir.",
        help_cmd_reg_setup: "`y!kayıt-kurulum` - Butonlu kayıt sistemini kurar.",
        help_cmd_reg: "`y!kayıt @üye Ad Yaş` - Üyeyi manuel kayıt eder.",
        help_cmd_ban_setup: "`y!ban-kurulum` - Ban koruma sistemini kurar.",
        help_footer: "YTMTBot • Gelişmiş Discord Botu",

        reg_setup_title: "⚙️ Kayıt Sistemi Kurulumu",
        reg_setup_desc: "Kayıt sistemi otomatik olarak kuruldu!\n\n**Aşağıdaki butona basarak kayıt olabilirsiniz.**",
        reg_btn_label: "Kayıt Ol",
        reg_modal_title: "Kayıt Formu",
        reg_modal_name: "Adınız",
        reg_modal_age: "Yaşınız",
        reg_success: "✅ {user} kullanıcısı başarıyla **{name}** olarak kayıt edildi!"
    },
    en: {
        no_perm: "❌ You do not have the required permissions to use this command!",
        bot_no_perm: "❌ The bot does not have sufficient permissions!",
        user_not_found: "❌ Specified user could not be found!",

        lang_usage: "You must choose a valid language! Usage: `y!dil tr` or `y!dil en`",
        lang_changed: "✅ Your personal language has been successfully set to **English**!",

        help_title: "🤖 YTMTBot | Command Menu",
        help_desc: "Here is the list of commands tailored to your personal language:",
        help_cmd_lang: "`y!dil <tr/en>` - Changes the bot's language specifically for you.",
        help_cmd_reg_setup: "`y!kayıt-kurulum` - Sets up the registration system.",
        help_cmd_reg: "`y!kayıt @user Name Age` - Manually registers a user.",
        help_cmd_ban_setup: "`y!ban-kurulum` - Sets up the ban protection system.",
        help_footer: "YTMTBot • Advanced Discord Bot",

        reg_setup_title: "⚙️ Registration System Setup",
        reg_setup_desc: "Registration system configured successfully!\n\n**Click the button below to register.**",
        reg_btn_label: "Register Now",
        reg_modal_title: "Registration Form",
        reg_modal_name: "Your Name",
        reg_modal_age: "Your Age",
        reg_success: "✅ User {user} was successfully registered as **{name}**!"
    }
};

function getText(userId, key, replacements = {}) {
    const lang = getUserLanguage(userId);
    let text = dictionary[lang]?.[key] || dictionary['tr'][key] || key;
    
    for (const [placeholder, value] of Object.entries(replacements)) {
        text = text.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), value);
    }
    return text;
}

module.exports = { getUserLanguage, setUserLanguage, getText };
