const DISCORD = "https://discord.gg/UttE8VYAY"
const HEADER = `--[[ this code it's protected by water obfoscator:${DISCORD} ]]`

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

// MODIFICADO: Divide el payload (URL o código Hub) en 3 partes y lo reparte en 3 mini-VMs independientes
function buildTrueVM(payloadStr) {
  // Fragmentamos en exactamente 3 partes
  const p = Math.ceil(payloadStr.length / 3)
  const chunks = [payloadStr.slice(0, p), payloadStr.slice(p, p*2), payloadStr.slice(p*2)].filter(s => s.length > 0)
  
  let vmCore = ``
  let decodedFragments = []

  // Creamos una mini VM para cada fragmento
  chunks.forEach((chunk) => {
    const miniVM_Func = generateIlName()
    const STACK = generateIlName()
    const PTR = generateIlName()
    const KEY = generateIlName()
    const memName = generateIlName()
    const fragmentResult = generateIlName()
    
    const seed = Math.floor(Math.random() * 150) + 50
    let globalPos = 0
    const encrypted = chunk.split('').map(c => {
      let b = c.charCodeAt(0) ^ (seed + globalPos * 2)
      globalPos++
      return b
    })

    // Cada fragmento se aísla en su propia función ejecutora (mini VM / math code wrapper)
    vmCore += `local function ${miniVM_Func}() `
    vmCore += `local ${STACK}={} local ${KEY}=${heavyMath(seed)} `
    vmCore += `local ${memName}={${encrypted.map(b => heavyMath(b)).join(',')}} `
    vmCore += `local _pos=0 for ${PTR}=1,#${memName} do `
    vmCore += `table.insert(${STACK}, string.char(bit32.bxor(${memName}[${PTR}], ${KEY}+(_pos*2)))) `
    vmCore += `_pos=_pos+1 end return table.concat(${STACK}) end `
    
    // Ejecutamos la mini VM y guardamos el resultado parcial
    vmCore += `local ${fragmentResult} = ${miniVM_Func}() `
    decodedFragments.push(fragmentResult)
  })

  // Ensamblaje final de las 3 partes
  const finalPayload = generateIlName()
  vmCore += `local ${finalPayload} = ${decodedFragments.join(' .. ')} `
  
  if (payloadStr.includes("http")) {
    vmCore += `assert(loadstring(game:HttpGet(${finalPayload})))() `
  } else {
    vmCore += `assert(loadstring(${finalPayload}))() `
  }
  
  return vmCore
}

function buildDoubleVM(payloadStr) {
  const innerVM = buildTrueVM(payloadStr)
  return buildSingleVM(innerVM, 7)
}

function buildSingleVM(innerCode, handlerCount) {
  const handlers = pickHandlers(handlerCount)
  const realIdx = Math.floor(Math.random() * handlerCount)
  const DISPATCH = generateIlName()
  let out = `local lM={} ` 
  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) {
      // TÉCNICA MIMOSA: Variable Shadowing "local lM=lM"
      out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunk(10)} ${innerCode} end `
    } else {
      out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunk(5)} return nil end `
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

// NUEVA CAPA AÑADIDA: Máquina Virtual Triple basada en Registros con Handlers y repetición masiva de lM
function buildTripleVM(payloadStr) {
  const innerVM = buildDoubleVM(payloadStr);
  const handlers = pickHandlers(8); 
  const realHandler = handlers[Math.floor(Math.random() * handlers.length)];
  
  let vm = `local lM = { r = {}, i = {}, p = 1, lM = "lM" }; local lM=lM; `;
  
  // Fake instruction set
  vm += `lM.i = { `;
  for (let i = 0; i < 15; i++) {
    const fakeH = handlers[Math.floor(Math.random() * handlers.length)];
    vm += `{ OP = "${fakeH}", A = ${heavyMath(i)}, B = ${heavyMath(i+5)} }, `;
  }
  // The real payload trigger
  vm += `{ OP = "${realHandler}", A = "EXEC", B = "lM" }, `;
  // More fake instructions
  for (let i = 0; i < 5; i++) {
    const fakeH = handlers[Math.floor(Math.random() * handlers.length)];
    vm += `{ OP = "${fakeH}", A = ${heavyMath(i)}, B = ${heavyMath(i+5)} }, `;
  }
  vm += `}; `;

  // Building handlers with lM spam
  handlers.forEach(h => {
    if (h === realHandler) {
      vm += `local ${h} = function(lM) local lM=lM; if lM.i[lM.p].A == "EXEC" then ${innerVM} end lM.p = lM.p + 1; return lM; end `;
    } else {
      vm += `local ${h} = function(lM) local lM=lM; lM.r[lM.i[lM.p].A] = lM.i[lM.p].B; lM.p = lM.p + 1; return lM; end `;
    }
  });

  // Fetch-Decode-Execute Loop running through Handlers
  vm += `while lM.p <= #lM.i do local curOP = lM.i[lM.p].OP; `;
  handlers.forEach((h, idx) => {
    if (idx === 0) vm += `if curOP == "${h}" then lM = ${h}(lM); `;
    else vm += `elseif curOP == "${h}" then lM = ${h}(lM); `;
  });
  vm += `end end `;

  return vm;
}

// NUEVO: Generador de Anti-Debugs y Anti-Tampers (Se inyecta en Lua)
function getExtraProtections() {
  // 6 Anti-Debugs (Añadido 1 extra)
  // 1: Timing / Speedhack check (matemática pesada para medir delay)
  // 2: Detección de hook en debug.traceback
  // 3: Pcall Integrity (Detección de intercepción de errores/hooking global)
  // 4: Detección de Freeze/Modificación en metatabla global _G
  // 5: Detección de manipulación en 'require' built-in
  // 6: Detección de hook encubierto en debug.getinfo
  const antiDebugs = `local _t1=os.clock() for _=1,10000 do local _x=math.sin(_) end if os.clock()-_t1>2 then while true do end end if debug and debug.traceback then local _tr=debug.traceback() if string.find(string.lower(_tr),"hook") then while true do end end end local _s,_e=pcall(function() error("!AD") end) if not string.find(tostring(_e),"!AD") then while true do end end if getmetatable(_G) then while true do end end if type(require)=="function" and not pcall(function() return require end) then while true do end end if type(debug)=="table" and debug.getinfo then local _i=debug.getinfo(1,"S") if _i and _i.what~="Lua" and _i.what~="main" and _i.what~="C" then while true do end end end `;

  // 12 Anti-Tampers (Añadidos 2 extras)
  // 1: Integridad de constantes matemáticas (math.pi)
  // 2: Integridad de funciones Bit32 (bxor)
  // 3: Integridad de 'tostring' (Evita sobrescritura)
  // 4: Integridad de 'string.match' (Regex/Pattern)
  // 5: Integridad de 'coroutine.create'
  // 6: Integridad de 'table.concat'
  // 7: Flujo temporal del OS (Detección de manipulación de os.time)
  // 8: Integridad lógica de math.abs
  // 9: Detección de recolección de basura anómala (gcinfo)
  // 10: Integridad del iterador built-in 'next'
  // 11: Integridad de string.len (Verifica bypasses de strings)
  // 12: Integridad de table.insert
  const antiTampers = `if math.pi<3.14 or math.pi>3.15 then while true do end end if bit32 and bit32.bxor(10,5)~=15 then while true do end end if type(tostring)~="function" then while true do end end if not string.match("chk","^c.*k$") then while true do end end if type(coroutine.create)~="function" then while true do end end if type(table.concat)~="function" then while true do end end local _tm1=os.time() local _tm2=os.time() if _tm2<_tm1 then while true do end end if math.abs(-10)~=10 then while true do end end if gcinfo and gcinfo()<0 then while true do end end if type(next)~="function" then while true do end end if string.len("a")~=1 then while true do end end if type(table.insert)~="function" then while true do end end `;

  return antiDebugs + antiTampers;
}

function obfuscate(sourceCode) {
  if (!sourceCode) return '--ERROR'
  
  // Anti-Debug Original mantenido intacto
  const antiDebug = `local _clk=os.clock local _t=_clk() for _=1,150000 do end if os.clock()-_t>5.5 then while true do end end `
  
  // Agregamos las nuevas protecciones
  const extraProtections = getExtraProtections()
  
  let payloadToProtect = ""
  const isLoadstringRegex = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i
  const match = sourceCode.match(isLoadstringRegex)

  if (match) {
    payloadToProtect = match[1]
  } else {
    payloadToProtect = detectAndApplyMappings(sourceCode)
  }

  // Ahora se envuelve en la Triple VM (La cual llama a la Double y esta a la True VM)
  const finalVM = buildTripleVM(payloadToProtect)
  
  // Ensamblamos todo: HEADER -> Junk -> AD Original -> AD/AT Nuevos -> VM
  const result = `${HEADER} ${generateJunk(50)} ${antiDebug} ${extraProtections} ${finalVM}`
  return result.replace(/\s+/g, " ").trim()
}

module.exports = { obfuscate }
  
  if (payloadStr.includes("http")) {
    vmCore += `assert(loadstring(game:HttpGet(_e)))() `
  } else {
    vmCore += `assert(loadstring(_e))() `
  }
  
  return vmCore
}

function buildDoubleVM(payloadStr) {
  const innerVM = buildTrueVM(payloadStr)
  return buildSingleVM(innerVM, 7)
}

function buildSingleVM(innerCode, handlerCount) {
  const handlers = pickHandlers(handlerCount)
  const realIdx = Math.floor(Math.random() * handlerCount)
  const DISPATCH = generateIlName()
  let out = `local lM={} ` 
  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) {
      // TÉCNICA MIMOSA: Variable Shadowing "local lM=lM"
      out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunk(10)} ${innerCode} end `
    } else {
      out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunk(5)} return nil end `
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

// NUEVA CAPA AÑADIDA: Máquina Virtual Triple basada en Registros con Handlers y repetición masiva de lM
function buildTripleVM(payloadStr) {
  const innerVM = buildDoubleVM(payloadStr);
  const handlers = pickHandlers(8); 
  const realHandler = handlers[Math.floor(Math.random() * handlers.length)];
  
  let vm = `local lM = { r = {}, i = {}, p = 1, lM = "lM" }; local lM=lM; `;
  
  // Fake instruction set
  vm += `lM.i = { `;
  for (let i = 0; i < 15; i++) {
    const fakeH = handlers[Math.floor(Math.random() * handlers.length)];
    vm += `{ OP = "${fakeH}", A = ${heavyMath(i)}, B = ${heavyMath(i+5)} }, `;
  }
  // The real payload trigger
  vm += `{ OP = "${realHandler}", A = "EXEC", B = "lM" }, `;
  // More fake instructions
  for (let i = 0; i < 5; i++) {
    const fakeH = handlers[Math.floor(Math.random() * handlers.length)];
    vm += `{ OP = "${fakeH}", A = ${heavyMath(i)}, B = ${heavyMath(i+5)} }, `;
  }
  vm += `}; `;

  // Building handlers with lM spam
  handlers.forEach(h => {
    if (h === realHandler) {
      vm += `local ${h} = function(lM) local lM=lM; if lM.i[lM.p].A == "EXEC" then ${innerVM} end lM.p = lM.p + 1; return lM; end `;
    } else {
      vm += `local ${h} = function(lM) local lM=lM; lM.r[lM.i[lM.p].A] = lM.i[lM.p].B; lM.p = lM.p + 1; return lM; end `;
    }
  });

  // Fetch-Decode-Execute Loop running through Handlers
  vm += `while lM.p <= #lM.i do local curOP = lM.i[lM.p].OP; `;
  handlers.forEach((h, idx) => {
    if (idx === 0) vm += `if curOP == "${h}" then lM = ${h}(lM); `;
    else vm += `elseif curOP == "${h}" then lM = ${h}(lM); `;
  });
  vm += `end end `;

  return vm;
}

// NUEVO: Generador de Anti-Debugs y Anti-Tampers (Se inyecta en Lua)
function getExtraProtections() {
  // 6 Anti-Debugs (Añadido 1 extra)
  // 1: Timing / Speedhack check (matemática pesada para medir delay)
  // 2: Detección de hook en debug.traceback
  // 3: Pcall Integrity (Detección de intercepción de errores/hooking global)
  // 4: Detección de Freeze/Modificación en metatabla global _G
  // 5: Detección de manipulación en 'require' built-in
  // 6: Detección de hook encubierto en debug.getinfo
  const antiDebugs = `local _t1=os.clock() for _=1,10000 do local _x=math.sin(_) end if os.clock()-_t1>2 then while true do end end if debug and debug.traceback then local _tr=debug.traceback() if string.find(string.lower(_tr),"hook") then while true do end end end local _s,_e=pcall(function() error("!AD") end) if not string.find(tostring(_e),"!AD") then while true do end end if getmetatable(_G) then while true do end end if type(require)=="function" and not pcall(function() return require end) then while true do end end if type(debug)=="table" and debug.getinfo then local _i=debug.getinfo(1,"S") if _i and _i.what~="Lua" and _i.what~="main" and _i.what~="C" then while true do end end end `;

  // 12 Anti-Tampers (Añadidos 2 extras)
  // 1: Integridad de constantes matemáticas (math.pi)
  // 2: Integridad de funciones Bit32 (bxor)
  // 3: Integridad de 'tostring' (Evita sobrescritura)
  // 4: Integridad de 'string.match' (Regex/Pattern)
  // 5: Integridad de 'coroutine.create'
  // 6: Integridad de 'table.concat'
  // 7: Flujo temporal del OS (Detección de manipulación de os.time)
  // 8: Integridad lógica de math.abs
  // 9: Detección de recolección de basura anómala (gcinfo)
  // 10: Integridad del iterador built-in 'next'
  // 11: Integridad de string.len (Verifica bypasses de strings)
  // 12: Integridad de table.insert
  const antiTampers = `if math.pi<3.14 or math.pi>3.15 then while true do end end if bit32 and bit32.bxor(10,5)~=15 then while true do end end if type(tostring)~="function" then while true do end end if not string.match("chk","^c.*k$") then while true do end end if type(coroutine.create)~="function" then while true do end end if type(table.concat)~="function" then while true do end end local _tm1=os.time() local _tm2=os.time() if _tm2<_tm1 then while true do end end if math.abs(-10)~=10 then while true do end end if gcinfo and gcinfo()<0 then while true do end end if type(next)~="function" then while true do end end if string.len("a")~=1 then while true do end end if type(table.insert)~="function" then while true do end end `;

  return antiDebugs + antiTampers;
}

function obfuscate(sourceCode) {
  if (!sourceCode) return '--ERROR'
  
  // Anti-Debug Original mantenido intacto
  const antiDebug = `local _clk=os.clock local _t=_clk() for _=1,150000 do end if os.clock()-_t>5.5 then while true do end end `
  
  // Agregamos las nuevas protecciones
  const extraProtections = getExtraProtections()
  
  let payloadToProtect = ""
  const isLoadstringRegex = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i
  const match = sourceCode.match(isLoadstringRegex)

  if (match) {
    payloadToProtect = match[1]
  } else {
    payloadToProtect = detectAndApplyMappings(sourceCode)
  }

  // Ahora se envuelve en la Triple VM (La cual llama a la Double y esta a la True VM)
  const finalVM = buildTripleVM(payloadToProtect)
  
  // Ensamblamos todo: HEADER -> Junk -> AD Original -> AD/AT Nuevos -> VM
  const result = `${HEADER} ${generateJunk(50)} ${antiDebug} ${extraProtections} ${finalVM}`
  return result.replace(/\s+/g, " ").trim()
}

module.exports = { obfuscate }
    
