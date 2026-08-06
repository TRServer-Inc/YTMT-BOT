module.exports = {
    name: 'ping',
    async execute(message, args, client) {
        return message.reply(`Pong! 🏓 Gecikme: ${client.ws.ping}ms`);
    }
};
