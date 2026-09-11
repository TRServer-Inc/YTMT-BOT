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

// 3. Mesaj Sayım Modeli
const mesajSayimSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    count: { type: Number, default: 0 }
});
mesajSayimSchema.index({ guildId: 1, userId: 1 }, { unique: true });

// 4. Uyarılar Modeli
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

// 5. YouTube Bildirim Modeli
const ytBildirimSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    ytUrl: { type: String, required: true },
    ytChannelId: { type: String, default: null },
    tip: { type: String, enum: ['video', 'yayin', 'hepsi'], default: 'hepsi' },
    mesaj: { type: String, default: 'Hey @everyone, yeni bir YouTube içeriği yayınlandı!' },
    sonVideoId: { type: String, default: null }
});
ytBildirimSchema.index({ guildId: 1, ytUrl: 1 }, { unique: true });

// Güvenli Model Exportları (Çakışmayı %100 Önler)
const Hgbb = mongoose.models.Hgbb || mongoose.model('Hgbb', hgbbSchema);
const LinkEngel = mongoose.models.LinkEngel || mongoose.model('LinkEngel', linkEngelSchema);
const MesajSayim = mongoose.models.MesajSayim || mongoose.model('MesajSayim', mesajSayimSchema);
const Uyari = mongoose.models.Uyari || mongoose.model('Uyari', uyariSchema);
const YtBildirim = mongoose.models.YtBildirim || mongoose.model('YtBildirim', ytBildirimSchema);

module.exports = { Hgbb, LinkEngel, MesajSayim, Uyari, YtBildirim };
