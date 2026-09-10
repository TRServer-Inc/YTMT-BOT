const mongoose = require('mongoose');

// Hgbb Şeması ve Modeli (Tekrar derlemeyi önler)
const hgbbSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    channelId: { type: String, required: true }
});
const Hgbb = mongoose.models.Hgbb || mongoose.model('Hgbb', hgbbSchema);

// Link Engel Şeması ve Modeli (Tekrar derlemeyi önler)
const linkEngelSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    durum: { type: Boolean, default: false }
});
const LinkEngel = mongoose.models.LinkEngel || mongoose.model('LinkEngel', linkEngelSchema);

module.exports = { Hgbb, LinkEngel };
