const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json({ limit: "2mb" })); // Aumentado porque el código será GIGANTE

// 🧬 GENERADOR DE VARIABLES TIPO "MURO DE CARACTERES"
function rn() {
    const chars = ["I", "l", "v", "1", "2", "3"];
    const starters = ["I", "l", "v"]; 
    let res = starters[Math.floor(Math.random() * starters.length)];
    // Variables de 20 caracteres para máximo desorden visual
    for (let i = 0; i < 20; i++) {
        res += chars[Math.floor(Math.random() * chars.length)];
    }
    return res;
}

// 🧮 MATH CODE ULTRA-AGRESIVO (90% de densidad)
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

// 🌪️ GENERADOR DE "SOPA DE LUA" (Junk masivo y anidado)
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

// 💀 LA MÁQUINA DEL APOCALIPSIS (VM fragmentada y caótica)
function VM(arr) {
    let d = rn(), f = rn(), l = rn(), a = rn(), r = rn(), i = rn();
    let tablePart1 = rn(), tablePart2 = rn();
    
    // Dividimos la tabla en dos para duplicar el desorden
    const splitIndex = Math.floor(arr.length / 2);
    const p1 = arr.slice(0, arr.lastIndexOf(',', splitIndex)) + "}";
    const p2 = "{" + arr.slice(arr.lastIndexOf(',', splitIndex) + 1);

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
    // Minificación que deja espacios estratégicos para que parezca una masa de texto
    return code.replace(/\s+/g, " ").trim();
}

function advancedScanner(code) {
    let headList = [];
    const placeholders = [];
    // Protegemos strings
    const protectRegex = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g;
    let safeCode = code.replace(protectRegex, (m) => {
        const id = `__T${placeholders.length}__`;
        placeholders.push(m);
        return id;
    });

    // Ofuscamos incluso las palabras comunes de Lua (local, function, then)
    const keywords = ["Workspace", "Players", "Character", "Humanoid", "FindFirstChild", "WaitForChild"];
    
    keywords.forEach(word => {
        const v = rn();
        headList.push(`local ${v}=string.char(${word.split('').map(c => c.charCodeAt(0)).join(',')});`);
        const regex = new RegExp(`\\.${word}\\b`, "g");
        safeCode = safeCode.replace(regex, `[${v}]`);
    });

    // Desordenar cabeceras 200%
    headList.sort(() => Math.random() - 0.5);
    
    placeholders.forEach((s, i) => {
        safeCode = safeCode.replace(`__T${i}__`, s);
    });
    
    return { headers: headList.join(""), code: safeCode };
}

function obfuscate(code) {
    let { headers, code: pre } = advancedScanner(code);
    let table = stringToTable(pre);
    
    // Inyectamos junk en dosis letales
    let finalPayload = `
        ${junk(100)} 
        ${headers} 
        ${junk(100)} 
        ${VM(table)} 
        ${junk(100)}
    `;

    return `return (function() ${minify(finalPayload)} end)()`;
}

app.post("/obfuscate", (req, res) => {
    const code = req.body.code || "";
    if (!code.trim()) return res.status(400).json({ error: "Vacío" });
    try {
        res.json({ obfuscated: obfuscate(code) });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(3000, () => console.log("☢️ ENTROPÍA TOTAL: CÓDIGO GIGANTE Y DESORDENADO ONLINE"));
                      
