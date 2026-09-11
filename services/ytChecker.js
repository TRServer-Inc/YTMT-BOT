const axios = require('axios');
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
    // 3 dakikada bir otomatik kontrol eder
    setInterval(async () => {
        try {
            const kayitlar = await YtBildirim.find({});
            if (!kayitlar || kayitlar.length === 0) return;

            for (const kayit of kayitlar) {
                let channelId = kayit.ytChannelId;

                if (!channelId) {
                    channelId = await getChannelIdFromUrl(kayit.ytUrl);
                    if (channelId) {
                        kayit.ytChannelId = channelId;
                        await kayit.save();
                    } else {
                        continue;
                    }
                }

                // YouTube RSS verisini axios ile çekiyoruz
                const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
                const response = await axios.get(feedUrl, { timeout: 5000 }).catch(() => null);

                if (!response || !response.data) continue;

                const xmlData = response.data;

                // Regex ile XML Ayrıştırma (Paketsiz)
                const videoIdMatch = xmlData.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
                const titleMatch = xmlData.match(/<title>(.*?)<\/title>/g);
                const linkMatch = xmlData.match(/<link rel="alternate" href="(.*?)"\/>/);

                if (!videoIdMatch || !titleMatch || titleMatch.length < 2) continue;

                const videoId = videoIdMatch[1];
                const videoTitle = titleMatch[1].replace('<title>', '').replace('</title>', '');
                const videoLink = linkMatch ? linkMatch[1] : `https://www.youtube.com/watch?v=${videoId}`;

                // Eğer bu video zaten atıldıysa pas geç
                if (kayit.sonVideoId === videoId) continue;

                const discordKanal = client.channels.cache.get(kayit.channelId);
                if (!discordKanal) continue;

                const isLive = videoTitle.toLowerCase().includes('canlı') || videoTitle.toLowerCase().includes('live');

                if (kayit.tip === 'video' && isLive) continue;
                if (kayit.tip === 'yayin' && !isLive) continue;

                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle(videoTitle)
                    .setURL(videoLink)
                    .setImage(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`)
                    .setTimestamp();

                await discordKanal.send({ content: kayit.mesaj, embeds: [embed] });

                // Son videoyu veritabanına kaydet
                kayit.sonVideoId = videoId;
                await kayit.save();
            }
        } catch (err) {
            console.error('[YT CHECKER HATA]:', err);
        }
    }, 180000);
}

module.exports = { startYtChecker };
