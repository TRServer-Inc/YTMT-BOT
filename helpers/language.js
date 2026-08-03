const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database.json');

const trTR = require('../locales/tr-TR');
const enEN = require('../locales/en-EN');

const languages = {
    tr: trTR,
    en: enEN
};

function getUserLanguage(userId) {
    if (!fs.existsSync(dbPath)) return 'tr';
    try {
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        return db[userId] || 'tr';
    } catch {
        return 'tr';
    }
}

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

// Çeviriyi alır ve dynamic değişkenleri {user}, {role} vb. yerine koyar
function getText(userId, key, replacements = {}) {
    const lang = getUserLanguage(userId);
    const langData = languages[lang] || languages['tr'];
    let text = langData[key] || languages['tr'][key] || key;

    for (const [placeholder, value] of Object.entries(replacements)) {
        text = text.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), value);
    }
    return text;
}

module.exports = { getUserLanguage, setUserLanguage, getText };
