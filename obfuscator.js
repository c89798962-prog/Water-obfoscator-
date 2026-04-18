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

// TÉCNICA MIMOSA: URL dividida, envuelta y cifrada con XOR dinámico (llave mutante)
function buildTrueVM(payloadStr) {
  const STACK = generateIlName()
  const PTR = generateIlName()
  const KEY = generateIlName()
  
  const p = Math.ceil(payloadStr.length / 4)
  const chunks = [payloadStr.slice(0, p), payloadStr.slice(p, p*2), payloadStr.slice(p*2, p*3), payloadStr.slice(p*3)].filter(s => s.length > 0)
  
  const seed = Math.floor(Math.random() * 150) + 50
  let vmCore = `local ${STACK}={} local ${KEY}=${heavyMath(seed)} `
  let memVars = []
  let globalPos = 0

  chunks.forEach((chunk) => {
    const memName = generateIlName()
    memVars.push(memName)
    const encrypted = chunk.split('').map(c => {
      let b = c.charCodeAt(0) ^ (seed + globalPos * 2)
      globalPos++
      return b
    })
    vmCore += `local ${memName}={${encrypted.map(b => heavyMath(b)).join(',')}} `
  })

  vmCore += `local _pool={${memVars.join(',')}} local _pos=0 `
  vmCore += `for i=1,#_pool do local _m=_pool[i] `
  vmCore += `for ${PTR}=1,#_m do `
  vmCore += `table.insert(${STACK}, string.char(bit32.bxor(_m[${PTR}], ${KEY}+(_pos*2)))) `
  vmCore += `_pos=_pos+1 end end `
  
  vmCore += `local _e = table.concat(${STACK}) ${STACK}=nil `
  
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

// NUEVA CAPA: 3ra VM - Entorno Falso Completo (Registros + Conjunto de Instrucciones)
function buildTripleVM(innerCode) {
  const handlers = pickHandlers(6); // Handlers personalizados (KQ, HF, etc.)
  
  // Se inicializan los registros falsos y la memoria dentro de lM
  let lua = `local lM={ _regs={}, _stack={}, _ip=1 } `;
  
  // Handlers actuando como ejecutores de Opcodes (Repetición de lM constante)
  lua += `local ${handlers[0]}=function(lM, v) local lM=lM; lM._regs[1]=v; end `; // OP 1: LOAD
  lua += `local ${handlers[1]}=function(lM, v) local lM=lM; table.insert(lM._stack, string.char(bit32.bxor(lM._regs[1], v))); end `; // OP 2: XOR & PUSH
  lua += `local ${handlers[2]}=function(lM) local lM=lM; local _chunk = table.concat(lM._stack); local _f=loadstring(_chunk); if _f then _f() end end `; // OP 3: EXECUTE
  lua += `local ${handlers[3]}=function(lM, v) local lM=lM; lM._regs[2]=v; end `; // OP 4: JUNK / MOVE
  lua += `local ${handlers[4]}=function(lM, v) local lM=lM; lM._ip=lM._ip+v; end `; // OP 5: JUMP
  lua += `local ${handlers[5]}=function(lM) local lM=lM; lM._regs[1]=0; end `; // OP 6: CLEAR
  
  // Compilando el código de la DoubleVM en instrucciones para esta 3ra VM
  const seedKey = Math.floor(Math.random() * 200) + 20;
  let bytecode = [];
  for(let i=0; i<innerCode.length; i++) {
    let code = innerCode.charCodeAt(i);
    let dynamicKey = (seedKey + i) % 256;
    let encrypted = code ^ dynamicKey;
    
    bytecode.push(`{1, ${heavyMath(encrypted)}}`); // Carga a registro
    bytecode.push(`{2, ${heavyMath(dynamicKey)}}`); // Desencripta con llave dinámica y sube a Stack
    
    // Inyecta instrucciones basura aleatorias para confundir
    if(Math.random() > 0.8) {
         bytecode.push(`{4, ${heavyMath(Math.floor(Math.random() * 100))}}`);
    }
  }
  bytecode.push(`{3, 0}`); // Ejecutar resultado
  
  lua += `local _ops = {${bytecode.join(',')}} `;
  
  // Ciclo principal de la Máquina Virtual (Interpreter Loop)
  lua += `while lM._ip <= #_ops do `
  lua += `local _op = _ops[lM._ip][1] local _arg = _ops[lM._ip][2] `
  lua += `if _op==1 then ${handlers[0]}(lM, _arg) `
  lua += `elseif _op==2 then ${handlers[1]}(lM, _arg) `
  lua += `elseif _op==3 then ${handlers[2]}(lM) `
  lua += `elseif _op==4 then ${handlers[3]}(lM, _arg) `
  lua += `elseif _op==5 then ${handlers[4]}(lM, _arg) `
  lua += `elseif _op==6 then ${handlers[5]}(lM) end `
  lua += `lM._ip = lM._ip + 1 end `
  
  return lua;
}

// Generador de Anti-Debugs y Anti-Tampers
function getExtraProtections() {
  // 5 Anti-Debugs Originales
  const antiDebugs = `local _t1=os.clock() for _=1,10000 do local _x=math.sin(_) end if os.clock()-_t1>2 then while true do end end if debug and debug.traceback then local _tr=debug.traceback() if string.find(string.lower(_tr),"hook") then while true do end end end local _s,_e=pcall(function() error("!AD") end) if not string.find(tostring(_e),"!AD") then while true do end end if getmetatable(_G) then while true do end end if type(require)=="function" and not pcall(function() return require end) then while true do end end `;

  // 10 Anti-Tampers Originales
  const antiTampers = `if math.pi<3.14 or math.pi>3.15 then while true do end end if bit32 and bit32.bxor(10,5)~=15 then while true do end end if type(tostring)~="function" then while true do end end if not string.match("chk","^c.*k$") then while true do end end if type(coroutine.create)~="function" then while true do end end if type(table.concat)~="function" then while true do end end local _tm1=os.time() local _tm2=os.time() if _tm2<_tm1 then while true do end end if math.abs(-10)~=10 then while true do end end if gcinfo and gcinfo()<0 then while true do end end if type(next)~="function" then while true do end end `;

  // 5 Anti-Debugs NUEVOS
  const extraAntiDebugs = `if debug and debug.getinfo then local _s,_e=pcall(function() return debug.getinfo(1) end) if not _s then while true do end end end if debug and debug.getlocal then local _s,_e=pcall(function() return debug.getlocal(1,1) end) if not _s then while true do end end end local _ge=getfenv if type(_ge)~="function" then while true do end end local _pe,_me=pcall(function() error("!X") end) if not string.find(tostring(_me),"!X") then while true do end end if xpcall then local _x=xpcall(function() error("!Y") end, function() return "OK" end) if _x then while true do end end end `;

  // 5 Anti-Tampers NUEVOS
  const extraAntiTampers = `if math.random(1,1)~=1 then while true do end end if string.byte("A")~=65 then while true do end end if string.sub("abc",1,1)~="a" then while true do end end if type({1})~="table" then while true do end end if string.rep("a",2)~="aa" then while true do end end `;

  return antiDebugs + extraAntiDebugs + antiTampers + extraAntiTampers;
}

function obfuscate(sourceCode) {
  if (!sourceCode) return '--ERROR'
  
  // Anti-Debug Original mantenido intacto
  const antiDebug = `local _clk=os.clock local _t=_clk() for _=1,150000 do end if os.clock()-_t>5.5 then while true do end end `
  
  // Agregamos las protecciones combinadas
  const extraProtections = getExtraProtections()
  
  let payloadToProtect = ""
  const isLoadstringRegex = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i
  const match = sourceCode.match(isLoadstringRegex)

  if (match) {
    payloadToProtect = match[1]
  } else {
    payloadToProtect = detectAndApplyMappings(sourceCode)
  }

  // Capa 1 y 2
  const doubleVM = buildDoubleVM(payloadToProtect)
  
  // Capa 3: Inyección de la Máquina Virtual Final solicitada
  const finalVM = buildTripleVM(doubleVM)
  
  // Ensamblamos todo: HEADER -> Junk -> AD Original -> AD/AT Completos -> VM Final
  const result = `${HEADER} ${generateJunk(50)} ${antiDebug} ${extraProtections} ${finalVM}`
  return result.replace(/\s+/g, " ").trim()
}

module.exports = { obfuscate }
      
