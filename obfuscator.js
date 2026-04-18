const DISCORD = "https://discord.gg/UttE8VYAY"
const HEADER = `--[[ water obfoscator EXTREME FINAL : ${DISCORD} ]]`

const IL_POOL = ["IIIIIIII1", "vvvvvv1", "vvvvvvvv2", "vvvvvv3", "IIlIlIlI1", "lvlvlvlv2", "I1","l1","v1","v2","v3","II","ll","vv", "I2"]
const HANDLER_POOL = ["KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD"]

function generateIlName() {
  return IL_POOL[Math.floor(Math.random() * IL_POOL.length)] + Math.floor(Math.random() * 99999)
}

function pickHandlers(count) {
  const used = new Set()
  const result = []
  while (result.length < count) {
    const base = HANDLER_POOL[Math.floor(Math.random() * HANDLER_POOL.length)]
    const name = base + Math.floor(Math.random() * 99)
    if (!used.has(name)) { used.add(name); result.push(name) }
  }
  return result
}

function heavyMath(n) {
  let a = Math.floor(Math.random() * 3000) + 500
  let b = Math.floor(Math.random() * 50) + 2
  let c = Math.floor(Math.random() * 800) + 10
  let d = Math.floor(Math.random() * 20) + 2
  return `(((((${n}+${a})*${b})/${b})-${a})+((${c}*${d})/${d})-${c})`
}

function mba() {
  let n = Math.random() > 0.5 ? 1 : 2, a = Math.floor(Math.random() * 70) + 15, b = Math.floor(Math.random() * 40) + 8;
  return `((${n}*${a}-${a})/(${b}+1)+${n})`;
}

function generateJunk(lines = 100) {
  let j = ''
  for (let i = 0; i < lines; i++) {
    const r = Math.random()
    if (r < 0.3) j += `local ${generateIlName()}=${heavyMath(Math.floor(Math.random() * 999))} `
    else if (r < 0.6) j += `local ${generateIlName()}=string.char(${heavyMath(Math.floor(Math.random()*255))}) `
    else j += `if not(${heavyMath(1)}==${heavyMath(1)}) then local x=1 end `
  }
  return j
}

// PROTECCIÓN DE HUB: Mapeo agresivo de API de Roblox
const MAPEO = {
  "ScreenGui":"Aggressive Renaming","Frame":"String to Math","TextLabel":"Table Indirection",
  "TextButton":"Mixed Boolean Arithmetic","Humanoid":"Dynamic Junk","Player":"Fake Flow",
  "RunService":"Virtual Machine","TweenService":"Fake Flow","Players":"Fake Flow"
};

function detectAndApplyMappings(code) {
  let modified = code, headers = "";
  for (const [word, tech] of Object.entries(MAPEO)) {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    if (regex.test(modified)) {
      let replacement = `"${word}"`;
      if (tech === "Aggressive Renaming") { const v = generateIlName(); headers += `local ${v}="${word}";`; replacement = v; }
      else if (tech === "String to Math") replacement = `string.char(${word.split('').map(c => heavyMath(c.charCodeAt(0))).join(',')})`;
      regex.lastIndex = 0;
      modified = modified.replace(regex, (match) => `game[${replacement}]`);
    }
  }
  return headers + modified;
}

function applyCFF(blocks) {
  const stateVar = generateIlName()
  let lua = `local ${stateVar}=${heavyMath(1)} while true do `
  for (let i = 0; i < blocks.length; i++) {
    lua += `if ${stateVar}==${heavyMath(i + 1)} then ${blocks[i]} ${stateVar}=${heavyMath(i + 2)} `
  }
  lua += `elseif ${stateVar}==${heavyMath(blocks.length + 1)} then break end end `
  return lua
}

// TRUE VM: URL dividida, envuelta y reconstruida con llave XOR mutante
function buildTrueVM(urlStr) {
  const STACK = generateIlName(); const PTR = generateIlName();
  const CHUNK_IDX = generateIlName(); const KEY = generateIlName();
  
  const p = Math.ceil(urlStr.length / 4);
  const chunks = [urlStr.slice(0, p), urlStr.slice(p, p*2), urlStr.slice(p*2, p*3), urlStr.slice(p*3)];
  const seed = Math.floor(Math.random() * 150) + 50;

  let vmCore = `local ${STACK}={} local ${KEY}=${heavyMath(seed)} `;
  let memVars = [];
  let globalPos = 0;

  chunks.forEach((chunk) => {
    if (!chunk) return;
    const memName = generateIlName();
    memVars.push(memName);
    const enc = chunk.split('').map(c => {
      let b = c.charCodeAt(0) ^ (seed + globalPos * 2);
      globalPos++;
      return b;
    });
    vmCore += `local ${memName}={${enc.map(b => heavyMath(b)).join(',')}} `;
  });

  vmCore += `local _pool={${memVars.join(',')}} local _pos=0 `;
  vmCore += `for ${CHUNK_IDX}=1,#_pool do local _m=_pool[${CHUNK_IDX}] `;
  vmCore += `for ${PTR}=1,#_m do `;
  vmCore += `table.insert(${STACK}, string.char(bit32.bxor(_m[${PTR}], ${KEY}+(_pos*2)))) `;
  vmCore += `_pos=_pos+1 end end `;
  vmCore += `local _res=table.concat(${STACK}) ${STACK}=nil `;
  vmCore += `assert(loadstring(game:HttpGet(_res)))() `;
  
  return vmCore;
}

function buildDoubleVM(urlStr) {
  const innerVM = buildTrueVM(urlStr);
  const handlers = pickHandlers(7);
  const realIdx = Math.floor(Math.random() * 7);
  const DISPATCH = generateIlName();
  
  let out = `local lM={} `;
  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunk(10)} ${innerVM} end `;
    else out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunk(5)} end `;
  }
  out += `local ${DISPATCH}={`
  for (let i = 0; i < handlers.length; i++) out += `[${heavyMath(i + 1)}]=${handlers[i]},`
  out += `} `
  let exec = handlers.map((_, i) => `${DISPATCH}[${heavyMath(i+1)}](lM)`);
  out += applyCFF(exec);
  return out;
}

function obfuscate(sourceCode) {
  if (!sourceCode) return '--ERROR';
  const antiDebug = `local _c=os.clock local _t=_c() for _=1,150000 do end if os.clock()-_t>5.5 then while true do end end `;
  
  let urlMatch = sourceCode.match(/loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i);
  let finalPayload = urlMatch ? urlMatch[1] : detectAndApplyMappings(sourceCode);

  const finalVM = buildDoubleVM(finalPayload);
  return `${HEADER} ${generateJunk(50)} ${antiDebug} ${finalVM}`.replace(/\s+/g, " ").trim();
}

module.exports = { obfuscate };
                                  
