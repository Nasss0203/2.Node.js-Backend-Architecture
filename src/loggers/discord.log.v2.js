const { CHANNEL_ID_DISCORD, TOKEN_DISCORD } = process.env
const { Client, GatewayIntentBits } = require('discord.js')

class LoggerService {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ]
        })

        //add channelId
        this.channelId = CHANNEL_ID_DISCORD
        this.client.on('ready', () => {
            console.log(`Logged is as ${this.client.user.tag}`)
        })
        this.client.login(TOKEN_DISCORD)
    }

    sendToFormatCode(logData) {
        console.log('logData: ', logData);
        const { code, message = 'This í some additional information about the code', title = 'Code Example ' } = logData
        if (1 === 1) {

        }
        const codeMessage = {
            content: message,
            embeds: [
                {
                    color: parseInt('00ff00', 16), // Convert hexadecimal color code to integer
                    title,
                    description: '``json\n' + JSON.stringify(code, null, 2) + '\n``'
                }
            ]
        }

        this.sendToMessage(codeMessage)
    }

    sendToMessage(message = 'message') {
        const channel = this.client.channels.cache.get(this.channelId)

        if (!channel) {
            console.error(`Couldn't find the channel...`, this.channelId)
            return
        }
        channel.send(message).catch(e => console.error(e))
    }
}



// const loggerService =
module.exports = new LoggerService()