const mongoose = require('mongoose');

// 1. Hgbb (Hoş Geldin - Bay Bay) Modeli
const hgbbSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    channelId: { type: String, required: true }
});

// 2. Link Engel Modeli
const linkEngelSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    durum: { type: Boolean, default: false }
});

// 3. Mesaj Sayım Modeli (mesaj-sayim.json YERİNE)
const mesajSayimSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    count: { type: Number, default: 0 }
});
mesajSayimSchema.index({ guildId: 1, userId: 1 }, { unique: true });

// 4. Uyarılar Modeli (uyarilar.json YERİNE)
const uyariSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    uyarilar: [{
        sebep: String,
        uyaran: String,
        tarih: { type: Date, default: Date.now }
    }]
});
uyariSchema.index({ guildId: 1, userId: 1 }, { unique: true });

// Güvenli model exportları (Çakışmayı önler)
const Hgbb = mongoose.models.Hgbb || mongoose.model('Hgbb', hgbbSchema);
const LinkEngel = mongoose.models.LinkEngel || mongoose.model('LinkEngel', linkEngelSchema);
const MesajSayim = mongoose.models.MesajSayim || mongoose.model('MesajSayim', mesajSayimSchema);
const Uyari = mongoose.models.Uyari || mongoose.model('Uyari', uyariSchema);

module.exports = { Hgbb, LinkEngel, MesajSayim, Uyari };
