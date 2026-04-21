const HEADER = `--[[ this code it's protected by vvmer obfoscator ]]`

// Pool ampliado — mucho más difícil de distinguir visualmente
const IL_POOL = [
  "IIIIIIII1","vvvvvv1","vvvvvvvv2","vvvvvv3","IIlIlIlI1","lvlvlvlv2",
  "I1","l1","v1","v2","v3","II","ll","vv","I2",
  "lllllll1","IIIlll2","vIvIvI3","lIlIlI4","vvIIll5","IllvvI6",
  "lllIII7","vvvlll8","IIIvvv9","lIvIlI0","vIlvIl1","IlvIlv2",
  "llllll3","IIIIII4","vvvvvv5","lllvvv6","IIIlll7","vvvIII8",
  "lIIlIl9","vllvll0","IvvIvv1","lvvllv2","vIIvII3","lllIlI4",
  "IIvIIv5","vvlvvl6","lIvlIv7","IlIvIl8","vIlIvI9","llIllI0"
]

const HANDLER_POOL = [
  "KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD",
  "Zk","Pr","Uo","Ei","Fy","Gx","Jw","Lh","Mn","Ov"
]

// ─── Nombres y handlers ────────────────────────────────────────────────────────

function generateIlName() {
  return IL_POOL[Math.floor(Math.random() * IL_POOL.length)] +
         Math.floor(Math.random() * 999999)
}

function pickHandlers(count) {
  const used = new Set(), result = []
  while (result.length < count) {
    const base = HANDLER_POOL[Math.floor(Math.random() * HANDLER_POOL.length)]
    const name = base + Math.floor(Math.random() * 999)
    if (!used.has(name)) { used.add(name); result.push(name) }
  }
  return result
}

// ─── Matemáticas pesadas / MBA ─────────────────────────────────────────────────

function heavyMath(n) {
  if (Math.random() < 0.5) return n.toString()
  const ops = [
    () => { // Nested add/mul cancel
      let a = Math.floor(Math.random() * 3000) + 500
      let b = Math.floor(Math.random() * 50) + 2
      let c = Math.floor(Math.random() * 800) + 10
      let d = Math.floor(Math.random() * 20) + 2
      return `(((((${n}+${a})*${b})/${b})-${a})+((${c}*${d})/${d})-${c})`
    },
    () => { // Bitwise-style with math
      let x = Math.floor(Math.random() * 128) + 1
      return `(((${n} + ${x}) - ${x}))`
    },
    () => { // Double negate cancel
      let k = Math.floor(Math.random() * 500) + 100
      return `(-(-(${n}+${k}))-${k})`
    },
    () => { // mul/div by prime
      const primes = [3,5,7,11,13,17,19,23]
      let p = primes[Math.floor(Math.random() * primes.length)]
      return `((${n}*${p})/${p})`
    }
  ]
  return ops[Math.floor(Math.random() * ops.length)]()
}

function mba() {
  const n = Math.random() > 0.5 ? 1 : 2
  const a = Math.floor(Math.random() * 70) + 15
  const b = Math.floor(Math.random() * 40) + 8
  return `((${n}*${a}-${a})/(${b}+1)+${n})`
}

// ─── Mappings de palabras clave ────────────────────────────────────────────────

const MAPEO = {
  "ScreenGui":"Aggressive Renaming","Frame":"String to Math","TextLabel":"Table Indirection",
  "TextButton":"Mixed Boolean Arithmetic","Humanoid":"Dynamic Junk","Player":"Fake Flow",
  "RunService":"Virtual Machine","TweenService":"Fake Flow","Players":"Fake Flow"
}

function detectAndApplyMappings(code) {
  let modified = code, headers = ""
  for (const [word, tech] of Object.entries(MAPEO)) {
    const regex = new RegExp(`\\b${word}\\b`, "g")
    if (regex.test(modified)) {
      let replacement = `"${word}"`
      if (tech.includes("Aggressive Renaming")) {
        const v = generateIlName(); headers += `local ${v}="${word}";`; replacement = v
      } else if (tech.includes("String to Math")) {
        replacement = `string.char(${word.split('').map(c => heavyMath(c.charCodeAt(0))).join(',')})`
      } else if (tech.includes("Mixed Boolean Arithmetic")) {
        replacement = `((${mba()}==1 or true)and"${word}")`
      }
      regex.lastIndex = 0
      modified = modified.replace(regex, () => `game[${replacement}]`)
    }
  }
  return headers + modified
}

// ─── Basura / Junk con tarpits, opaque predicates, waterfall ──────────────────

function generateJunk(lines = 100) {
  let j = ""
  for (let i = 0; i < lines; i++) {
    const r = Math.random()
    if (r < 0.12) {
      j += `local ${generateIlName()}=${heavyMath(Math.floor(Math.random() * 999))} `
    } else if (r < 0.24) {
      j += `local ${generateIlName()}=string.char(${heavyMath(Math.floor(Math.random() * 255))}) `
    } else if (r < 0.34) {
      j += `if not(${heavyMath(1)}==${heavyMath(1)}) then local x=1 end `
    } else if (r < 0.46) {
      // Tarpit
      const tp = generateIlName()
      j += `if type(nil)=="number" then while true do local ${tp}=1 end end `
    } else if (r < 0.57) {
      // Symbol Waterfall
      const vt = generateIlName()
      j += `do local ${vt}={} ${vt}["_"]=1 ${vt}=nil end `
    } else if (r < 0.66) {
      // Opaque predicate
      j += `if type(math.pi)=="string" then local _=1 end `
    } else if (r < 0.75) {
      // Cadena falsa desechada inmediatamente
      const sv = generateIlName()
      const fakeStr = Array.from({length: Math.floor(Math.random()*6)+3},
        () => heavyMath(Math.floor(Math.random()*90)+32)).join(",")
      j += `local ${sv}=string.char(${fakeStr}) ${sv}=nil `
    } else if (r < 0.84) {
      // Tabla con índices numéricos falsos
      const tv = generateIlName()
      const entries = Array.from({length: Math.floor(Math.random()*4)+2},
        (_,i) => `[${heavyMath(i+1)}]=${heavyMath(Math.floor(Math.random()*999))}`).join(",")
      j += `do local ${tv}={${entries}} ${tv}=nil end `
    } else if (r < 0.92) {
      // pcall basura
      const fn = generateIlName()
      j += `local ${fn}=function() return ${heavyMath(0)} end pcall(${fn}) ${fn}=nil `
    } else {
      // Double opaque con string
      j += `if type("x")=="number" then local _=1 end `
    }
  }
  return j
}

// ─── Control Flow Flattening ───────────────────────────────────────────────────

function applyCFF(blocks) {
  const stateVar = generateIlName()
  let lua = `local ${stateVar}=${heavyMath(1)} while true do `
  for (let i = 0; i < blocks.length; i++) {
    if (i === 0) lua += `if ${stateVar}==${heavyMath(1)} then ${blocks[i]} ${stateVar}=${heavyMath(2)} `
    else lua += `elseif ${stateVar}==${heavyMath(i+1)} then ${blocks[i]} ${stateVar}=${heavyMath(i+2)} `
  }
  lua += `elseif ${stateVar}==${heavyMath(blocks.length+1)} then break end end `
  return lua
}

// ─── Runtime string encoder ───────────────────────────────────────────────────

function runtimeString(str) {
  return `string.char(${str.split('').map(c => heavyMath(c.charCodeAt(0))).join(',')})`
}

// ─── VM Real (capa más profunda) — cifrado Rolling-XOR Affine con doble sal ───

function buildTrueVM(payloadStr) {
  const STACK   = generateIlName()
  const KEY     = generateIlName()
  const ORDER   = generateIlName()
  const SALT    = generateIlName()
  const SALT2   = generateIlName()   // Segunda sal para mayor resistencia

  const seed    = Math.floor(Math.random() * 200) + 50
  const saltVal = Math.floor(Math.random() * 250) + 1
  const salt2   = Math.floor(Math.random() * 127) + 1   // primo pequeño

  let vmCore = `local ${STACK}={} local ${KEY}=${heavyMath(seed)} `
             + `local ${SALT}=${heavyMath(saltVal)} local ${SALT2}=${heavyMath(salt2)} `

  const chunkSize = 12    // chunks más pequeños → más slots falsos posibles
  const realChunks = []
  for (let i = 0; i < payloadStr.length; i += chunkSize)
    realChunks.push(payloadStr.slice(i, i + chunkSize))

  // ≈ 4× de slots (3× antes → 4×) → más relleno falso
  const totalChunks = realChunks.length * 4
  const realOrder   = []
  let currentReal   = 0
  let globalIndex   = 0

  const poolVars = []
  for (let i = 0; i < totalChunks; i++) {
    const memName = generateIlName()
    poolVars.push(memName)
    const mustPlace = (totalChunks - i) === (realChunks.length - currentReal)
    if (currentReal < realChunks.length && (Math.random() > 0.6 || mustPlace)) {
      realOrder.push(i + 1)
      const chunk = realChunks[currentReal]
      const encBytes = []
      for (let j = 0; j < chunk.length; j++) {
        // Rolling-XOR Affine con dos sales: (byte + seed + idx*salt + idx²*salt2) % 256
        const enc = (chunk.charCodeAt(j) + seed + (globalIndex * saltVal) + (globalIndex * globalIndex * salt2)) % 256
        encBytes.push(heavyMath(enc))
        globalIndex++
      }
      vmCore += `local ${memName}={${encBytes.join(',')}} `
      currentReal++
    } else {
      const fakeLen = Math.floor(Math.random() * 25) + 8
      const fakeBytes = Array.from({length: fakeLen}, () => heavyMath(Math.floor(Math.random() * 255)))
      vmCore += `local ${memName}={${fakeBytes.join(',')}} `
    }
  }

  vmCore += `local _pool={${poolVars.join(',')}} `
          + `local ${ORDER}={${realOrder.map(n => heavyMath(n)).join(',')}} `

  const idxVar  = generateIlName()
  const byteVar = generateIlName()
  const gIdx    = generateIlName()

  // Decode loop con 3 Tamper Checks silenciosos entretejidos
  vmCore += `local ${gIdx}=0 `
          + `for _,${idxVar} in ipairs(${ORDER}) do `
          +   `for _,${byteVar} in ipairs(_pool[${idxVar}]) do `
          +     `if type(math.pi)=="string" then ${KEY}=(${KEY}+137)%256 end `          // corrupción silenciosa 1
          +     `if type(tostring)~="function" then ${SALT}=(${SALT}+31)%256 end `      // corrupción silenciosa 2
          +     `if type(nil)=="table" then ${SALT2}=(${SALT2}+97)%256 end `            // corrupción silenciosa 3
          +     `local _d=(${byteVar}-${KEY}-${gIdx}*${SALT}-${gIdx}*${gIdx}*${SALT2})%256 `
          +     `if _d<0 then _d=_d+256 end `
          +     `table.insert(${STACK},string.char(math.floor(_d))) `
          +     `${gIdx}=${gIdx}+1 `
          +   `end `
          + `end `

  vmCore += `local _e=table.concat(${STACK}) ${STACK}=nil `

  const ASSERT     = `getfenv()[${runtimeString("assert")}]`
  const LOADSTRING = `getfenv()[${runtimeString("loadstring")}]`
  const GAME       = `getfenv()[${runtimeString("game")}]`
  const HTTPGET    = runtimeString("HttpGet")

  if (payloadStr.includes("http"))
    vmCore += `${ASSERT}(${LOADSTRING}(${GAME}[${HTTPGET}](${GAME},_e)))() `
  else
    vmCore += `${ASSERT}(${LOADSTRING}(_e))() `

  return vmCore
}

// ─── VM Individual (capa intermedia) ──────────────────────────────────────────

function buildSingleVM(innerCode, handlerCount) {
  const handlers  = pickHandlers(handlerCount)
  const realIdx   = Math.floor(Math.random() * handlerCount)
  const DISPATCH  = generateIlName()
  let out = `local lM={} `

  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx)
      out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunk(6)} ${innerCode} end `
    else
      out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunk(4)} return nil end `
  }

  out += `local ${DISPATCH}={`
  for (let i = 0; i < handlers.length; i++) out += `[${heavyMath(i+1)}]=${handlers[i]},`
  out += `} `

  const execBlocks = []
  for (let i = 0; i < handlers.length; i++) execBlocks.push(`${DISPATCH}[${heavyMath(i+1)}](lM)`)
  out += applyCFF(execBlocks)
  return out
}

// ─── 22 VMs reales (capa profunda) ────────────────────────────────────────────

function build22xVM(payloadStr) {
  let vm = buildTrueVM(payloadStr)
  for (let i = 0; i < 21; i++) {   // 1 TrueVM + 21 SingleVM = 22 total
    vm = buildSingleVM(vm, Math.floor(Math.random() * 3) + 3)
  }
  return vm
}

// ─── Capa DECOY externa (lo que se ve primero al analizar) ────────────────────
//  Parece ser "la protección", pero sólo envuelve el núcleo real.
//  Son VMs falsas que simplemente ejecutan el siguiente nivel con pcall.

function buildDecoyLayer(innerCode) {
  // 4 VMs decoy apiladas sobre el código real
  let code = innerCode
  for (let d = 0; d < 4; d++) {
    const fnWrap  = generateIlName()
    const okVar   = generateIlName()
    const errVar  = generateIlName()
    const handlers = pickHandlers(Math.floor(Math.random() * 3) + 4)
    const realIdx  = Math.floor(Math.random() * handlers.length)
    const DISPATCH = generateIlName()

    let layer = `local lM={} `
    for (let i = 0; i < handlers.length; i++) {
      if (i === realIdx) {
        // Handler real: envuelve en pcall con junk alrededor
        layer += `local ${handlers[i]}=function() `
               + `${generateJunk(8)} `
               + `local ${fnWrap}=function() ${code} end `
               + `local ${okVar},${errVar}=pcall(${fnWrap}) `
               + `if not ${okVar} then error(${errVar}) end `
               + `end `
      } else {
        // Handlers falsos: junk puro que retorna inmediatamente
        layer += `local ${handlers[i]}=function() ${generateJunk(5)} return nil end `
      }
    }

    layer += `local ${DISPATCH}={`
    for (let i = 0; i < handlers.length; i++) layer += `[${heavyMath(i+1)}]=${handlers[i]},`
    layer += `} `

    const execBlocks = []
    for (let i = 0; i < handlers.length; i++) execBlocks.push(`${DISPATCH}[${heavyMath(i+1)}]()`)
    layer += applyCFF(execBlocks)
    code = layer
  }
  return code
}

// ─── Protecciones extra + anti-debug ──────────────────────────────────────────

function getExtraProtections() {
  const antiDebuggers =
    `local _adT=os.clock() for _=1,150000 do end if os.clock()-_adT>5.0 then while true do end end ` +
    `if debug~=nil and debug.getinfo then local _i=debug.getinfo(1) if _i.what~="main" and _i.what~="Lua" then while true do end end end ` +
    `local _adOk,_adE=pcall(function() error("__v") end) if not string.find(tostring(_adE),"__v") then while true do end end ` +
    `if getmetatable(_G)~=nil then while true do end end ` +
    `if type(print)~="function" then while true do end end `

  const rawTampers = [
    `if math.pi<3.14 or math.pi>3.15 then _err() end`,
    `if bit32 and bit32.bxor(10,5)~=15 then _err() end`,
    `if type(tostring)~="function" then _err() end`,
    `if not string.match("chk","^c.*k$") then _err() end`,
    `if type(coroutine.create)~="function" then _err() end`,
    `if type(table.concat)~="function" then _err() end`,
    `local _tm1=os.time() local _tm2=os.time() if _tm2<_tm1 then _err() end`,
    `if math.abs(-10)~=10 then _err() end`,
    `if gcinfo and gcinfo()<0 then _err() end`,
    `if type(next)~="function" then _err() end`,
    `if string.len("a")~=1 then _err() end`,
    `if type(table.insert)~="function" then _err() end`,
    `if string.byte("Z",1)~=90 then _err() end`,
    `if math.floor(-1/10)~=-1 then _err() end`,
    `if (true and 1 or 2)~=1 then _err() end`,
    `if type(1)~="number" then _err() end`,
    `if type(pcall)~="function" then _err() end`,
    // Nuevos
    `if select("#")~=0 then _err() end`,
    `if type(ipairs)~="function" then _err() end`,
    `if type(pairs)~="function" then _err() end`,
    `if type(rawget)~="function" then _err() end`,
    `if type(setmetatable)~="function" then _err() end`
  ]

  let guards = ""
  for (const t of rawTampers) {
    const fnName  = generateIlName()
    const errName = generateIlName()
    const injected = t.replace("_err()", `${errName}("!")`)
    guards += `local ${fnName}=function() local ${errName}=error ${injected} end ${fnName}() `
  }

  return antiDebuggers + guards
}

// ─── Punto de entrada ─────────────────────────────────────────────────────────

function obfuscate(sourceCode) {
  if (!sourceCode) return '--ERROR'

  const antiDebug =
    `local _clk=os.clock local _t=_clk() for _=1,150000 do end ` +
    `if os.clock()-_t>5.0 then while true do end end `

  const extraProtections = getExtraProtections()

  let payloadToProtect = ""
  const isLoadstringRegex =
    /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i
  const match = sourceCode.match(isLoadstringRegex)
  if (match) payloadToProtect = match[1]
  else payloadToProtect = detectAndApplyMappings(sourceCode)

  // 1. 22 VMs reales profundas
  const deepVM = build22xVM(payloadToProtect)

  // 2. Capa decoy externa (lo que el analista ve primero)
  const decoyWrapped = buildDecoyLayer(deepVM)

  // 3. Junk + anti-debug + protecciones + código final
  const result =
    `${HEADER} ` +
    `${generateJunk(70)} ` +
    `${antiDebug} ` +
    `${extraProtections} ` +
    `${generateJunk(30)} ` +
    `${decoyWrapped}`

  return result.replace(/\s+/g, " ").trim()
}

module.exports = { obfuscate }
