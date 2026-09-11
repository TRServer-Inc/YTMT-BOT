const Parser = require('rss-parser');
const axios = require('axios');
const parser = new Parser();
const { YtBildirim } = require('../data/db.js');
const { EmbedBuilder } = require('discord.js');

async function getChannelIdFromUrl(url) {
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        const match = response.data.match(/https:\/\/www\.youtube\.com\/channel\/(UC[\w-]{22})/);
        if (match && match[1]) return match[1];

        const matchMeta = response.data.match(/itemprop="channelId" content="(UC[\w-]{22})"/);
        if (matchMeta && matchMeta[1]) return matchMeta[1];
    } catch (e) {
        console.error('[YT CHANNEL ID BULMA HATA]:', e.message);
    }
    return null;
}

function startYtChecker(client) {
    // Her 3 dakikada bir kontrol eder (180000 ms)
    setInterval(async () => {
        try {
            const kayitlar = await YtBildirim.find({});
            if (!kayitlar || kayitlar.length === 0) return;

            for (const kayit of kayitlar) {
                let channelId = kayit.ytChannelId;

                // Kanal ID veritabanında yoksa URL'den otomatik çekip kaydeder
                if (!channelId) {
                    channelId = await getChannelIdFromUrl(kayit.ytUrl);
                    if (channelId) {
                        kayit.ytChannelId = channelId;
                        await kayit.save();
                    } else {
                        continue;
                    }
                }

                // YouTube RSS Beslemesi
                const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
                const feed = await parser.parseURL(feedUrl).catch(() => null);

                if (!feed || !feed.items || feed.items.length === 0) continue;

                const sonIcerik = feed.items[0]; // En son yüklenen içerik
                const videoId = sonIcerik.id.replace('yt:video:', '');

                // Eğer zaten bildirim atılmış bir video ise atla
                if (kayit.sonVideoId === videoId) continue;

                const discordKanal = client.channels.cache.get(kayit.channelId);
                if (!discordKanal) continue;

                const isLive = sonIcerik.link.includes('live') || (sonIcerik.title && sonIcerik.title.toLowerCase().includes('canlı'));

                // Bildirim Tipi Filtresi
                if (kayit.tip === 'video' && isLive) continue;
                if (kayit.tip === 'yayin' && !isLive) continue;

                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle(sonIcerik.title)
                    .setURL(sonIcerik.link)
                    .setAuthor({ name: sonIcerik.author || 'YouTube' })
                    .setImage(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`)
                    .setTimestamp(new Date(sonIcerik.pubDate));

                await discordKanal.send({ content: kayit.mesaj, embeds: [embed] });

                // Son bildirimi veritabanına kaydet ki tekrar atmasın
                kayit.sonVideoId = videoId;
                await kayit.save();
            }
        } catch (err) {
            console.error('[YT CHECKER HATA]:', err);
        }
    }, 180000); 
}

module.exports = { startYtChecker };
