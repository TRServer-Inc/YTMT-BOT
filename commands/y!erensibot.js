module.exports = {
    name: 'erensibot',
    description: 'erensibot espri komutu',
    async execute(message, args, client) {
        // $suppressErrors -> olası hataları sessizce yutması için try-catch
        try {
            // $deletecommand -> komutu yazan kullanıcının mesajını siler
            await message.delete().catch(() => {});

            // $nomention -> kullanıcıyı etiketlemeden doğrudan cevabı atar
            const gonderilenMesaj = await message.channel.send('Erensibot Bende Usain Bolt😂🫵');

            // $addReactions[😁;😂] -> mesaja tepkileri ekler
            await gonderilenMesaj.react('😁');
            await gonderilenMesaj.react('😂');
        } catch (error) {
            // hata alsa da çaktırmaz ($suppressErrors mantığı)
        }
    }
};