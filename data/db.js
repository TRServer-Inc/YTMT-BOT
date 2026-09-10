const mongoose = require('mongoose');

const hgbbSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    channelId: { type: String, required: true }
});

const Hgbb = mongoose.model('Hgbb', hgbbSchema);

async function connectDB() {
    if (!process.env.MONGO_URI) {
        console.error('[DATABASE HATA] MONGO_URI bulunamadı!');
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('[DATABASE] MongoDB bağlantısı kuruldu! 🎉');
    } catch (err) {
        console.error('[DATABASE HATA]', err.message);
    }
}

module.exports = { connectDB, Hgbb };
