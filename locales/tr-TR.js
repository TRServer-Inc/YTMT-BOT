module.exports = {
    // genel / hatalar
    no_perm: "❌ bu komutu kullanmak için yetkin yok kanka!",
    bot_no_perm: "❌ botun bu işlemi yapmaya yetkisi yetersiz!",
    user_not_found: "❌ belirtilen kullanıcı bulunamadı!",
    lang_usage: "kanka geçerli bir dil seçmelisin! Örnek: `y!dil tr` veya `y!dil en`",
    lang_changed: "✅ kişisel dilin başarıyla **Türkçe** olarak ayarlandı!",

    // yardım embedi
    help_title: "🤖 YTMTBot | Komut Menüsü",
    help_desc: "Aşağıda sunucuda kullanabileceğin tüm güncel komutlar kategorilere ayrılmış olarak listelenmiştir, kanka!",
    cat_moderation: "🛡️ Moderasyon & Ceza Sistemleri",
    cat_registration: "📝 Kayıt Sistemleri",
    cat_management: "👑 Yönetim & Sunucu Ayarları",
    cat_premium: "⭐ Premium & Ekstra Sistemler",
    cat_general: "⚙️ Genel & Bilgi Komutları",
    footer_text: "• Toplam Komut Sayısı: 22",

    // moderasyon
    ban_usage: "kanka kimi banlayacağımı yazmadın! Örn: `y!ban @üye [sebep]`",
    ban_success: "🔨 {user} başarıyla geçici kısıtlandı!",
    fullban_success: "💥 {user} sunucudan tamamen banlandı!",
    kick_success: "👞 {user} sunucudan atıldı!",
    unban_usage: "kanka unban atılacak ID'yi girmelisin! Örn: `y!unban 123456789`",
    unban_success: "✅ `{id}` ID'li üyenin banı kaldırıldı!",
    ban_setup_success: "✅ **Banlanmış rolü ve kanal kısıtlamaları başarıyla kuruldu!**",

    // kayıt
    reg_usage: "kanka kullanımı şöyle: `y!kayıt @üye Ad [Yaş]`",
    reg_no_role: "❌ **Kayıtlı** rolü bulunamadı! Önce `y!kayıt-kurulum #kanal` çalıştır.",
    reg_success: "✅ {user} başarıyla **{name}** olarak kayıt edildi!",
    reg_setup_success: "✅ Kayıt sistemi kuruldu! Kayıtsız ve Kayıtlı rolleri ayarlandı.",

    // yönetim
    autorole_usage: "Örnek: `y!oto-rol @rol` veya `y!oto-rol sıfırla`",
    autorole_success: "✅ Otomatik rol {role} olarak ayarlandı!",
    autorole_reset: "✅ Otomatik rol sıfırlandı!",
    hgbb_success: "✅ Hoş geldin / Güle güle kanalı {channel} olarak ayarlandı!",
    link_toggle_on: "🔒 Link engelleme sistemi **açıldı**!",
    link_toggle_off: "🔓 Link engelleme sistemi **kapatıldı**!",
    role_give_usage: "Örnek: `y!rolekle @üye @rol`",
    role_give_success: "✅ {user} kişisine {role} rolü verildi!",
    role_remove_success: "🗑️ {user} kişisinden {role} rolü alındı!",
    roles_cleared: "🗑️ Fazla roller başarıyla temizlendi!",

    // premium
    premium_active: "⭐ Premium üyeliğin **Aktif** kanka!",
    premium_inactive: "❌ Premium üyeliğin bulunmuyor.",
    premium_given: "⭐ {user} artık bir **Premium** üye!",
    premium_taken: "❌ {user} kişisinin Premium üyeliği alındı.",

    // genel
    ping_text: "🏓 **Pong!** Bot Gecikmesi: `{ping}ms` | API Gecikmesi: `{api}ms`",
    profile_title: "👤 Kullanıcı Profili",
    server_title: "📊 Sunucu İstatistikleri",
    server_setup_confirm: "⚠️ Sunucu şablonu kuruluyor, kanallar ve roller yeniden yapılandırılacak!",
    rules_title: "📜 Sunucu Kuralları",
    rules_text: "1. Saygılı olun.\n2. Spam ve reklam yapmayın.\n3. Dini/Siyasi tartışmalara girmeyin.",
    sa_on: "✅ Otomatik Aleykümselam sistemi **açıldı**!",
    sa_off: "❌ Otomatik Aleykümselam sistemi **kapatıldı**!"
};
