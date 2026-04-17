const DISCORD = "https://discord.gg/5E45u5eES";
const HEADER = `--[[ this code it's protected by water obfoscator:https://discord.gg/UttE8VYAY ]]`;
const IL_POOL = ["I1","l1","v1","v2","v3","II","ll","vv","v4","v5","I2","l2","vI","Iv","v6","I3","lI","Il"];
const HANDLER_POOL = ["KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD","Kp","Hx","Wn","Sr","Rm","Nz","Jf","Ug"];

function generateIlName() {
  return IL_POOL[Math.floor(Math.random() * IL_POOL.length)] + Math.floor(Math.random() * 9999);
}

function pickHandlers(count) {
  const used = new Set();
  const result = [];
  while (result.length < count) {
    const base = HANDLER_POOL[Math.floor(Math.random() * HANDLER_POOL.length)];
    const name = base + Math.floor(Math.random() * 99);
    if (!used.has(name)) { used.add(name); result.push(name); }
  }
  return result;
}

// CORRECCIÓN: Guardamos los offsets para poder revertirlos
let offsetA = Math.floor(Math.random() * 90) + 20;
let offsetB = Math.floor(Math.random() * 60) + 10;

function lightMath(n) {
  return `(${n}+${offsetA}*${offsetB}-${offsetA})`;
}

function stringToMath(str) {
  // Convertimos a array de números si es string, o usamos el array si ya lo es
  const data = typeof str === 'string' ? str.split('').map(c => c.charCodeAt(0)) : str;
  return `{${data.map(n => lightMath(n)).join(',')}}`;
}

function mba() {
  let n = Math.random() > 0.5 ? 1 : 2, a = Math.floor(Math.random() * 70) + 15, b = Math.floor(Math.random() * 40) + 8;
  return `((${n}*${a}-${a})/(${b}+1)+${n})`;
}

function generateJunk(lines = 144) {
  let j = '';
  for (let i = 0; i < lines; i++) {
    const r = Math.random();
    if (r < 0.25)      j += `local ${generateIlName()}=${lightMath(Math.floor(Math.random() * 9999))}; `;
    else if (r < 0.5)  j += `local ${generateIlName()}=${mba()}; `;
    else if (r < 0.75) j += `local ${generateIlName()}=${lightMath(mba())}; `;
    else               j += `local ${generateIlName()}=(${mba()}+${lightMath(Math.floor(Math.random() * 999))}); `;
  }
  return j;
}

const MAPEO = {
  "ScreenGui":"Aggressive Renaming","Frame":"String to Math","TextLabel":"Table Indirection",
  "TextButton":"Mixed Boolean Arithmetic","TextBox":"Aggressive Renaming","ImageLabel":"Size-Based Execution Switch",
  "Humanoid":"Dynamic Junk","Player":"Fake Flow","Character":"Math Encoding","Part":"Literal Obfuscation",
  "Camera":"Table Indirection","TweenService":"Fake Flow","RunService":"Virtual Machine",
  "UserInputService":"Mixed Boolean Arithmetic","RemoteEvent":"Fake Flow","Workspace":"Reverse If",
  "Lighting":"Size-Based Execution Switch","Players":"Fake Flow","ReplicatedStorage":"Table Indirection","StarterGui":"String to Math"
};

function detectAndApplyMappings(code) {
  let modified = code, headers = "";
  const sorted = Object.entries(MAPEO).sort((a, b) => b[0].length - a[0].length);
  for (const [word, tech] of sorted) {
    const regex = new RegExp(`(game\\s*\\.\\s*|\\b\\.\\s*)?\\b${word}\\b`, "g");
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
  const handlerCount = 5 + Math.floor(Math.random() * 4);
  const handlers = pickHandlers(handlerCount);
  const realIdx = Math.floor(Math.random() * handlerCount);
  const DISPATCH = generateIlName();
  const L_M_TABLE = generateIlName();

  let out = `local ${L_M_TABLE}={};`;
  for (let i = 1; i <= 8; i++) {
    out += `${L_M_TABLE}[${i}]=${lightMath(Math.floor(Math.random() * 999))};`;
  }

  for (let i = 0; i < handlers.length; i++) {
    out += `local ${handlers[i]}=function(lM) `;
    if (i === realIdx) {
      out += innerCode;
    } else {
      out += generateJunk(5) + ` return lM;`;
    }
    out += ` end; `;
  }

  out += `local ${DISPATCH}={${handlers.join(",")}}; `;
  for (let i = 0; i < handlers.length; i++) {
    if (i !== realIdx) out += `${DISPATCH}[${i + 1}](${L_M_TABLE});`;
  }
  out += `${DISPATCH}[${realIdx + 1}](${L_M_TABLE});`;

  return out;
}

function generateProtections() {
  let p = "";
  // Aumentamos el tiempo a 5.2 para evitar falsos positivos por el lag de la propia VM
  p += `local _clk=os.clock;if _clk then local _st=_clk();for _=1,1000 do end;if _clk()-_st>5.2 then while true do end end end;`;
  p += `local _sc=string.char;local _t=type;local _ts=tostring;local _gm=getmetatable;`;
  p += `if _t(_gm)=="function"then local _mt=_gm("")if _t(_mt)=="table"and _mt.__index then while true do end end end;`;
  return p;
}

function obfuscate(sourceCode) {
  if (!sourceCode || typeof sourceCode !== 'string') return '--ERROR';

  let preProcessed = detectAndApplyMappings(sourceCode);
  
  // CIFRADO XOR SIMPLE
  const xorKey = Math.floor(Math.random() * 100) + 1;
  const bytes = preProcessed.split('').map(char => char.charCodeAt(0) ^ xorKey);

  const VM_DATA = generateIlName(), XOR_KEY = generateIlName();
  const PC = generateIlName(), STACK = generateIlName(), DECODER = generateIlName();

  let innerCode = '';
  // Convertimos los bytes ya cifrados en la tabla matemática
  innerCode += `local ${VM_DATA}=${stringToMath(bytes)};`;
  innerCode += `local ${XOR_KEY}=${xorKey};`;
  innerCode += `local ${PC}=1;local ${STACK}="";`;
  innerCode += `local ${DECODER}=function() while ${PC}<=#${VM_DATA} do `;
  // CORRECCIÓN CLAVE: Restamos el offset matemático antes de aplicar el XOR
  innerCode += `local _v = ${VM_DATA}[${PC}] - (${offsetA}*${offsetB}-${offsetA}); `;
  innerCode += `${STACK}=${STACK}..string.char(_v ^ ${XOR_KEY}); `;
  innerCode += `${PC}=${PC}+1; end; return ${STACK}; end; `;
  
  innerCode += generateProtections();
  innerCode += `local _p=(loadstring or load)(${DECODER}()); if _p then _p() end;`;

  let vm = HEADER + '\n';
  vm += generateJunk(20); // Bajamos un poco el junk inicial para estabilidad
  vm += buildVMWrapper(innerCode);
  vm += generateJunk(20);

  // Minificado
  vm = vm.replace(/\s+/g, ' ').replace(/\s*([=+\-*/{},;])\s*/g, '$1');
  return `return(function()${vm}end)();`;
}

module.exports = { obfuscate };
    
