const express = require('express');
const cors = require('cors');

const app = express();
const consoleRouter = require('./console.js');
app.use('/console', consoleRouter);
// github pages ve yerel testler için cors izni
app.use(cors({
  origin: ['https://trserver-inc.github.io', 'http://localhost:3000']
}));

app.use(express.json());

// ana sayfa ve ping kontrol rotası (cron-job.org buraya ping atacak)
app.get('/', (req, res) => {
  res.status(200).send('ytmt-bot sunucusu 7/24 aktif ve çalışıyor!');
});

// github dashboard için bot durumunu dönen api rotası
app.get('/api/stats', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// render.com port ayarı (varsayılan 10000)
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`[SUNUCU] Web servisi ${PORT} portunda başarıyla başlatıldı.`);
});
