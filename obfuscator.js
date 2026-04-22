/**
 * VVMER OBFUSCATOR - DUAL MODE
 * Normal: 18x VM + Mapeos + Protecciones estándar
 * Diabolical: 80x VM + Protecciones extremas
 */

const HEADER = `--[[ this code it's protected by vvmer obfoscator ]]`;

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

function heavyMath(n) {
  if (Math.random() < 0.3) return n.toString();
  let a = Math.floor(Math.random() * 5000) + 1000;
  let b = Math.floor(Math.random() * 100) + 2;
  let c = Math.floor(Math.random() * 800) + 10;
  let d = Math.floor(Math.random() * 20) + 2;
  return `(((((${n}+${a})*${b})/${b})-${a})+((${c}*${d})/${d})-${c})`;
}

function mba() {
  let n = Math.random() > 0.5 ? 1 : 2, a = Math.floor(Math.random() * 70) + 15, b = Math.floor(Math.random() * 40) + 8;
  return `((${n}*${a}-${a})/(${b}+1)+${n})`;
}

function generateJunk(lines = 100) {
  let j = '';
  for (let i = 0; i < lines; i++) {
    const r = Math.random();
    if (r < 0.2) j += `local ${generateIlName()}=${heavyMath(Math.floor(Math.random() * 999))} `;
    else if (r < 0.4) j += `local ${generateIlName()}=string.char(${heavyMath(Math.floor(Math.random()*255))}) `;
    else if (r < 0.5) j += `if not(${heavyMath(1)}==${heavyMath(1)}) then local x=1 end `;
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

function runtimeString(str) {
  return `string.char(${str.split('').map(c => heavyMath(c.charCodeAt(0))).join(',')})`;
}

// ==================== MODO NORMAL (18x VM) ====================

function detectAndApplyMappings(code) {
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
      else if (tech.includes("String to Math")) replacement = `string.char(${word.split('').map(c => heavyMath(c.charCodeAt(0))).join(',')})`;
      else if (tech.includes("Mixed Boolean Arithmetic")) replacement = `((${mba()}==1 or true)and"${word}")`;
      regex.lastIndex = 0;
      modified = modified.replace(regex, (match) => `game[${replacement}]`);
    }
  }
  return headers + modified;
}

function buildTrueVM(payloadStr) {
  const STACK = generateIlName(); const KEY = generateIlName(); const SALT = generateIlName();
  const seed = Math.floor(Math.random() * 200) + 50;
  const saltVal = Math.floor(Math.random() * 250) + 1;
  let vmCore = `local ${STACK}={} local ${KEY}=${heavyMath(seed)} local ${SALT}=${heavyMath(saltVal)} `;
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
        encryptedBytes.push(heavyMath(enc)); 
        globalIndex++;
      }
      vmCore += `local ${memName}={${encryptedBytes.join(',')}} `;
      currentReal++;
    } else {
      let fakeBytes = []; let fakeLen = Math.floor(Math.random() * 20) + 5;
      for(let j = 0; j < fakeLen; j++) { fakeBytes.push(heavyMath(Math.floor(Math.random() * 255))); }
      vmCore += `local ${memName}={${fakeBytes.join(',')}} `;
    }
  }
  vmCore += `local _pool={${poolVars.join(',')}} local _order={${realOrder.map(n => heavyMath(n)).join(',')}} `;
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

function applyCFF(blocks) {
  const stateVar = generateIlName();
  let lua = `local ${stateVar}=${heavyMath(1)} while true do `;
  for (let i = 0; i < blocks.length; i++) {
    if (i === 0) lua += `if ${stateVar}==${heavyMath(1)} then ${blocks[i]} ${stateVar}=${heavyMath(2)} `;
    else lua += `elseif ${stateVar}==${heavyMath(i + 1)} then ${blocks[i]} ${stateVar}=${heavyMath(i + 2)} `;
  }
  lua += `elseif ${stateVar}==${heavyMath(blocks.length + 1)} then break end end `;
  return lua;
}

function buildSingleVMNormal(innerCode, handlerCount) {
  const handlers = pickHandlers(handlerCount); const realIdx = Math.floor(Math.random() * handlerCount);
  const DISPATCH = generateIlName(); let out = `local lM={} `;
  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) { out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunk(5)} ${innerCode} end `; } 
    else { out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunk(3)} return nil end `; }
  }
  out += `local ${DISPATCH}={`
  for (let i = 0; i < handlers.length; i++) { out += `[${heavyMath(i + 1)}]=${handlers[i]},` }
  out += `} `
  let execBlocks = []; for (let i = 0; i < handlers.length; i++) { execBlocks.push(`${DISPATCH}[${heavyMath(i + 1)}](lM)`) }
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

// ==================== MODO DIABOLICAL (80x VM) ====================

function getDiabolicalProtections() {
  let protections = `local _clk=os.clock local _t=_clk() for _=1,200000 do end if os.clock()-_t>4.0 then while true do end end `;
  const tamperChecks = [
    "math.pi<3.14", "math.abs(-1)~=1", "type(print)~='function'", "type(pairs)~='function'",
    "string.len('vvmer')~=5", "table.concat({'a','b'})~='ab'", "math.floor(0.5)~=0",
    "debug.getinfo==nil", "getfenv()==nil", "type(coroutine)~='table'", "bit32==nil"
  ];
  tamperChecks.forEach(check => {
    const fnName = generateIlName(); const errHandler = generateIlName();
    protections += `local ${fnName} = function() local ${errHandler} = error if ${check} then ${errHandler}("Security Violation") end end ${fnName}() `;
  });
  return protections;
}

function buildCoreVMDiabolical(payloadStr) {
  const STACK = generateIlName(); const KEY = Math.floor(Math.random() * 255);
  let bytes = [];
  for(let i=0; i<payloadStr.length; i++) { bytes.push(heavyMath(payloadStr.charCodeAt(i) ^ KEY)); }
  return `local ${STACK}={${bytes.join(',')}} local _d="" for _,b in ipairs(${STACK}) do _d=_d..string.char(b%256 ^ ${KEY}) end local _f, _err = loadstring(_d) if _f then _f() else error(_err) end`;
}

function wrapInVMDiabolical(innerCode) {
  const DISPATCHER = generateIlName(); const STATE = generateIlName();
  return `local ${DISPATCHER} = function() ${generateJunk(5)} ${innerCode} end local ${STATE}=${heavyMath(1)} while ${STATE}==${heavyMath(1)} do ${STATE}=0 ${DISPATCHER}() end`;
}

// ==================== FUNCIÓN PRINCIPAL ====================

function obfuscate(sourceCode, mode = 'normal') {
  if (!sourceCode) return '-- Error: No Source';

  if (mode === 'diabolical') {
    // MODO DIABOLICAL (80 capas)
    let result = getDiabolicalProtections();
    let currentLayer = buildCoreVMDiabolical(sourceCode);
    for(let i = 0; i < 80; i++) {
      currentLayer = wrapInVMDiabolical(currentLayer);
      if(i % 10 === 0) currentLayer = `do ${generateJunk(2)} ${currentLayer} end `;
    }
    return `${HEADER} ${generateJunk(20)} ${result} ${currentLayer}`.replace(/\s+/g, " ").trim();
  } else {
    // MODO NORMAL (18 capas + mapeos)
    const extraProtections = getNormalProtections();
    let payloadToProtect = "";
    const isLoadstringRegex = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i;
    const match = sourceCode.match(isLoadstringRegex);
    if (match) { payloadToProtect = match[1]; } 
    else { payloadToProtect = detectAndApplyMappings(sourceCode); }

    let vm = buildTrueVM(payloadToProtect);
    for (let i = 0; i < 17; i++) {
      vm = buildSingleVMNormal(vm, Math.floor(Math.random() * 2) + 3); 
    }
    return `${HEADER} ${generateJunk(50)} ${extraProtections} ${vm}`.replace(/\s+/g, " ").trim();
  }
}

module.exports = { obfuscate };
