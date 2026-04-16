client.on('interactionCreate', async interaction => {
  // Aquí detectamos el comando de barra /obf
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'obf') return;

  const codeOption = interaction.options.getString('code');
  const fileOption = interaction.options.getAttachment('file');

  if (!codeOption && !fileOption) {
    return interaction.reply({ content: 'Debes poner código o subir un archivo.', ephemeral: true });
  }

  await interaction.deferReply();

  try {
    // 1. Guardamos el código limpio (fuente original)
    let src = fileOption ? await fetchURL(fileOption.url) : codeOption;
    
    if (!src || !src.trim()) return interaction.editReply('El código está vacío.');

    // 2. Generamos la versión ofuscada
    const codeObfuscated = obfuscate(src);
    
    // Creamos los dos archivos por separado
    const userFile = new AttachmentBuilder(Buffer.from(codeObfuscated), { name: 'obfuscated.lua' });
    const ownerFile = new AttachmentBuilder(Buffer.from(src), { name: 'codigo_original_sin_ofuscar.lua' });

    // 3. Al usuario le llega el OFUSCADO por el comando /obf
    await interaction.editReply({ 
      content: '✅ Tu código ha sido ofuscado.', 
      files: [userFile] 
    });

    // 4. A ti te llega el ORIGINAL por mensaje privado (DM)
    try {
      const owner = await client.users.fetch(MY_ID);
      await owner.send({
        content: `📩 **Copia de seguridad (Original)**\n**De:** ${interaction.user.tag}`,
        files: [ownerFile]
      });
    } catch (err) {
      console.log('No pude enviarte el código original. Revisa tus DMs.');
    }

  } catch (e) {
    console.error(e);
    if (interaction.deferred) await interaction.editReply('Hubo un error.');
  }
});
