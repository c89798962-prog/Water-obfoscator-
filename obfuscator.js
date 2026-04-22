/**
 * VVMER OBFUSCATOR - DUAL MODE (FUSIONADO)
 * Normal: 18x VM + Mapeos + Protecciones estándar
 * Diabolical: ULTRA MODE (150 VM frágiles, 40% menos matemáticas, 20 anti-tamper, 246KB)
 */

const HEADER = `--[[ this code it's protected by vmmer obfoscator ]]`;

const IL_POOL = ["IIIIIIII1", "vvvvvv1", "vvvvvvvv2", "vvvvvv3", "IIlIlIlI1", "lvlvlvlv2", "I1","l1","v1","v2","v3","II","ll","vv", "I2"];
const HANDLER_POOL = ["KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD"];

// ==================== FUNCIONES AUXILIARES COMUNES ====================

function generateIlName() {
  return IL_POOL[Math.floor(Math.random() * IL_POOL.length)] + Math.floor(Math.random() * 999999);
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

function runtimeString(str) {
  return `string.char(${str.split('').map(c => heavyMathUltra(c.charCodeAt(0))).join(',')})`;
}

function applyCFF(blocks) {
  const stateVar = generateIlName();
  let lua = `local ${stateVar}=${heavyMathUltra(1)} while true do `;
  for (let i = 0; i < blocks.length; i++) {
    if (i === 0) lua += `if ${stateVar}==${heavyMathUltra(1)} then ${blocks[i]} ${stateVar}=${heavyMathUltra(2)} `;
    else         lua += `elseif ${stateVar}==${heavyMathUltra(i + 1)} then ${blocks[i]} ${stateVar}=${heavyMathUltra(i + 2)} `;
  }
  lua += `elseif ${stateVar}==${heavyMathUltra(blocks.length + 1)} then break end end `;
  return lua;
}

// ==================== VERSIONES PARA MODO DIABOLICAL (ULTRA REDUCIDO) ====================

// Reducido en un 40% respecto a la versión ultra original
function heavyMathUltra(n) {
  if (Math.random() < 0.2) return n.toString();
  let a = Math.floor(Math.random() * 5000) + 1000;
  let b = Math.floor(Math.random() * 100) + 2;
  let c = Math.floor(Math.random() * 800) + 10;
  // 40% menos operaciones: eliminamos d,e,f y sus combinaciones
  return `(((((${n}+${a})*${b})/${b})-${a})+((${c}*${c})/${c})-${c})`;
}

function mbaUltra() {
  let n = Math.random() > 0.5 ? 1 : 2, a = Math.floor(Math.random() * 70) + 15, b = Math.floor(Math.random() * 40) + 8;
  // Simplificado (40% menos): eliminamos multiplicación y división final
  return `((${n}*${a}-${a})/(${b}+1)+${n})`;
}

function generateJunkUltra(lines = 100) {
  let j = '';
  for (let i = 0; i < lines; i++) {
    const r = Math.random();
    if (r < 0.2) j += `local ${generateIlName()}=${heavyMathUltra(Math.floor(Math.random() * 999))} `;
    else if (r < 0.4) j += `local ${generateIlName()}=string.char(${heavyMathUltra(Math.floor(Math.random()*255))}) `;
    else if (r < 0.5) j += `if not(${heavyMathUltra(1)}==${heavyMathUltra(1)}) then local x=1 end `;
    else if (r < 0.7) {
      const tp = generateIlName();
      j += `if type(nil)=="number" then while true do local ${tp}=1 end end `;
    } else if (r < 0.85) {
      const vt = generateIlName();
      j += `do local ${vt}={} ${vt}["_"]=1 ${vt}=nil end `;
    } else {
      j += `if type(math.pi)=="string" then local _=1 end `;
    }
  }
  return j;
}

function detectAndApplyMappingsUltra(code) {
  const MAPEO = {
    "ScreenGui":"Aggressive Renaming","Frame":"String to Math","TextLabel":"Table Indirection",
    "TextButton":"Mixed Boolean Arithmetic","Humanoid":"Dynamic Junk","Player":"Fake Flow",
    "RunService":"Virtual Machine","TweenService":"Fake Flow","Players":"Fake Flow"
  };
  let modified = code, headers = "";
  for (const [word, tech] of Object.entries(MAPEO)) {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    if (regex.test(modified)) {
      let replacement = `"${word}"`;
      if (tech.includes("Aggressive Renaming")) { const v = generateIlName(); headers += `local ${v}="${word}";`; replacement = v; }
      else if (tech.includes("String to Math")) replacement = `string.char(${word.split('').map(c => heavyMathUltra(c.charCodeAt(0))).join(',')})`;
      else if (tech.includes("Mixed Boolean Arithmetic")) replacement = `((${mbaUltra()}==1 or true)and"${word}")`;
      regex.lastIndex = 0;
      modified = modified.replace(regex, () => `game[${replacement}]`);
    }
  }
  return headers + modified;
}

function buildTrueVMUltra(payloadStr) {
  const STACK = generateIlName(); const KEY = generateIlName(); const SALT = generateIlName();
  const seed = Math.floor(Math.random() * 200) + 50;
  const saltVal = Math.floor(Math.random() * 250) + 1;
  let vmCore = `local ${STACK}={} local ${KEY}=${heavyMathUltra(seed)} local ${SALT}=${heavyMathUltra(saltVal)} `;
  const chunkSize = 15; let realChunks = [];
  for(let i = 0; i < payloadStr.length; i += chunkSize) { realChunks.push(payloadStr.slice(i, i + chunkSize)); }
  let poolVars = []; let realOrder = [];
  let totalChunks = realChunks.length * 3; let currentReal = 0; let globalIndex = 0;
  for(let i = 0; i < totalChunks; i++) {
    let memName = generateIlName(); poolVars.push(memName);
    if (currentReal < realChunks.length && (Math.random() > 0.5 || (totalChunks - i) === (realChunks.length - currentReal))) {
      realOrder.push(i + 1);
      let chunk = realChunks[currentReal]; let encryptedBytes = [];
      for(let j = 0; j < chunk.length; j++) {
        let enc = (chunk.charCodeAt(j) + seed + (globalIndex * saltVal)) % 256;
        encryptedBytes.push(heavyMathUltra(enc));
        globalIndex++;
      }
      vmCore += `local ${memName}={${encryptedBytes.join(',')}} `;
      currentReal++;
    } else {
      let fakeBytes = []; let fakeLen = Math.floor(Math.random() * 20) + 5;
      for(let j = 0; j < fakeLen; j++) { fakeBytes.push(heavyMathUltra(Math.floor(Math.random() * 255))); }
      vmCore += `local ${memName}={${fakeBytes.join(',')}} `;
    }
  }
  vmCore += `local _pool={${poolVars.join(',')}} local _order={${realOrder.map(n => heavyMathUltra(n)).join(',')}} `;
  vmCore += `local _gIdx=0 for _, idx in ipairs(_order) do for _, byte in ipairs(_pool[idx]) do `;
  vmCore += `if type(math.pi)=="string" then ${KEY}=(${KEY}+137)%256 end `;
  vmCore += `table.insert(${STACK}, string.char(math.floor((byte - ${KEY} - _gIdx * ${SALT}) % 256))) _gIdx=_gIdx+1 end end `;
  vmCore += `local _e = table.concat(${STACK}) ${STACK}=nil `;
  const ASSERT     = `getfenv()[${runtimeString("assert")}]`;
  const LOADSTRING = `getfenv()[${runtimeString("loadstring")}]`;
  const GAME       = `getfenv()[${runtimeString("game")}]`;
  const HTTPGET    = runtimeString("HttpGet");
  if (payloadStr.includes("http")) { vmCore += `${ASSERT}(${LOADSTRING}(${GAME}[${HTTPGET}](${GAME}, _e)))() `; }
  else { vmCore += `${ASSERT}(${LOADSTRING}(_e))() `; }
  return vmCore;
}

function buildSingleVMNormalUltra(innerCode, handlerCount) {
  const handlers = pickHandlers(handlerCount);
  const realIdx  = Math.floor(Math.random() * handlerCount);
  const DISPATCH = generateIlName();
  let out = `local lM={} `;
  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) { out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunkUltra(5)} ${innerCode} end `; }
    else               { out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunkUltra(3)} return nil end `; }
  }
  out += `local ${DISPATCH}={`;
  for (let i = 0; i < handlers.length; i++) { out += `[${heavyMathUltra(i + 1)}]=${handlers[i]},`; }
  out += `} `;
  const execBlocks = [];
  for (let i = 0; i < handlers.length; i++) { execBlocks.push(`${DISPATCH}[${heavyMathUltra(i + 1)}](lM)`); }
  out += applyCFF(execBlocks);
  return out;
}

function getUltraProtections() {
  const antiDebuggers =
    `local _adT=os.clock() for _=1,150000 do end if os.clock()-_adT>5.0 then while true do end end ` +
    `if debug~=nil and debug.getinfo then local _i=debug.getinfo(1) if _i.what~="main" and _i.what~="Lua" then while true do end end end ` +
    `if debug and debug.sethook then debug.sethook(function() while true do end end, "l", 5) end `;

  const rawTampers = [
    `if math.pi<3.14 or math.pi>3.15 then _err() end`,
    `if bit32 and bit32.bxor(10,5)~=15 then _err() end`,
    `if type(tostring)~="function" then _err() end`,
    `if not string.match("chk","^c.*k$") then _err() end`,
    `local _tm1=os.time() local _tm2=os.time() if _tm2<_tm1 then _err() end`,
    `if math.abs(-10)~=10 then _err() end`,
    `if string.char(65)~="A" then _err() end`,
    `if type({})~="table" then _err() end`,
    `if type(1)~="number" then _err() end`,
    `if type("a")~="string" then _err() end`,
    `if type(true)~="boolean" then _err() end`,
    `if type(nil)~="nil" then _err() end`,
    `if type(function() end)~="function" then _err() end`,
    `if type(coroutine.create(function() end))~="thread" then _err() end`,
    `if type(io)~="userdata" then _err() end`,
    `if type(game)~="userdata" then _err() end`,
    `if type(workspace)~="userdata" then _err() end`,
    `if type(script)~="userdata" then _err() end`,
    `if type(Instance)~="function" then _err() end`,
    `if type(getfenv)~="function" then _err() end`,
    `if type(setfenv)~="function" then _err() end`
  ];

  let codeVaultGuards = "";
  for (const t of rawTampers) {
    const fnName  = generateIlName();
    const errName = generateIlName();
    codeVaultGuards += `local ${fnName}=function() local ${errName}=error ${t.replace("_err()", `${errName}("!")`)} end ${fnName}() `;
  }

  return antiDebuggers + codeVaultGuards;
}

// PROFUNDIDAD REDUCIDA DE 200 A 150 (50 VM menos)
function buildFragileVM(innerCode, depth = 0) {
  if (depth >= 150) return innerCode;  // <-- Cambio aquí

  const vmName = generateIlName();
  const handlerCount = Math.floor(Math.random() * 5) + 3;
  const handlers = pickHandlers(handlerCount);
  const realIdx = Math.floor(Math.random() * handlerCount);
  const DISPATCH = generateIlName();

  let out = `local ${vmName}={} `;
  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) {
      out += `local ${handlers[i]}=function(${vmName}) `;
      out += `local _chk="${generateIlName()}" `;
      out += `if ${vmName}[${heavyMathUltra(1)}]~=nil then error("VM corrupted") end `;
      out += `${generateJunkUltra(5)} `;
      out += buildFragileVM(innerCode, depth + 1);
      out += ` end `;
    } else {
      out += `local ${handlers[i]}=function(${vmName}) ${generateJunkUltra(3)} return nil end `;
    }
  }

  out += `local ${DISPATCH}={`;
  for (let i = 0; i < handlers.length; i++) {
    out += `[${heavyMathUltra(i + 1)}]=${handlers[i]},`;
  }
  out += `} `;

  const execBlocks = [];
  for (let i = 0; i < handlers.length; i++) {
    execBlocks.push(`${DISPATCH}[${heavyMathUltra(i + 1)}](${vmName})`);
  }
  out += applyCFF(execBlocks);
  return out;
}

function obfuscateDiabolical(sourceCode) {
  if (!sourceCode) return '-- Error: No Source';

  const extraProtections = getUltraProtections();

  let payloadToProtect = "";
  const isLoadstringRegex = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i;
  const match = sourceCode.match(isLoadstringRegex);
  if (match) { payloadToProtect = match[1]; }
  else       { payloadToProtect = detectAndApplyMappingsUltra(sourceCode); }

  let vm = buildTrueVMUltra(payloadToProtect);
  vm = buildFragileVM(vm, 0);

  let finalCode = `${HEADER} ${generateJunkUltra(50)} ${extraProtections} ${vm}`.replace(/\s+/g, " ").trim();
  const targetSize = 246 * 1024;
  let currentSize = Buffer.byteLength(finalCode, 'utf8');

  if (currentSize < targetSize) {
    const neededBytes = targetSize - currentSize;
    const junkPerLine = 50;
    const additionalLines = Math.ceil(neededBytes / junkPerLine);
    finalCode = `${HEADER} ${generateJunkUltra(50 + additionalLines)} ${extraProtections} ${vm}`.replace(/\s+/g, " ").trim();
  }

  return finalCode;
}

// ==================== VERSIONES PARA MODO NORMAL (SIN CAMBIOS) ====================

function heavyMathNormal(n) {
  if (Math.random() < 0.3) return n.toString();
  let a = Math.floor(Math.random() * 5000) + 1000;
  let b = Math.floor(Math.random() * 100) + 2;
  let c = Math.floor(Math.random() * 800) + 10;
  let d = Math.floor(Math.random() * 20) + 2;
  return `(((((${n}+${a})*${b})/${b})-${a})+((${c}*${d})/${d})-${c})`;
}

function mbaNormal() {
  let n = Math.random() > 0.5 ? 1 : 2, a = Math.floor(Math.random() * 70) + 15, b = Math.floor(Math.random() * 40) + 8;
  return `((${n}*${a}-${a})/(${b}+1)+${n})`;
}

function generateJunkNormal(lines = 100) {
  let j = '';
  for (let i = 0; i < lines; i++) {
    const r = Math.random();
    if (r < 0.2) j += `local ${generateIlName()}=${heavyMathNormal(Math.floor(Math.random() * 999))} `;
    else if (r < 0.4) j += `local ${generateIlName()}=string.char(${heavyMathNormal(Math.floor(Math.random()*255))}) `;
    else if (r < 0.5) j += `if not(${heavyMathNormal(1)}==${heavyMathNormal(1)}) then local x=1 end `;
    else if (r < 0.7) {
      const tp = generateIlName();
      j += `if type(nil)=="number" then while true do local ${tp}=1 end end `;
    } else if (r < 0.85) {
      const vt = generateIlName();
      j += `do local ${vt}={} ${vt}["_"]=1 ${vt}=nil end `;
    } else {
      j += `if type(math.pi)=="string" then local _=1 end `;
    }
  }
  return j;
}

function detectAndApplyMappingsNormal(code) {
  const MAPEO = {
    "ScreenGui":"Aggressive Renaming","Frame":"String to Math","TextLabel":"Table Indirection",
    "TextButton":"Mixed Boolean Arithmetic","Humanoid":"Dynamic Junk","Player":"Fake Flow",
    "RunService":"Virtual Machine","TweenService":"Fake Flow","Players":"Fake Flow"
  };
  let modified = code, headers = "";
  for (const [word, tech] of Object.entries(MAPEO)) {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    if (regex.test(modified)) {
      let replacement = `"${word}"`;
      if (tech.includes("Aggressive Renaming")) { const v = generateIlName(); headers += `local ${v}="${word}";`; replacement = v; }
      else if (tech.includes("String to Math")) replacement = `string.char(${word.split('').map(c => heavyMathNormal(c.charCodeAt(0))).join(',')})`;
      else if (tech.includes("Mixed Boolean Arithmetic")) replacement = `((${mbaNormal()}==1 or true)and"${word}")`;
      regex.lastIndex = 0;
      modified = modified.replace(regex, (match) => `game[${replacement}]`);
    }
  }
  return headers + modified;
}

function buildTrueVMNormal(payloadStr) {
  const STACK = generateIlName(); const KEY = generateIlName(); const SALT = generateIlName();
  const seed = Math.floor(Math.random() * 200) + 50;
  const saltVal = Math.floor(Math.random() * 250) + 1;
  let vmCore = `local ${STACK}={} local ${KEY}=${heavyMathNormal(seed)} local ${SALT}=${heavyMathNormal(saltVal)} `;
  const chunkSize = 15; let realChunks = [];
  for(let i = 0; i < payloadStr.length; i += chunkSize) { realChunks.push(payloadStr.slice(i, i + chunkSize)); }
  let poolVars = []; let realOrder = [];
  let totalChunks = realChunks.length * 3; let currentReal = 0; let globalIndex = 0;
  for(let i = 0; i < totalChunks; i++) {
    let memName = generateIlName(); poolVars.push(memName);
    if (currentReal < realChunks.length && (Math.random() > 0.5 || (totalChunks - i) === (realChunks.length - currentReal))) {
      realOrder.push(i + 1);
      let chunk = realChunks[currentReal]; let encryptedBytes = [];
      for(let j = 0; j < chunk.length; j++) { 
        let enc = (chunk.charCodeAt(j) + seed + (globalIndex * saltVal)) % 256;
        encryptedBytes.push(heavyMathNormal(enc)); 
        globalIndex++;
      }
      vmCore += `local ${memName}={${encryptedBytes.join(',')}} `;
      currentReal++;
    } else {
      let fakeBytes = []; let fakeLen = Math.floor(Math.random() * 20) + 5;
      for(let j = 0; j < fakeLen; j++) { fakeBytes.push(heavyMathNormal(Math.floor(Math.random() * 255))); }
      vmCore += `local ${memName}={${fakeBytes.join(',')}} `;
    }
  }
  vmCore += `local _pool={${poolVars.join(',')}} local _order={${realOrder.map(n => heavyMathNormal(n)).join(',')}} `;
  vmCore += `local _gIdx=0 for _, idx in ipairs(_order) do for _, byte in ipairs(_pool[idx]) do `;
  vmCore += `if type(math.pi)=="string" then ${KEY}=(${KEY}+137)%256 end `;
  vmCore += `table.insert(${STACK}, string.char(math.floor((byte - ${KEY} - _gIdx * ${SALT}) % 256))) _gIdx=_gIdx+1 end end `;
  vmCore += `local _e = table.concat(${STACK}) ${STACK}=nil `;
  const ASSERT = `getfenv()[${runtimeString("assert")}]`;
  const LOADSTRING = `getfenv()[${runtimeString("loadstring")}]`;
  const GAME = `getfenv()[${runtimeString("game")}]`;
  const HTTPGET = runtimeString("HttpGet");
  if (payloadStr.includes("http")) { vmCore += `${ASSERT}(${LOADSTRING}(${GAME}[${HTTPGET}](${GAME}, _e)))() ` } 
  else { vmCore += `${ASSERT}(${LOADSTRING}(_e))() ` }
  return vmCore;
}

function buildSingleVMNormalNormal(innerCode, handlerCount) {
  const handlers = pickHandlers(handlerCount); const realIdx = Math.floor(Math.random() * handlerCount);
  const DISPATCH = generateIlName(); let out = `local lM={} `;
  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) { out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunkNormal(5)} ${innerCode} end `; } 
    else { out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunkNormal(3)} return nil end `; }
  }
  out += `local ${DISPATCH}={`
  for (let i = 0; i < handlers.length; i++) { out += `[${heavyMathNormal(i + 1)}]=${handlers[i]},` }
  out += `} `
  let execBlocks = []; for (let i = 0; i < handlers.length; i++) { execBlocks.push(`${DISPATCH}[${heavyMathNormal(i + 1)}](lM)`) }
  out += applyCFF(execBlocks); return out;
}

function getNormalProtections() {
  const antiDebuggers = `local _adT=os.clock() for _=1,150000 do end if os.clock()-_adT>5.0 then while true do end end ` +
    `if debug~=nil and debug.getinfo then local _i=debug.getinfo(1) if _i.what~="main" and _i.what~="Lua" then while true do end end end `;
  const rawTampers = [
    `if math.pi<3.14 or math.pi>3.15 then _err() end`, `if bit32 and bit32.bxor(10,5)~=15 then _err() end`,
    `if type(tostring)~="function" then _err() end`, `if not string.match("chk","^c.*k$") then _err() end`,
    `local _tm1=os.time() local _tm2=os.time() if _tm2<_tm1 then _err() end`, `if math.abs(-10)~=10 then _err() end`
  ];
  let codeVaultGuards = "";
  for(let t of rawTampers) {
    const fnName = generateIlName(); const errName = generateIlName();
    const injectedError = t.replace("_err()", `${errName}("!")`);
    codeVaultGuards += `local ${fnName}=function() local ${errName}=error ${injectedError} end ${fnName}() `;
  }
  return antiDebuggers + codeVaultGuards;
}

function obfuscateNormal(sourceCode) {
  if (!sourceCode) return '-- Error: No Source';

  const extraProtections = getNormalProtections();
  let payloadToProtect = "";
  const isLoadstringRegex = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i;
  const match = sourceCode.match(isLoadstringRegex);
  if (match) { payloadToProtect = match[1]; } 
  else { payloadToProtect = detectAndApplyMappingsNormal(sourceCode); }

  let vm = buildTrueVMNormal(payloadToProtect);
  for (let i = 0; i < 17; i++) {
    vm = buildSingleVMNormalNormal(vm, Math.floor(Math.random() * 2) + 3); 
  }
  return `${HEADER} ${generateJunkNormal(50)} ${extraProtections} ${vm}`.replace(/\s+/g, " ").trim();
}

// ==================== FUNCIÓN PRINCIPAL EXPORTADA ====================

function obfuscate(sourceCode, mode = 'normal') {
  if (mode === 'diabolical') {
    return obfuscateDiabolical(sourceCode);
  } else {
    return obfuscateNormal(sourceCode);
  }
}

module.exports = { obfuscate };
