const { Client, GatewayIntentBits } = require('discord.js')
require('dotenv').config()
const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
})

const token = process.env.TOKEN_DISCORD
client.login(token)

client.on('ready', () => {
    console.log(`Logged is as ${client.user.tag}`)
})

client.on('messageCreate', msg => {
    if (msg.author.bot) return
    if (msg.content === 'hello') {
        msg.reply(`Hello ${msg.author}, How can i assits you today!`)
    }
})