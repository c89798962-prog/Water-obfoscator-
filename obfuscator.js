const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// Middleware con límite aumentado para soportar scripts grandes
app.use(bodyParser.json({ limit: "5mb" })); 

/**
 * 🧬 GENERADOR DE VARIABLES TIPO "MURO DE CARACTERES"
 * Crea nombres de variables extremadamente difíciles de distinguir (I, l, 1, v)
 */
function rn() {
    const chars = ["I", "l", "v", "1", "2", "3"];
    const starters = ["I", "l", "v"]; 
    let res = starters[Math.floor(Math.random() * starters.length)];
    for (let i = 0; i < 20; i++) {
        res += chars[Math.floor(Math.random() * chars.length)];
    }
    return res;
}

/**
 * 🧮 MATH CODE ULTRA-AGRESIVO
 * Ofusca números mediante operaciones redundantes
 */
function math(n) {
    let a = Math.floor(Math.random() * 100) + 1;
    let b = Math.floor(Math.random() * 50) + 1;
    let c = Math.floor(Math.random() * 25) + 1;
    
    const mode = Math.floor(Math.random() * 4);
    if (mode === 0) return `((${n}+${a})-${a})`;
    if (mode === 1) return `((${n}-${b})+${b})`;
    if (mode === 2) return `(((${n}*${c})/${c})+${a}-${a})`;
    return `((${n}+${a}+${b})-${b}-${a})`;
}

/**
 * 🌪️ GENERADOR DE "SOPA DE LUA" (Junk Code)
 * Inserta código inútil para confundir descompiladores y humanos
 */
function junk(lines = 200) {
    let o = "";
    for (let i = 0; i < lines; i++) {
        const type = Math.floor(Math.random() * 3);
        if (type === 0) {
            o += `local ${rn()}=(${Math.floor(Math.random()*999)}*${Math.floor(Math.random()*999)});`;
        } else if (type === 1) {
            o += `if ${Math.random()}>0.9 then local ${rn()}=function() return end end;`;
        } else {
            o += `do local ${rn()}=string.char(${Math.floor(Math.random()*255)}) end;`;
        }
    }
    return o;
}

/**
 * 🔧 CONVERTIDOR DE STRING A TABLA OFUSCADA
 */
function stringToTable(str) {
    let arr = [];
    for (let i = 0; i < str.length; i++) {
        arr.push(math(str.charCodeAt(i)));
    }
    return "{" + arr.join(",") + "}";
}

/**
 * 💀 LA MÁQUINA DEL APOCALIPSIS (Virtual Machine fragmentada)
 */
function VM(arr) {
    let d = rn(), f = rn(), l = rn(), a = rn(), r = rn(), i = rn();
    let tablePart1 = rn(), tablePart2 = rn();
    
    const splitIndex = Math.floor(arr.length / 2);
    const lastComma = arr.lastIndexOf(',', splitIndex);
    
    const p1 = arr.slice(0, lastComma) + "}";
    const p2 = "{" + arr.slice(lastComma + 1);

    return `
        ${junk(40)}
        local ${tablePart1} = ${p1};
        ${junk(20)}
        local ${tablePart2} = ${p2};
        local ${d} = {};
        for _,v in pairs(${tablePart1}) do table.insert(${d}, v) end
        for _,v in pairs(${tablePart2}) do table.insert(${d}, v) end
        ${junk(30)}
        local function ${f}(${a}) 
            local ${r} = "" 
            ${junk(10)}
            for ${i} = 1, #${a} do 
                ${r} = ${r} .. string.char(${a}[${i}]) 
                if ${i}%100 == 0 then ${junk(1)} end
            end 
            return ${r} 
        end; 
        ${junk(40)}
        local ${l} = loadstring(${f}(${d})); 
        if ${l} then ${l}() end;
        ${junk(50)}
    `;
}

function minify(code) {
    return code.replace(/\s+/g, " ").trim();
}

function advancedScanner(code) {
    let headList = [];
    const placeholders = [];
    const protectRegex = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g;
    
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
            
