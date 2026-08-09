const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

// data klasör kontrolü ve ayar dosyası yolu
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
const logConfigPath = path.join(dataDir, 'log-config.json');

module.exports = {
    name: 'logkur',
    description: 'sunucu log kanalını ayarlar ve tüm log sistemlerini aktifleştirir.',
    
    async execute(message, args, client) {
        // yetki kontrolü
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ bu komutu kullanmak için **yönetici** yetkisine sahip olmalısın!');
        }

        // etiketlenen veya ID'si verilen kanalı al, yoksa komutun yazıldığı kanalı kullan
        const hedefKanal = message.mentions.channels.first() || 
                           message.guild.channels.cache.get(args[0]) || 
                           message.channel;

        if (hedefKanal.type !== ChannelType.GuildText) {
            return message.reply('❌ log kanalı sadece bir **metin kanalı** olabilir!');
        }

        // 1. KANAL AYARINI DOSYAYA KAYDET
        let config = {};
        if (fs.existsSync(logConfigPath)) {
            try {
                config = JSON.parse(fs.readFileSync(logConfigPath, 'utf8'));
            } catch (e) {
                config = {};
            }
        }

        config[message.guild.id] = hedefKanal.id;

        try {
            fs.writeFileSync(logConfigPath, JSON.stringify(config, null, 2));
        } catch (e) {
            console.error('log ayarı kaydedilemedi:', e);
            return message.reply('❌ ayarlar kaydedilirken bir hata oluştu!');
        }

        // 2. LOG YARDIMCI FONKSİYONU
        const logGonder = async (embed) => {
            try {
                await hedefKanal.send({ embeds: [embed] });
            } catch (err) {
                console.error('log mesajı atılamadı:', err);
            }
        };

        // 3. EVENT DİNLENİCİLERİ BAĞLA

        // A. SILINEN MESAJ
        if (!client.listeners('messageDelete').some(l => l._logKur)) {
            const deleteListener = async (deletedMessage) => {
                if (!deletedMessage.guild || deletedMessage.guild.id !== message.guild.id) return;
                if (deletedMessage.author?.bot) return;

                const embed = new EmbedBuilder()
                    .setTitle('🗑️ mesaj silindi')
                    .setColor('#ef4444')
                    .addFields(
                        { name: 'yazan', value: deletedMessage.author ? `${deletedMessage.author.tag} (${deletedMessage.author.id})` : 'bilinmiyor', inline: true },
                        { name: 'kanal', value: `${deletedMessage.channel}`, inline: true },
                        { name: 'içerik', value: deletedMessage.content || 'içerik okunamadı veya görsel/dosya olabilir.' }
                    )
                    .setTimestamp();

                await logGonder(embed);
            };
            deleteListener._logKur = true;
            client.on('messageDelete', deleteListener);
        }

        // B. DÜZENLENEN MESAJ
        if (!client.listeners('messageUpdate').some(l => l._logKur)) {
            const updateListener = async (oldMessage, newMessage) => {
                if (!oldMessage.guild || oldMessage.guild.id !== message.guild.id) return;
                if (oldMessage.author?.bot) return;
                if (oldMessage.content === newMessage.content) return;

                const embed = new EmbedBuilder()
                    .setTitle('✏️ mesaj düzenlendi')
                    .setColor('#eab308')
                    .addFields(
                        { name: 'yazan', value: `${oldMessage.author.tag} (${oldMessage.author.id})`, inline: true },
                        { name: 'kanal', value: `${oldMessage.channel}`, inline: true },
                        { name: 'eski mesaj', value: oldMessage.content || 'yok' },
                        { name: 'yeni mesaj', value: newMessage.content || 'yok' }
                    )
                    .setTimestamp();

                await logGonder(embed);
            };
            updateListener._logKur = true;
            client.on('messageUpdate', updateListener);
        }

        // C. KANAL VE KATEGORİ OLUŞTURULDU
        if (!client.listeners('channelCreate').some(l => l._logKur)) {
            const channelListener = async (createdChannel) => {
                if (!createdChannel.guild || createdChannel.guild.id !== message.guild.id) return;

                const isKategori = createdChannel.type === ChannelType.GuildCategory;

                const embed = new EmbedBuilder()
                    .setTitle(isKategori ? '📁 kategori oluşturuldu' : '📺 kanal oluşturuldu')
                    .setColor('#22c55e')
                    .addFields(
                        { name: isKategori ? 'kategori adı' : 'kanal adı', value: createdChannel.name, inline: true },
                        { name: 'id', value: createdChannel.id, inline: true }
                    )
                    .setTimestamp();

                await logGonder(embed);
            };
            channelListener._logKur = true;
            client.on('channelCreate', channelListener);
        }

        // D. ROL OLUŞTURULDU
        if (!client.listeners('roleCreate').some(l => l._logKur)) {
            const roleListener = async (createdRole) => {
                if (!createdRole.guild || createdRole.guild.id !== message.guild.id) return;

                const embed = new EmbedBuilder()
                    .setTitle('🎭 rol oluşturuldu')
                    .setColor('#3b82f6')
                    .addFields(
                        { name: 'rol adı', value: createdRole.name, inline: true },
                        { name: 'rol id', value: createdRole.id, inline: true },
                        { name: 'renk kodu', value: createdRole.hexColor, inline: true }
                    )
                    .setTimestamp();

                await logGonder(embed);
            };
            roleListener._logKur = true;
            client.on('roleCreate', roleListener);
        }

        // BAŞARILI BİLDİRİMİ
        const basariEmbed = new EmbedBuilder()
            .setTitle('✅ log sistemi kuruldu')
            .setColor('#22c55e')
            .setDescription(`log kanalı başarıyla ${hedefKanal} olarak ayarlandı!`)
            .addFields({
                name: '📋 takip edilen olaylar',
                value: '• silinen mesajlar\n• düzenlenen mesajlar\n• oluşturulan kanallar\n• oluşturulan kategoriler\n• oluşturulan roller'
            })
            .setTimestamp();

        return message.reply({ embeds: [basariEmbed] });
    }
};
