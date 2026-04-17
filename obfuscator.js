const DISCORD = "https://discord.gg/5E45u5eES"
const HEADER = `--[[ protected by water obfoscator ]]`
const HANDLER_POOL = ["KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD","Kp","Hx","Wn","Sr","Rm","Nz","Jf","Ug"]

// Ahora los nombres son predecibles para evitar fallos de concatenación
function generateIlName() {
  return "v_" + Math.floor(Math.random() * 999999);
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

function lightMath(n) {
  let a = Math.floor(Math.random() * 50) + 10;
  return `(${n}+${a}-${a})`; 
}

function mba() {
  return `((1*2-2)/5+1)`;
}

function generateJunk(lines = 10) {
  let j = '';
  for (let i = 0; i < lines; i++) {
    j += `local ${generateIlName()}=${Math.floor(Math.random() * 1000)} `;
  }
  return j;
}

const MAPEO = {
  "ScreenGui":"Aggressive Renaming","Frame":"String to Math","TextLabel":"Table Indirection",
  "TextButton":"Mixed Boolean Arithmetic","TextBox":"Aggressive Renaming","Humanoid":"Dynamic Junk",
  "Player":"Fake Flow","Workspace":"Reverse If","Players":"Fake Flow"
};

function detectAndApplyMappings(code) {
  let modified = code, headers = "";
  const sorted = Object.entries(MAPEO).sort((a, b) => b[0].length - a[0].length);
  for (const [word, tech] of sorted) {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    if (regex.test(modified)) {
      let replacement = `"${word}"`;
      if (tech.includes("String to Math")) replacement = `(function() return "${word}" end)()`;
      else if (tech.includes("Table Indirection")) {
        const t = generateIlName();
        headers += `local ${t}={"${word}"} `;
        replacement = `${t}[1]`;
      }
      modified = modified.replace(regex, (match) => `[${replacement}]`);
    }
  }
  return headers + modified;
}

function buildVMWrapper(innerCode) {
  const handlers = pickHandlers(5);
  const realIdx = 2;
  const DISPATCH = "Dispatcher";
  let out = `local lM={} `;

  for (let i = 0; i < handlers.length; i++) {
    out += `local ${handlers[i]}=function(lM) `;
    if (i === realIdx) { out += innerCode; } 
    else { out += `return lM `; }
    out += `end `;
  }

  out += `local ${DISPATCH}={`
  for (let i = 0; i < handlers.length; i++) { out += `[${i + 1}]=${handlers[i]},`; }
  out += `} `;
  out += `${DISPATCH}[${realIdx + 1}](lM) `;
  return out;
}

function minify(code) {
  return code.replace(/\s+/g, " ").trim();
}

function obfuscate(sourceCode) {
  if (!sourceCode) return '--ERROR';

  let preProcessed = detectAndApplyMappings(sourceCode);
  
  // Cifrado compatible
  const key = Math.floor(Math.random() * 100) + 1;
  const bytes = preProcessed.split('').map(char => char.charCodeAt(0) + key);

  const VM_DATA = "DataStream";
  const DECODER = "Processor";

  let innerCode = '';
  // Convertimos a formato de tabla Lua directamente {1,2,3}
  innerCode += `local ${VM_DATA}={${bytes.join(',')}} `;
  innerCode += `local ${DECODER}=function() `;
  innerCode += `local s="" for i=1,#${VM_DATA} do s=s..string.char(${VM_DATA}[i]-${key}) end return s end `;
  innerCode += `local run=(loadstring or load)(${DECODER}()) if run then run() end `;

  let vm = HEADER + "\n" + generateJunk(20);
  vm += buildVMWrapper(innerCode);
  vm += generateJunk(20);

  // Devolvemos el código para ejecución directa (sin el return function que lo bloqueaba)
  return minify(vm);
}

module.exports = { obfuscate };
