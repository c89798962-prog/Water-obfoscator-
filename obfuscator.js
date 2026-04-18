function obfuscate(luaCode) {
    const watermark = "--[[ this code it's protected by water obfoscatir:https://discord.gg/JUrq2QR4s ]]\n";

    const mathKey = Math.floor(Math.random() * 150) + 25;

    let bytecode = [];
    for (let i = 0; i < luaCode.length; i++) {
        bytecode.push(luaCode.charCodeAt(i) + mathKey);
    }

    const bytecodeLength = bytecode.length;

    let vmTemplate = `
    local lM = ${mathKey}
    local IIIIIIIIII1 = {${bytecode.join(',')}}
    local vvv1 = string.char()
    local v1 = 1
    local v2 = ${bytecodeLength}
    local v3 = 0
    local KQ = function(lM_arg, lM_key) 
        return string.char(lM_arg - lM_key) 
    end
    local HF = function(lM_val) 
        local lM_math = math.random(1,5)
        local lM_dummy = lM_math - lM_math
        v3 = lM_val + lM_dummy
        return lM
    end
    local W8 = function(lM_str, lM_char) 
        return lM_str .. lM_char 
    end
    local SX = function()
        while v1 <= v2 do
            local lM_inst = IIIIIIIIII1[v1]
            HF(lM_inst)
            local lM_temp = KQ(v3, lM)
            vvv1 = W8(vvv1, lM_temp)
            v1 = v1 + 1
            local lM_fake = lM
        end
    end
    SX()
    local lM_exec = loadstring or load
    lM_exec(vvv1)()
    `;

    let compressedLua = vmTemplate.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
    return watermark + compressedLua;
}

module.exports = { obfuscate };    const protectRegex = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g;
    
    let safeCode = code.replace(protectRegex, (m) => {
        const id = `__T${placeholders.length}__`;
        placeholders.push(m);
        return id;
    });

    const keywords = ["Workspace", "Players", "Character", "Humanoid", "FindFirstChild", "WaitForChild"];
    
    keywords.forEach(word => {
        const v = rn();
        headList.push(`local ${v}=string.char(${word.split('').map(c => c.charCodeAt(0)).join(',')});`);
        const regex = new RegExp(`\\.${word}\\b`, "g");
        safeCode = safeCode.replace(regex, `[${v}]`);
    });

    headList.sort(() => Math.random() - 0.5);
    
    placeholders.forEach((s, i) => {
        safeCode = safeCode.replace(`__T${i}__`, s);
    });
    
    return { headers: headList.join(""), code: safeCode };
}

/**
 * 🌪️ FUNCIÓN PRINCIPAL DE OFUSCACIÓN
 */
function obfuscate(code) {
    let { headers, code: pre } = advancedScanner(code);
    let table = stringToTable(pre);
    
    let finalPayload = `
        ${junk(100)} 
        ${headers} 
        ${junk(100)} 
        ${VM(table)} 
        ${junk(100)}
    `;

    return `return (function() ${minify(finalPayload)} end)()`;
}

// ENDPOINTS
app.post("/obfuscate", (req, res) => {
    const code = req.body.code || "";
    if (!code.trim()) return res.status(400).json({ error: "El código está vacío" });
    try {
        const result = obfuscate(code);
        res.json({ obfuscated: result });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Ruta de prueba para verificar que el servidor vive
app.get("/", (req, res) => {
    res.send("☢️ Servidor de Entropía Total operativo.");
});

// CONFIGURACIÓN DE PUERTO PARA RAILWAY
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`☢️ SERVIDOR ACTIVO EN PUERTO: ${PORT}`);
});

// EXPORTACIÓN REQUERIDA
module.exports = { obfuscate };
            
