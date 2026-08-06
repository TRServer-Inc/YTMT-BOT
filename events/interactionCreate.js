const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // Butona tıklanınca Modal (Form) Aç
        if (interaction.isButton() && interaction.customId.startsWith('kayit_buton_')) {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageNicknames) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ Kayıt etme yetkin yok kanka!', ephemeral: true });
            }

            const hedefId = interaction.customId.replace('kayit_buton_', '');

            const modal = new ModalBuilder()
                .setCustomId(`kayit_modal_${hedefId}`)
                .setTitle('Üye Kayıt Formu');

            const isimInput = new TextInputBuilder()
                .setCustomId('kayit_ad')
                .setLabel('Kullanıcı Adı')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Örn: Ahmet')
                .setRequired(true);

            const yasInput = new TextInputBuilder()
                .setCustomId('kayit_yas')
                .setLabel('Yaş (İsteğe Bağlı)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Örn: 18')
                .setRequired(false);

            modal.addComponents(
                new ActionRowBuilder().addComponents(isimInput),
                new ActionRowBuilder().addComponents(yasInput)
            );

            await interaction.showModal(modal);
        }

        // Form Gönderilince Kayıt Et
        if (interaction.isModalSubmit() && interaction.customId.startsWith('kayit_modal_')) {
            const hedefId = interaction.customId.replace('kayit_modal_', '');
            const hedef = await interaction.guild.members.fetch(hedefId).catch(() => null);

            if (!hedef) {
                return interaction.reply({ content: '❌ Kullanıcı sunucudan ayrılmış!', ephemeral: true });
            }

            const ad = interaction.fields.getTextInputValue('kayit_ad');
            const yas = interaction.fields.getTextInputValue('kayit_yas');

            const kayitsizRolu = interaction.guild.roles.cache.find(r => r.name === 'Kayıtsız');
            const kayitliRolu = interaction.guild.roles.cache.find(r => r.name === 'Kayıtlı');

            if (!kayitliRolu) {
                return interaction.reply({ content: '❌ **Kayıtlı** rolü bulunamadı! Önce `y!kayıt-kurulum #kanal` yap kanka.', ephemeral: true });
            }

            const yeniIsim = yas ? `${ad} | ${yas}` : `${ad}`;
            await hedef.setNickname(yeniIsim).catch(() => {});

            if (kayitsizRolu && hedef.roles.cache.has(kayitsizRolu.id)) {
                await hedef.roles.remove(kayitsizRolu);
            }
            await hedef.roles.add(kayitliRolu);

            return interaction.reply({ content: `✅ ${hedef} kullanıcısı başarıyla **${yeniIsim}** olarak kayıt edildi!`, ephemeral: false });
        }
    }
};
