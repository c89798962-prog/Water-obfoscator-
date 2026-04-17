const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// Aumentado porque el código resultante será gigantesco
app.use(bodyParser.json({ limit: "50mb" })); 

// --- CONSTANTES DE OFUSCACIÓN ---
const DISCORD = "https://discord.gg/5E45u5eES";
const HEADER = `--[[ this code it's protected by water obfoscator:https://discord.gg/UttE8VYAY ]]`;
const IL_POOL = ["I1","l1","v1","v2","v3","II","ll","vv","v4","v5","I2","l2","vI","Iv","v6","I3","lI","Il"];
const HANDLER_POOL = ["KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD","Kp","Hx","Wn","Sr","Rm","Nz","Jf","Ug"];

const MAPEO = {
  "ScreenGui":"Aggressive Renaming","Frame":"String to Math","TextLabel":"Table Indirection",
  "TextButton":"Mixed Boolean Arithmetic","TextBox":"Aggressive Renaming","ImageLabel":"Size-Based Execution Switch",
  "Humanoid":"Dynamic Junk","Player":"Fake Flow","Character":"Math Encoding","Part":"Literal Obfuscation",
  "Camera":"Table Indirection","TweenService":"Fake Flow","RunService":"Virtual Machine",
  "UserInputService":"Mixed Boolean Arithmetic","RemoteEvent":"Fake Flow","Workspace":"Reverse If",
  "Lighting":"Size-Based Execution Switch","Players":"Fake Flow","ReplicatedStorage":"Table Indirection","StarterGui":"String to Math"
};

// --- FUNCIONES MATEMÁTICAS Y DE GENERACIÓN ---
function mul(a, b) { return a / (1 / b); }

function generateIlName() {
  return IL_POOL[Math.floor(mul(Math.random(), IL_POOL.length))] + Math.floor(mul(Math.random(), 9999));
}

function pickHandlers(count) {
  const used = new Set();
  const result = [];
  while (result.length < count) {
    const base = HANDLER_POOL[Math.floor(mul(Math.random(), HANDLER_POOL.length))];
    const name = base + Math.floor(mul(Math.random(), 99));
    if (!used.has(name)) { used.add(name); result.push(name); }
  }
  return result;
}

function lightMath(n) {
  let a = Math.floor(mul(Math.random(), 90)) + 20, b = Math.floor(mul(Math.random(), 60)) + 10;
  let ab = Math.imul(a, b);
  return `(${n}+${ab}-${a})`;
}

function stringToMath(str) {
  return `{${str.split('').map(c => lightMath(c.charCodeAt(0))).join(',')}}`;
}

function mba() {
  let n = Math.random() > 0.5 ? 1 : 2, a = Math.floor(mul(Math.random(), 70)) + 15, b = Math.floor(mul(Math.random(), 40)) + 8;
  let na = Math.imul(n, a);
  return `((${na}-${a})/(${b}+1)+${n})`;
}

function generateJunk(lines = 144) {
  let j = '';
  for (let i = 0; i < lines; i++) {
    const r = Math.random();
    if (r < 0.25)      j += `local ${generateIlName()}=${lightMath(Math.floor(mul(Math.random(), 9999)))}; `;
    else if (r < 0.5)  j += `local ${generateIlName()}=${mba()}; `;
    else if (r < 0.75) j += `local ${generateIlName()}=${lightMath(mba())}; `;
    else               j += `local ${generateIlName()}=(${mba()}+${lightMath(Math.floor(mul(Math.random(), 999)))}); `;
  }
  return j;
}

// --- ANÁLISIS, MAPEADO Y MÁQUINA VIRTUAL ---
function detectAndApplyMappings(code) {
  let modified = code, headers = "";
  const sorted = Object.entries(MAPEO).sort((a, b) => b[0].length - a[0].length);
  for (const [word, tech] of sorted) {
    const regex = new RegExp(`(game\\s{0,}\\.\\s{0,}|\\b\\.\\s{0,})?\\b${word}\\b`, "g");
    if (regex.test(modified)) {
      let replacement = `"${word}"`;
      if (tech.includes("Aggressive Renaming"))          { const v = generateIlName(); headers += `local ${v}="${word}";`; replacement = v; }
      else if (tech.includes("String to Math"))           replacement = `string.char(${stringToMath(word)})`;
      else if (tech.includes("Table Indirection"))        { const t = generateIlName(); headers += `local ${t}={"${word}"};`; replacement = `${t}[1]`; }
      else if (tech.includes("Mixed Boolean Arithmetic")) replacement = `((${mba()}==1 or true)and"${word}")`;
      else if (tech.includes("Fake Flow"))                replacement = `(function()return ${mba()}==1 and"${word}"or"${word}"end)()`;
      else if (tech.includes("Virtual Machine"))          replacement = `loadstring("return '${word}'")()`; 
      regex.lastIndex = 0;
      modified = modified.replace(regex, (match, prefix) => {
        if (prefix) return prefix.includes("game") ? `game[${replacement}]` : `[${replacement}]`;
        return replacement;
      });
    }
  }
  return headers + modified;
}

function buildVMWrapper(innerCode) {
  const handlerCount = 5 + Math.floor(mul(Math.random(), 4));
  const handlers = pickHandlers(handlerCount);
  const realIdx = Math.floor(mul(Math.random(), handlerCount));
  const DISPATCH = generateIlName();

  let out = `local lM={`;
  for (let i = 1; i <= 8; i++) {
    out += `[${i}]=${lightMath(Math.floor(mul(Math.random(), 999)))},`;
  }
  out += `}; local lM=lM;`;

  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) {
      out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunk(8)} ${innerCode} end;`;
    } else {
      const junkCount = 3 + Math.floor(mul(Math.random(), 6));
      out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunk(junkCount)} return lM; end;`;
    }
  }

  out += `local ${DISPATCH}={`;
  for (let i = 0; i < handlers.length; i++) {
    out += `[${i + 1}]=${handlers[i]},`;
  }
  out += `};`;

  for (let i = 0; i < handlers.length; i++) {
    if (i !== realIdx) out += `${DISPATCH}[${i + 1}](lM);`;
  }

  out += `${DISPATCH}[${realIdx + 1}](lM);`;

  return out;
}

// --- PROTECCIONES AVANZADAS DE NIVEL TOP ---
function generateProtections() {
  let p = "";
  // Anti-Debug (Time Check intacto)
  p += `local _clk=os.clock;if _clk then local _st=_clk();for _=1,1500 do local _dummy=_+_; end;if _clk()-_st>5.2 then while true do end end end;`;
  
  // Anti-Tamper Top Tier (Seguro)
  p += `local _sc=string.char;local _t=type;local _ts=tostring;local _gm=getmetatable;local _d=debug;`;
  // 1. Deteccion de modificacion en metatabla de strings
  p += `if _t(_gm)=="function"then local _mt=_gm("")if _t(_mt)=="table"and _mt.__index then while true do end end end;`;
  // 2. Deteccion de Hooks en Lua verificando si es Closure en C
  p += `if _d and _t(_d.getinfo)=="function"then local _i=_d.getinfo(_sc)if _i and _i.what~="C"then while true do end end end;`;
  // 3. Verificacion estandar de nombres de funciones
  p += `if _t(_sc)~="function"or _ts(_sc):lower():find("hook")or _ts(_sc):lower():find("closure")then while true do end end;`;
  return p;
}

function minify(code) {
    // Minificación que comprime los espacios dejando la estructura funcional
    return code.replace(/\n/g, ' ').replace(/\s+/g, " ").replace(/\s{0,}([=+\-\/{},;])\s{0,}/g, '$1').trim();
}

function obfuscate(sourceCode) {
  if (!sourceCode || typeof sourceCode !== 'string') throw new Error("Código inválido o vacío");

  let preProcessed = detectAndApplyMappings(sourceCode);
  const seed = Date.now() + mul(Math.random(), 99999999);
  const xorKeyBase = Math.floor(seed % 2147483647) + 1;
  const bytes = preProcessed.split('').map((char, i) => {
    let val = char.charCodeAt(0) ^ (xorKeyBase + Math.imul(i, 5));
    val = val ^ (xorKeyBase >>> 4);
    return val & 0xFF;
  });

  const VM_DATA = generateIlName(), XOR_KEY = generateIlName();
  const PC = generateIlName(), STACK = generateIlName(), DECODER = generateIlName();

  let innerCode = '';
  const jsonBytes = JSON.stringify(bytes);
  innerCode += `local ${VM_DATA}=${stringToMath(jsonBytes)};`;
  innerCode += `local ${XOR_KEY}=${mba()};`;
  innerCode += `local ${PC}=1;local ${STACK}="";`;
  innerCode += `local ${DECODER}=function()`;
  innerCode += generateJunk(20);
  innerCode += `while ${PC}<=${jsonBytes.length} do `;
  innerCode += `local lM=${VM_DATA}[${PC}];`;
  innerCode += `${STACK}=${STACK}..string.char(lM~${XOR_KEY});`;
  innerCode += `${PC}=${PC}+1;`;
  innerCode += `end;return ${STACK};end;`;
  
  // Inyeccion de protecciones Top Tier
  innerCode += generateProtections();
  
  innerCode += `local payload=(loadstring or load)(${DECODER}());payload();`;

  let vm = HEADER + '\n';
  vm += generateJunk(200); // Elevado para máxima entropía
  vm += buildVMWrapper(innerCode);
  vm += generateJunk(150);

  let finalPayload = `return(function() ${vm} end)();`;
  return minify(finalPayload);
}

// --- SERVIDOR EXPRESS ---
app.post("/obfuscate", (req, res) => {
    const code = req.body.code || "";
    if (!code.trim()) return res.status(400).json({ error: "Vacío: Envía código Lua para ofuscar." });
    
    try {
        const result = obfuscate(code);
        res.json({ obfuscated: result });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(3000, () => {
    console.log("☢️ ENTROPÍA TOTAL: MOTOR DE OFUSCACIÓN AVANZADA Y SERVIDOR ONLINE EN EL PUERTO 3000");
});
      
