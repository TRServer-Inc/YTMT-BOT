const express = require('express');
const router = express.Router();

const SECRET_KEY = process.env.CONSOLE_KEY || 'efsanemer123';

// 1. KONSOL ARAYÜZÜ (WEB PANELİ)
router.get('/', (req, res) => {
    const key = req.query.key;

    if (key !== SECRET_KEY) {
        return res.status(403).send(`
            <div style="font-family: Arial; text-align: center; margin-top: 50px; color: #ef4444;">
                <h1>❌ 403 - yetkisiz erişim!</h1>
                <p>geçersiz veya eksik güvenlik anahtarı.</p>
            </div>
        `);
    }

    res.send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ytmt-bot render konsolu</title>
            <style>
                body { background-color: #0f172a; color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: #1e293b; padding: 25px; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5); }
                h1 { color: #38bdf8; text-align: center; font-size: 24px; margin-bottom: 20px; }
                .btn { display: block; width: 100%; padding: 12px; margin: 10px 0; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; text-align: center; text-decoration: none; box-sizing: border-box; transition: 0.2s; }
                .btn-restart { background-color: #f59e0b; color: #fff; }
                .btn-restart:hover { background-color: #d97706; }
                .btn-shutdown { background-color: #ef4444; color: #fff; }
                .btn-shutdown:hover { background-color: #dc2626; }
                .info-box { background: #0f172a; padding: 12px; border-radius: 6px; margin-top: 20px; font-size: 13px; color: #94a3b8; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🎮 ytmt-bot render konsol paneli</h1>
                <p style="text-align: center; color: #cbd5e1; font-size: 14px;">render aboneliği yükseltmeden doğrudan işlem yap!</p>
                
                <a href="/console/action?key=${SECRET_KEY}&cmd=restart" class="btn btn-restart">🔄 botu yeniden başlat (restart)</a>
                <a href="/console/action?key=${SECRET_KEY}&cmd=shutdown" class="btn btn-shutdown">🛑 botu kapat (dokunma modu)</a>

                <div class="info-box">
                    <strong>💡 bilgi:</strong><br>
                    • <b>restart:</b> hatayla sonlandırma sinyali gönderir. render bunu çökme sanıp botu 5-10 sn içinde otomatik tekrar ayağa kaldırır.<br>
                    • <b>shutdown:</b> botun discord bağlantısını ve servislerini tamamen keser, sunucu açık kalsa bile bot pasife geçer.
                </div>
            </div>
        </body>
        </html>
    `);
});

// 2. KOMUT ÇALIŞTIRICI ROUTE
router.get('/action', (req, res) => {
    const { key, cmd } = req.query;

    if (key !== SECRET_KEY) {
        return res.status(403).send('❌ yetkisiz erişim!');
    }

    if (cmd === 'restart') {
        res.send(`
            <body style="background:#0f172a; color:#22c55e; font-family:Arial; text-align:center; padding-top:50px;">
                <h2>🔄 bot yeniden başlatılıyor...</h2>
                <p>render çöktü sanıp 5-10 saniye içinde botu tekrar kaldıracak.</p>
                <script>setTimeout(() => { window.location.href = '/console?key=${SECRET_KEY}'; }, 6000);</script>
            </body>
        `);
        console.log('[KONSOL SİSTEMİ] web üzerinden restart komutu alındı. tetikleniyor...');
        setTimeout(() => process.exit(1), 1000); // exit(1) veriyoruz ki render çöktü sanıp hemen RESTART atsın!
    } 
    else if (cmd === 'shutdown') {
        res.send(`
            <body style="background:#0f172a; color:#ef4444; font-family:Arial; text-align:center; padding-top:50px;">
                <h2>🛑 bot pasife alındı.</h2>
                <p>discord bağlantısı koparıldı. render paneline girmeden bot işlem yapmaz.</p>
            </body>
        `);
        console.log('[KONSOL SİSTEMİ] web üzerinden shutdown komutu alındı.');
        
        // render süreci tamamen öldürmesin (yoksa auto-restart atar), onun yerine discord bot bağlantısını kapatıyoruz
        if (req.app.get('discordClient')) {
            req.app.get('discordClient').destroy();
        } else {
            setTimeout(() => process.exit(0), 1000); // exit(0) olunca bazı durumlar haricinde render yeniden başlatmaz
        }
    } 
    else {
        res.status(400).send('geçersiz komut!');
    }
});

module.exports = router;
