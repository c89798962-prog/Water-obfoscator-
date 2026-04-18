const DISCORD = "https://discord.gg/5E45u5eES";
const HEADER = `--[[ MIMOSA VM v4.5 - ${DISCORD} - 15KB ]]`;
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

  let out = '';

  out += `local lM={`;
  for (let i = 1; i <= 8; i++) {
    out += `[${i}]=${lightMath(Math.floor(Math.random() * 999))},`;
  }
  out += `};`;
  out += `local lM=lM;`; 

  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) {
      out += `local ${handlers[i]}=function(lM)`;
      out += `local lM=lM;`;
      out += generateJunk(8);
      out += innerCode;
      out += `end;`;
    } else {
      const junkCount = 3 + Math.floor(Math.random() * 6);
      out += `local ${handlers[i]}=function(lM)`;
      out += `local lM=lM;`;
      out += generateJunk(junkCount);
      out += `return lM;`;
      out += `end;`;
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

function obfuscate(sourceCode) {
  if (!sourceCode || typeof sourceCode !== 'string') return '--ERROR';

  let preProcessed = detectAndApplyMappings(sourceCode);
  const seed = Date.now() + Math.random() * 99999999;
  const xorKeyBase = Math.floor(seed % 2147483647) + 1;
  const bytes = preProcessed.split('').map((char, i) => {
    let val = char.charCodeAt(0) ^ (xorKeyBase + i * 5);
    val = val ^ (xorKeyBase >>> 4);
    return val & 0xFF;
  });

  const VM_DATA = generateIlName(), XOR_KEY = generateIlName();
  const PC = generateIlName(), STACK = generateIlName(), DECODER = generateIlName();

  let innerCode = '';
  innerCode += `local ${VM_DATA}=${stringToMath(JSON.stringify(bytes))};`;
  innerCode += `local ${XOR_KEY}=${mba()};`;
  innerCode += `local ${PC}=1;local ${STACK}="";`;
  innerCode += `local ${DECODER}=function()`;
  innerCode += generateJunk(20);
  innerCode += `while ${PC}<=#${VM_DATA} do `;
  innerCode += `local lM=${VM_DATA}[${PC}];`; 
  // OJO AQUÍ: Este es un problema para Roblox
  innerCode += `${STACK}=${STACK}..string.char(lM~${XOR_KEY});`;
  innerCode += `${PC}=${PC}+1;`;
  innerCode += `end;return ${STACK};end;`;
  // OJO AQUÍ TAMBIÉN: Otro problema para Roblox
  innerCode += `local payload=(loadstring or load)(${DECODER}());payload();`;

  let vm = HEADER + '\n';
  vm += generateJunk(144);
  vm += buildVMWrapper(innerCode);
  vm += generateJunk(126);

  vm = vm.replace(/\n/g, ' ').replace(/\s+/g, ' ').replace(/\s*([=+\-*/{},;])\s*/g, '$1');
  return `return(function()${vm}end)();`;
}

module.exports = { obfuscate };
        
