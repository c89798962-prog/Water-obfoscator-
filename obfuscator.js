const HEADER = `--[[ this code it's protected by vvmer obfoscator ]]`

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
  if (Math.random() < 0.8) return n.toString();
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
      if (tech.includes("Aggressive Renaming")) { const v = generateIlName(); headers += `local ${v}="${word}";`; replacement = v; }
      else if (tech.includes("String to Math")) replacement = `string.char(${word.split('').map(c => heavyMath(c.charCodeAt(0))).join(',')})`;
      else if (tech.includes("Mixed Boolean Arithmetic")) replacement = `((${mba()}==1 or true)and"${word}")`;
      regex.lastIndex = 0;
      modified = modified.replace(regex, (match) => `game[${replacement}]`);
    }
  }
  return headers + modified;
}

// 4. PREDICADOS OPACOS (Integrados en la función de Junk)
function opaqueFalse() {
  const arr = [`type(nil)=="number"`, `tostring(nil)=="1"`, `type(1)=="table"`];
  return arr[Math.floor(Math.random()*arr.length)];
}

function generateJunk(lines = 100) {
  let j = ''
  for (let i = 0; i < lines; i++) {
    const r = Math.random()
    if (r < 0.3) j += `local ${generateIlName()}=${heavyMath(Math.floor(Math.random() * 999))} `
    else if (r < 0.6) j += `local ${generateIlName()}=string.char(${heavyMath(Math.floor(Math.random()*255))}) `
    else j += `if ${opaqueFalse()} then local x=1 end ` // Aplicado Opaque Predicate aquí
  }
  return j
}

function applyCFF(blocks) {
  const stateVar = generateIlName()
  let lua = `local ${stateVar}=${heavyMath(1)} while true do `
  for (let i = 0; i < blocks.length; i++) {
    if (i === 0) lua += `if ${stateVar}==${heavyMath(1)} then ${blocks[i]} ${stateVar}=${heavyMath(2)} `
    else lua += `elseif ${stateVar}==${heavyMath(i + 1)} then ${blocks[i]} ${stateVar}=${heavyMath(i + 2)} `
  }
  lua += `elseif ${stateVar}==${heavyMath(blocks.length + 1)} then break end end `
  return lua
}

function runtimeString(str) {
  return `string.char(${str.split('').map(c => heavyMath(c.charCodeAt(0))).join(',')})`;
}

// 1, 2 Y 3. INTEGRADOS EN TRUE VM (Cifrado Rolling, Símbolos Dinámicos y Corrupción Silenciosa)
function buildTrueVM(payloadStr) {
  const STACK = generateIlName(); const KEY = generateIlName(); const ORDER = generateIlName();
  const SALT = generateIlName(); const MAP = generateIlName();
  
  const seed = Math.floor(Math.random() * 200) + 50;
  const salt = Math.floor(Math.random() * 200) + 10;

  // 2. Codificación por Símbolos Dinámicos (Base-10 de 3 símbolos)
  const charPool = ">#_</$|^!@%?=+-*:.;,(){}[]".split('');
  charPool.sort(() => Math.random() - 0.5);
  const sym10 = charPool.slice(0, 10).join('');

  function enc3(b) {
    return sym10[Math.floor(b/100)] + sym10[Math.floor((b/10)%10)] + sym10[b%10];
  }

  let vmCore = `local ${STACK}={} local ${KEY}=${heavyMath(seed)} local ${SALT}=${heavyMath(salt)} `
  vmCore += `local ${MAP}={}; for i=1,10 do ${MAP}[string.sub("${sym10}",i,i)]=i-1 end `;

  const chunkSize = 15; let realChunks = [];
  for(let i = 0; i < payloadStr.length; i += chunkSize) { realChunks.push(payloadStr.slice(i, i + chunkSize)); }
  let poolVars = []; let realOrder = [];
  let totalChunks = realChunks.length * 3; let currentReal = 0;

  for(let i = 0; i < totalChunks; i++) {
    let memName = generateIlName(); poolVars.push(memName);
    if (currentReal < realChunks.length && (Math.random() > 0.5 || (totalChunks - i) === (realChunks.length - currentReal))) {
      realOrder.push(i + 1);
      let chunk = realChunks[currentReal];
      let encodedStr = "";
      for(let j = 0; j < chunk.length; j++) {
        // 1. Algoritmo Rolling Affine Cipher
        let encrypted = (chunk.charCodeAt(j) + seed + j * salt) % 256;
        encodedStr += enc3(encrypted); // Empaquetado con los símbolos
      }
      vmCore += `local ${memName}="${encodedStr}" `;
      currentReal++;
    } else {
      let fakeLen = Math.floor(Math.random() * 20) + 5;
      let fakeStr = "";
      for(let j = 0; j < fakeLen; j++) {
        fakeStr += enc3(Math.floor(Math.random() * 255));
      }
      vmCore += `local ${memName}="${fakeStr}" `;
    }
  }
  
  vmCore += `local _pool={${poolVars.join(',')}} local ${ORDER}={${realOrder.map(n => heavyMath(n)).join(',')}} `;
  
  const idxVar = generateIlName();
  
  // 3. Corrupción Silenciosa (Si se detecta manipulación, cambia la clave en lugar de lanzar error)
  const SILENT_CORRUPT = `if type(tostring)~="function" then ${KEY}=(${KEY}+173)%256 end `; 

  vmCore += `for _, ${idxVar} in ipairs(${ORDER}) do local _str=_pool[${idxVar}]; local _j=0; for _i=1,#_str,3 do `;
  vmCore += SILENT_CORRUPT;
  vmCore += `local _c0=${MAP}[string.sub(_str,_i,_i)] or 0 local _c1=${MAP}[string.sub(_str,_i+1,_i+1)] or 0 local _c2=${MAP}[string.sub(_str,_i+2,_i+2)] or 0 `;
  vmCore += `local _b=_c0*100+_c1*10+_c2 `;
  // Lógica de Descifrado Rolling Affine
  vmCore += `table.insert(${STACK}, string.char(math.floor((_b - ${KEY} - _j * ${SALT}) % 256))) _j=_j+1 end end `;

  vmCore += `local _e = table.concat(${STACK}) ${STACK}=nil `;
  
  const ASSERT = `getfenv()[${runtimeString("assert")}]`;
  const LOADSTRING = `getfenv()[${runtimeString("loadstring")}]`;
  const GAME = `getfenv()[${runtimeString("game")}]`;
  const HTTPGET = runtimeString("HttpGet");
  if (payloadStr.includes("http")) { vmCore += `${ASSERT}(${LOADSTRING}(${GAME}[${HTTPGET}](${GAME}, _e)))() ` } 
  else { vmCore += `${ASSERT}(${LOADSTRING}(_e))() ` }
  return vmCore
}

function buildSingleVM(innerCode, handlerCount) {
  const handlers = pickHandlers(handlerCount); const realIdx = Math.floor(Math.random() * handlerCount);
  const DISPATCH = generateIlName(); let out = `local lM={} ` 
  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) { out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunk(5)} ${innerCode} end ` } 
    else { out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunk(3)} return nil end ` }
  }
  out += `local ${DISPATCH}={`
  for (let i = 0; i < handlers.length; i++) { out += `[${heavyMath(i + 1)}]=${handlers[i]},` }
  out += `} `
  let execBlocks = []; for (let i = 0; i < handlers.length; i++) { execBlocks.push(`${DISPATCH}[${heavyMath(i + 1)}](lM)`) }
  out += applyCFF(execBlocks); return out
}

// EXACTAMENTE 3 VM MACHINES: 1 TrueVM + 2 capas SingleVM
function build3xVM(payloadStr) {
  let vm = buildTrueVM(payloadStr);
  for (let i = 0; i < 2; i++) { // 2 iteraciones + 1 TrueVM = 3 VMs
    vm = buildSingleVM(vm, Math.floor(Math.random() * 2) + 3); 
  }
  return vm;
}

function getExtraProtections() {
  const antiDebuggers =
    `local _adT=os.clock() for _=1,150000 do end if os.clock()-_adT>5.0 then while true do end end ` +
    `if debug~=nil and debug.getinfo then local _i=debug.getinfo(1) if _i.what~="main" and _i.what~="Lua" then while true do end end end ` +
    `local _adOk,_adE=pcall(function() error("__v") end) if not string.find(tostring(_adE),"__v") then while true do end end ` +
    `if getmetatable(_G)~=nil then while true do end end ` +
    `if type(print)~="function" then while true do end end `;

  const antiTampers =
    `if math.pi<3.14 or math.pi>3.15 then while true do end end ` +
    `if bit32 and bit32.bxor(10,5)~=15 then while true do end end ` +
    `if type(tostring)~="function" then while true do end end ` +
    `if not string.match("chk","^c.*k$") then while true do end end ` +
    `if type(coroutine.create)~="function" then while true do end end ` +
    `if type(table.concat)~="function" then while true do end end ` +
    `local _tm1=os.time() local _tm2=os.time() if _tm2<_tm1 then while true do end end ` +
    `if math.abs(-10)~=10 then while true do end end ` +
    `if gcinfo and gcinfo()<0 then while true do end end ` +
    `if type(next)~="function" then while true do end end ` +
    `if string.len("a")~=1 then while true do end end ` +
    `if type(table.insert)~="function" then while true do end end `;

  return antiDebuggers + antiTampers;
}

function obfuscate(sourceCode) {
  if (!sourceCode) return '--ERROR'
  const antiDebug = `local _clk=os.clock local _t=_clk() for _=1,150000 do end if os.clock()-_t>5.0 then while true do end end `
  const extraProtections = getExtraProtections()
  let payloadToProtect = ""
  const isLoadstringRegex = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i
  const match = sourceCode.match(isLoadstringRegex)
  if (match) { payloadToProtect = match[1] } 
  else { payloadToProtect = detectAndApplyMappings(sourceCode) }
  
  // Llamamos a las 3 VMs en lugar de 18
  const finalVM = build3xVM(payloadToProtect)
  const result = `${HEADER} ${generateJunk(50)} ${antiDebug} ${extraProtections} ${finalVM}`
  return result.replace(/\s+/g, " ").trim()
}

module.exports = { obfuscate }
        
