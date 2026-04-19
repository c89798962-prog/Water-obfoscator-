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
  // Reducción del 80% del Math Code: el 80% de las veces devuelve solo el número.
  if (Math.random() < 0.8) return n.toString();
  
  let a = Math.floor(Math.random() * 3000) + 500
  let b = Math.floor(Math.random() * 50) + 2
  let c = Math.floor(Math.random() * 800) + 10
  let d = Math.floor(Math.random() * 20) + 2
  return `(((((${n}+${a})*${b})/${b})-${a})+((${c}*${d})/${d})-${c})`
}

// TÉCNICA MIMOSA: Mixed Boolean Arithmetic (MBA)
function mba() {
  let n = Math.random() > 0.5 ? 1 : 2, a = Math.floor(Math.random() * 70) + 15, b = Math.floor(Math.random() * 40) + 8;
  return `((${n}*${a}-${a})/(${b}+1)+${n})`;
}

// TÉCNICA MIMOSA: API Mapping para protección de Hubs
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

// AQUÍ ESTÁ LA MAGIA REAL: División, Cifrado, Fake Math y Reconstrucción
function buildTrueVM(payloadStr) {
  const STACK = generateIlName()
  const KEY = generateIlName()
  const ORDER = generateIlName()
  
  const seed = Math.floor(Math.random() * 200) + 50
  let vmCore = `local ${STACK}={} local ${KEY}=${heavyMath(seed)} `

  // 1. Dividir en pequeños trozos
  const chunkSize = 15;
  let realChunks = [];
  for(let i = 0; i < payloadStr.length; i += chunkSize) {
    realChunks.push(payloadStr.slice(i, i + chunkSize));
  }

  let poolVars = [];
  let realOrder = [];
  
  // 2. Preparar empaquetado: Mezclar reales con fakes (Math Code basura)
  let totalChunks = realChunks.length * 3; 
  let currentReal = 0;

  for(let i = 0; i < totalChunks; i++) {
    let memName = generateIlName();
    poolVars.push(memName);
    
    // Decidir si este bloque será real o basura
    if (currentReal < realChunks.length && (Math.random() > 0.5 || (totalChunks - i) === (realChunks.length - currentReal))) {
      // BLOQUE REAL ENCRIPTADO
      realOrder.push(i + 1); // Guardar posición en la que quedó
      let chunk = realChunks[currentReal];
      let encryptedBytes = [];
      for(let j = 0; j < chunk.length; j++) {
        encryptedBytes.push(heavyMath(chunk.charCodeAt(j) ^ seed));
      }
      vmCore += `local ${memName}={${encryptedBytes.join(',')}} `;
      currentReal++;
    } else {
      // 3. BLOQUE BASURA FAKE MATH (Engaña a deobfuscators)
      let fakeBytes = [];
      let fakeLen = Math.floor(Math.random() * 20) + 5;
      for(let j = 0; j < fakeLen; j++) {
        fakeBytes.push(heavyMath(Math.floor(Math.random() * 255)));
      }
      vmCore += `local ${memName}={${fakeBytes.join(',')}} `;
    }
  }

  // 4. Empaquetar todo en el pool
  vmCore += `local _pool={${poolVars.join(',')}} `;
  
  // 5. Crear el mapa de reconstrucción de la VM
  vmCore += `local ${ORDER}={${realOrder.map(n => heavyMath(n)).join(',')}} `;

  // 6. Reconstrucción en runtime (Solo procesa los bloques reales, los falsos se quedan inútiles)
  const idxVar = generateIlName();
  const byteVar = generateIlName();
  vmCore += `for _, ${idxVar} in ipairs(${ORDER}) do `;
  vmCore += `for _, ${byteVar} in ipairs(_pool[${idxVar}]) do `;
  vmCore += `table.insert(${STACK}, string.char(bit32.bxor(${byteVar}, ${KEY}))) `;
  vmCore += `end end `;
  
  vmCore += `local _e = table.concat(${STACK}) ${STACK}=nil `;
  
  const ASSERT = `getfenv()[${runtimeString("assert")}]`;
  const LOADSTRING = `getfenv()[${runtimeString("loadstring")}]`;
  const GAME = `getfenv()[${runtimeString("game")}]`;
  const HTTPGET = runtimeString("HttpGet");
  
  if (payloadStr.includes("http")) {
    vmCore += `${ASSERT}(${LOADSTRING}(${GAME}[${HTTPGET}](${GAME}, _e)))() `
  } else {
    vmCore += `${ASSERT}(${LOADSTRING}(_e))() `
  }
  
  return vmCore
}

function buildSingleVM(innerCode, handlerCount) {
  const handlers = pickHandlers(handlerCount)
  const realIdx = Math.floor(Math.random() * handlerCount)
  const DISPATCH = generateIlName()
  let out = `local lM={} ` 
  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) {
      out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunk(5)} ${innerCode} end `
    } else {
      out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunk(3)} return nil end `
    }
  }
  out += `local ${DISPATCH}={`
  for (let i = 0; i < handlers.length; i++) { out += `[${heavyMath(i + 1)}]=${handlers[i]},` }
  out += `} `
  let execBlocks = []
  for (let i = 0; i < handlers.length; i++) {
    execBlocks.push(`${DISPATCH}[${heavyMath(i + 1)}](lM)`)
  }
  out += applyCFF(execBlocks)
  return out
}

// 10 VM MACHINES: Envolvemos la TrueVM en 9 SingleVMs dinámicas (9 + 1 = 10 VMs)
function build10xVM(payloadStr) {
  let vm = buildTrueVM(payloadStr);
  for (let i = 0; i < 9; i++) {
    // Número aleatorio de handlers por capa para mayor confusión
    vm = buildSingleVM(vm, Math.floor(Math.random() * 4) + 4);
  }
  return vm;
}

function getExtraProtections() {
  const antiDebugs = `local _t1=os.clock() for _=1,10000 do local _x=math.sin(_) end if os.clock()-_t1>2 then while true do end end if debug and debug.traceback then local _tr=debug.traceback() if string.find(string.lower(_tr),"hook") then while true do end end end local _s,_e=pcall(function() error("!AD") end) if not string.find(tostring(_e),"!AD") then while true do end end if getmetatable(_G) then while true do end end if type(require)=="function" and not pcall(function() return require end) then while true do end end if type(debug)=="table" and debug.getinfo then local _i=debug.getinfo(1,"S") if _i and _i.what~="Lua" and _i.what~="main" and _i.what~="C" then while true do end end end `;
  
  // Exactamente 12 Anti-Tampers
  const antiTampers = `if math.pi<3.14 or math.pi>3.15 then while true do end end ` + 
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
  return antiDebugs + antiTampers;
}

function obfuscate(sourceCode) {
  if (!sourceCode) return '--ERROR'
  const antiDebug = `local _clk=os.clock local _t=_clk() for _=1,150000 do end if os.clock()-_t>5.5 then while true do end end `
  const extraProtections = getExtraProtections()
  let payloadToProtect = ""
  const isLoadstringRegex = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i
  const match = sourceCode.match(isLoadstringRegex)
  if (match) {
    payloadToProtect = match[1]
  } else {
    payloadToProtect = detectAndApplyMappings(sourceCode)
  }
  
  // Aplicando las 10 VMs
  const finalVM = build10xVM(payloadToProtect)
  
  const result = `${HEADER} ${generateJunk(50)} ${antiDebug} ${extraProtections} ${finalVM}`
  return result.replace(/\s+/g, " ").trim()
}

module.exports = { obfuscate }
    
