module.exports = {
    name: 'rolekle',
    async execute(message, args, client) {
        if (message.author.id !== message.guild.ownerId) return message.reply('Üzgünüm. Sunucu Sahibi değilsin.');

        try {
            const bilgiMesajı = await message.reply('Roller oluşturuluyor... ⏳');
            const roller = [
                { name: '👤|Kurucu', color: '#BC2E25', hoist: true, mentionable: false },
                { name: '👥️|Süper Adminler', color: '#C89E00', hoist: true, mentionable: true },
                { name: '|Adminler', color: '#71368A', hoist: true, mentionable: true },
                { name: '🧑‍🎓|Deneme Admin', color: '#BF0044', hoist: true, mentionable: false },
                { name: '💪|Destek Rehber', color: '#880031', hoist: true, mentionable: false },
                { name: '👤|Emektar', color: '#501C67', hoist: false, mentionable: false },
                { name: '💪|Destekçi', color: '#743590', hoist: false, mentionable: false },
                { name: '💲|Özel Üye', color: '#743590', hoist: false, mentionable: false },
                { name: '💙|Dost', color: '#13FBB6', hoist: false, mentionable: false },
                { name: '🌈|Rainbow', color: '#DA004E', hoist: false, mentionable: false },
                { name: '🏆|Altın V.I.P', color: '#E4B400', hoist: false, mentionable: false },
                { name: '💎|V.I.P', color: '#226EB3', hoist: false, mentionable: false },
                { name: '👤|Üye', color: '#49CA75', hoist: false, mentionable: false },
                { name: '🤖|Botlar', color: '#226EB3', hoist: true, mentionable: true }
            ];

            for (const rol of roller) {
                await message.guild.roles.create({ name: rol.name, color: rol.color, hoist: rol.hoist, mentionable: rol.mentionable });
            }
            await bilgiMesajı.edit({ content: 'Yaptım💥', embeds: [{ color: 0xFFFFFF, description: '**Bütün Roller Kuruldu!**' }] });
        } catch (error) {
            console.error(error);
            message.reply('Roller oluşturulurken bir hata meydana geldi.');
        }
    }
};
