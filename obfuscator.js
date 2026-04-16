const DISCORD = "https://discord.gg/5E45u5eES";
const HEADER = `--[[ MIMOSA ADVANCED VM v4.5 - ${DISCORD} ]]`;
const IL_POOL = ["I", "l", "1", "i"];

// Generador de nombres estilo IlIl
function generateIlName() {
  let name = "Il"; 
  const len = Math.floor(Math.random() * 8) + 6;
  for (let i = 0; i < len; i++) name += IL_POOL[Math.floor(Math.random() * IL_POOL.length)];
  return name + Math.floor(Math.random() * 999);
}

// Funciones matemáticas originales (Sin añadir nuevas)
function lightMath(n) {
  let a = Math.floor(Math.random() * 90) + 20, b = Math.floor(Math.random() * 60) + 10;
  return `(${n}+${a}*${b}-${a})`;
}

function stringToMath(str) {
  return `{${str.split('').map(c => lightMath(c.charCodeAt(0))).join(',')}}`;
}

function mba() {
  let n = Math.random() > 0.5 ? 1 : 2, a = Math.floor(Math.random() * 70) + 15, b = Math.floor(Math.random() * 40) + 8;
  return `((${n}*${a}-${a})/(${b}+1)+${n})`;
}

// Generador de Junk usando solo las funciones existentes
function generateJunk(lines = 10) {
  let j = '';
  for (let i = 0; i < lines; i++) {
    const r = Math.random();
    if (r < 0.5) j += `local ${generateIlName()}=${lightMath(Math.floor(Math.random() * 999))}; `;
    else j += `local ${generateIlName()}=${mba()}; `;
  }
  return j;
}

// Mapeo de instancias de Roblox
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
      if (tech.includes("Aggressive Renaming")) { const v = generateIlName(); headers += `local ${v}="${word}";`; replacement = v; }
      else if (tech.includes("String to Math")) replacement = `string.char(${stringToMath(word)})`;
      else if (tech.includes("Table Indirection")) { const t = generateIlName(); headers += `local ${t}={"${word}"};`; replacement = `${t}[1]`; }
      else if (tech.includes("Mixed Boolean Arithmetic")) replacement = `((${mba()}==1 or true)and"${word}")`;
      else if (tech.includes("Fake Flow")) replacement = `(function()return ${mba()}==1 and"${word}"or"${word}"end)()`;
      regex.lastIndex = 0;
      modified = modified.replace(regex, (match, prefix) => {
        if (prefix) return prefix.includes("game") ? `game[${replacement}]` : `[${replacement}]`;
        return replacement;
      });
    }
  }
  return headers + modified;
}

function obfuscate(sourceCode) {
  if (!sourceCode || typeof sourceCode !== 'string') return '--ERROR';
  
  // Pre-procesamiento con los mapeos originales
  let preProcessed = detectAndApplyMappings(sourceCode);
  const xorKey = Math.floor(Math.random() * 250) + 5;
  
  // Compilación a Opcodes para la VM
  const instructions = [];
  instructions.push(`{1,0,${xorKey}}`); // Op 1: SET KEY

  for (let i = 0; i < preProcessed.length; i++) {
    let encryptedByte = preProcessed.charCodeAt(i) ^ xorKey;
    instructions.push(`{2,1,${encryptedByte}}`); // Op 2: LOAD BYTE
    instructions.push(`{3,2,1,0}`);               // Op 3: XOR
    instructions.push(`{4,2}`);                   // Op 4: PUSH STACK
  }
  instructions.push(`{5}`); // Op 5: EXECUTE

  // Variables de la Máquina Virtual
  const regs = generateIlName(), pc = generateIlName(), stack = generateIlName();
  const bytecode = generateIlName(), handlers = generateIlName();

  let vm = HEADER + "\n";
  vm += `local bit_xor = bit32 and bit32.bxor or function(a,b) return a~b end; `;
  vm += generateJunk(20);
  
  vm += `local ${regs}={}; local ${pc}=1; local ${stack}=""; `;
  vm += `local ${bytecode}={${instructions.join(",")}}; `;
  
  // Handlers de la VM usando nombres ofuscados
  const h1=generateIlName(), h2=generateIlName(), h3=generateIlName(), h4=generateIlName(), h5=generateIlName();
  vm += `local function ${h1}(a) ${regs}[a[2]]=a[3] end; `; 
  vm += `local function ${h2}(a) ${regs}[a[2]]=a[3] end; `; 
  vm += `local function ${h3}(a) ${regs}[a[2]]=bit_xor(${regs}[a[3]],${regs}[a[4]]) end; `; 
  vm += `local function ${h4}(a) ${stack}=${stack}..string.char(${regs}[a[2]]) end; `; 
  vm += `local function ${h5}() local f=(loadstring or load)(${stack}); if f then f() end end; `;

  vm += `local ${handlers}={[1]=${h1},[2]=${h2},[3]=${h3},[4]=${h4},[5]=${h5}}; `;

  // Ciclo de ejecución principal
  vm += `while ${pc}<=#${bytecode} do `;
  vm += `local inst=${bytecode}[${pc}]; `;
  vm += `${handlers}[inst[1]](inst); `;
  vm += `${pc}=${pc}+1; `;
  vm += `end; `;

  vm += generateJunk(20);

  // Minificación final
  const wrapper = generateIlName();
  let finalScript = `local function ${wrapper}() ${vm} end ${wrapper}();`;
  finalScript = finalScript.replace(/\s+/g, ' ').replace(/\s*([=+\-*/{},;])\s*/g, '$1');

  return finalScript;
}

module.exports = { obfuscate };
