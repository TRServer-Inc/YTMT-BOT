const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'kayıt',
    description: 'Kullanıcıyı manuel olarak kayıt eder. Örn: y!kayıt @üye Ahsen 18',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageNicknames) && !message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ bu komutu kullanmak için yetkin yok kanka!');
        }

        const hedef = message.mentions.members.first();
        if (!hedef) {
            return message.reply('kanka kimi kayıt edeceğimi etiketlemedin! Örnek: `y!kayıt @üye Ad [Yaş]`');
        }

        const ad = args[1];
        const yas = args[2];

        if (!ad) {
            return message.reply('lütfen bir isim belirt kanka!');
        }

        const kayitsizRolu = message.guild.roles.cache.find(r => r.name === 'Kayıtsız');
        const kayitliRolu = message.guild.roles.cache.find(r => r.name === 'Kayıtlı');

        if (!kayitliRolu) {
            return message.reply('❌ **Kayıtlı** rolü bulunamadı! Lütfen önce `y!kayıt-kurulum #kanal` çalıştır.');
        }

        try {
            const yeniIsim = yas ? `${ad} | ${yas}` : `${ad}`;
            await hedef.setNickname(yeniIsim).catch(() => {});

            if (kayitsizRolu && hedef.roles.cache.has(kayitsizRolu.id)) {
                await hedef.roles.remove(kayitsizRolu);
            }
            await hedef.roles.add(kayitliRolu);

            const basariEmbed = {
                color: 0x2ecc71,
                title: '🎉 Kullanıcı Kayıt Edildi',
                description: `${hedef} başarıyla kayıt edildi!`,
                fields: [
                    { name: '👤 Kayıt Edilen:', value: `${hedef.user.tag}`, inline: true },
                    { name: '📝 Yeni İsim:', value: `\`${yeniIsim}\``, inline: true },
                    { name: '🛡️ Kayıt Eden:', value: `${message.author.tag}`, inline: true }
                ],
                timestamp: new Date()
            };

            return message.channel.send({ embeds: [basariEmbed] });

        } catch (error) {
            console.error('Kayıt hatası:', error);
            return message.reply('Kayıt yapılırken bir hata oluştu!');
        }
    }
};
