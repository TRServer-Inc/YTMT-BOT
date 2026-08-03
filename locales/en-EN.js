module.exports = {
    // general / errors
    no_perm: "❌ You don't have permission to use this command!",
    bot_no_perm: "❌ The bot doesn't have enough permissions!",
    user_not_found: "❌ Specified user not found!",
    lang_usage: "You must specify a language! Example: `y!dil tr` or `y!dil en`",
    lang_changed: "✅ Your personal language has been set to **English**!",

    // help embed
    help_title: "🤖 YTMTBot | Command Menu",
    help_desc: "Below is the full list of available commands categorized for you!",
    cat_moderation: "🛡️ Moderation & Punishment Systems",
    cat_registration: "📝 Registration Systems",
    cat_management: "👑 Management & Server Settings",
    cat_premium: "⭐ Premium & Extra Systems",
    cat_general: "⚙️ General & Info Commands",
    footer_text: "• Total Commands: 22",

    // moderation
    ban_usage: "You didn't specify who to ban! Ex: `y!ban @user [reason]`",
    ban_success: "🔨 {user} has been restricted!",
    fullban_success: "💥 {user} has been permanently banned!",
    kick_success: "👞 {user} has been kicked from the server!",
    unban_usage: "Provide the user ID to unban! Ex: `y!unban 123456789`",
    unban_success: "✅ User ID `{id}` has been unbanned!",
    ban_setup_success: "✅ **Banned role and channel restrictions set up!**",

    // registration
    reg_usage: "Usage format: `y!kayıt @user Name [Age]`",
    reg_no_role: "❌ **Registered** role not found! Run `y!kayıt-kurulum #channel` first.",
    reg_success: "✅ {user} registered as **{name}**!",
    reg_setup_success: "✅ Registration system set up! Unregistered and Registered roles ready.",

    // management
    autorole_usage: "Example: `y!oto-rol @role` or `y!oto-rol reset`",
    autorole_success: "✅ Auto role set to {role}!",
    autorole_reset: "✅ Auto role has been reset!",
    hgbb_success: "✅ Welcome / Goodbye log channel set to {channel}!",
    link_toggle_on: "🔒 Anti-link protection **enabled**!",
    link_toggle_off: "🔓 Anti-link protection **disabled**!",
    role_give_usage: "Example: `y!rolekle @user @role`",
    role_give_success: "✅ Given {role} to {user}!",
    role_remove_success: "🗑️ Removed {role} from {user}!",
    roles_cleared: "🗑️ Extra roles cleaned up!",

    // premium
    premium_active: "⭐ Your Premium membership is **Active**!",
    premium_inactive: "❌ You don't have a Premium membership.",
    premium_given: "⭐ {user} is now a **Premium** member!",
    premium_taken: "❌ Revoked Premium membership from {user}.",

    // general
    ping_text: "🏓 **Pong!** Bot Latency: `{ping}ms` | API Latency: `{api}ms`",
    profile_title: "👤 User Profile",
    server_title: "📊 Server Statistics",
    server_setup_confirm: "⚠️ Server template is being installed, channels and roles will be configured!",
    rules_title: "📜 Server Rules",
    rules_text: "1. Be respectful.\n2. No spamming or self-promotion.\n3. Avoid political/religious arguments.",
    sa_on: "✅ Auto-greeting system **enabled**!",
    sa_off: "❌ Auto-greeting system **disabled**!"
};
