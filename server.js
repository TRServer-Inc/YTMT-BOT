const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.status(200).send('ytmt-bot aktif!');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HTTP] Sunucu ${PORT} portunda aktif!`);
});
