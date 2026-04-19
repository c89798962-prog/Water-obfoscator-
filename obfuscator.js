// ╔══════════════════════════════════════════════════════════════╗
// ║         VVMER OBFUSCATOR - PL CHAOS STYLE                   ║
// ║  Output: ~32KB | Hex everywhere | VM opcodes | lM spam      ║
// ╚══════════════════════════════════════════════════════════════╝

const HEADER = `--[[ this code it's protected by vvmer obfoscator ]]`

// ─── POOLS DE NOMBRES ─────────────────────────────────────────

const IL_POOL = [
  "IIIIIIII1","vvvvvv1","vvvvvvvv2","vvvvvv3","IIlIlIlI1",
  "lvlvlvlv2","I1","l1","v1","v2","v3","II","ll","vv","I2"
]
const HANDLER_POOL = ["KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD"]

// Nombres largos mixtos estilo PL (letras+números mezclados)
const PL_NAME_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
function plName(len) {
  // Primer carácter siempre letra
  let s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"[ri(0,51)]
  for (let i = 1; i < len; i++) s += PL_NAME_CHARS[ri(0, PL_NAME_CHARS.length-1)]
  return s
}

// Opcodes VM estilo PL (nombres largos con mayúsculas y números)
const OPCODE_NAMES = [
  "ZRueljkq","gft2S7RQz9j","GNb35djX","wehVp01gapwv","sCFZXw6oBq",
  "GKEu6fQLNcVs","zj5c3d9MLuCCjF","Kz58USBhXiEsR","oBt2WLhe0Vu",
  "cU0rzVS6hTUw","C0uRzdkHfNRIT","tNjW33S","ioiMRd3doMO76e",
  "XNEZKqQGdH","JOOwEaX","oFtQMxBMfbJ","TFaNAJ","xzub6ZFKCwI"
]

function generateIlName() {
  return IL_POOL[ri(0, IL_POOL.length-1)] + ri(0, 99999)
}
function pickHandlers(count) {
  const used = new Set(), result = []
  while (result.length < count) {
    const name = HANDLER_POOL[ri(0,HANDLER_POOL.length-1)] + ri(0,99)
    if (!used.has(name)) { used.add(name); result.push(name) }
  }
  return result
}

// ─── HEX HELPERS ──────────────────────────────────────────────

function ri(a, b) { return Math.floor(Math.random()*(b-a+1))+a }

// Número a hex con formato estilo PL (casing aleatorio, padding aleatorio)
function hx(n) {
  const abs = Math.abs(n)
  const h = abs.toString(16)
  // Casing mixto aleatorio como PL
  let mixed = ""
  for (const c of h) mixed += Math.random()>0.5 ? c.toUpperCase() : c
  // Padding de ceros aleatorio (0-6 ceros)
  const pad = "0".repeat(ri(0,4))
  const prefix = Math.random()>0.5 ? "0X" : "0x"
  const result = `${prefix}${pad}${mixed}`
  return n < 0 ? `(-${result})` : result
}

// Hex index para tablas: [0X3F4E]
function hi() { return `[${hx(ri(0x0001, 0x7FFF))}]` }

// Constante hex grande: 0X3a6F895D
function hbig() {
  const n = ri(0x100000, 0xFFFFFFF)
  const h = n.toString(16)
  let mixed = ""
  for (const c of h) mixed += Math.random()>0.5 ? c.toUpperCase() : c
  const prefix = Math.random()>0.5 ? "0X" : "0x"
  return `${prefix}${mixed}`
}

// Hex negativo grande
function hnbig() {
  const n = ri(0x100000, 0xFFFFFFF)
  const h = n.toString(16)
  let mixed = ""
  for (const c of h) mixed += Math.random()>0.5 ? c.toUpperCase() : c
  const prefix = Math.random()>0.5 ? "0X" : "0x"
  return `(-${prefix}${mixed})`
}

// ─── VM OBJECT ────────────────────────────────────────────────
// Genera el objeto VM con opcodes estilo PL

function generateVMObject(vmVar) {
  const ops = OPCODE_NAMES
  let code = `local ${vmVar}={} `
  // Constantes (.d table)
  code += `${vmVar}.d={`
  for (let i = 1; i <= 11; i++) {
    code += `[${hx(i)}]=${hx(ri(1,15))},`
  }
  code += `} `
  // Opcodes (operaciones matemáticas simples disfrazadas)
  const opDefs = [
    `function(a,b) return (b and a+b or a) end`,
    `function(a,b) return (b and a-b or -a) end`,
    `function(a,b) return (b and a*b or a*a) end`,
    `function(a,b) return (b and a/b or a/2) end`,
    `function(a,b) return (b and a%b or a%7) end`,
    `function(a,b) return (b and (a>b and a or b) or math.abs(a)) end`,
    `function(a,b) return (b and (a<b and a or b) or math.abs(a)) end`,
    `function(a,b) return (b and a^b or math.sqrt(math.abs(a))) end`,
    `function(a,b) return (b and a+b*2 or a+1) end`,
    `function(a,b) return (b and a-b*2 or a-1) end`,
    `function(a,b) return (b and (a+b)*(a-b) or a*a-1) end`,
    `function(a,b) return (b and math.max(a,b) or math.max(a,0)) end`,
    `function(a,b) return (b and math.min(a,b) or math.min(a,100)) end`,
    `function(a,b) return (b and a*b+b or a+2) end`,
    `function(a,b) return (b and a/b+1 or a+3) end`,
    `function(a,b) return (b and a%b+a or a%3) end`,
    `function(a,b) return (b and (a*b)%(b+1) or a%5) end`,
    `function(a,b) return (b and a+b+1 or a+4) end`,
  ]
  for (let i = 0; i < ops.length; i++) {
    code += `${vmVar}.${ops[i]}=${opDefs[i % opDefs.length]} `
  }
  return code
}

// ─── JUNK ESTILO PL ──────────────────────────────────────────
// La magia: fake table assignments con opcodes del VM

function plJunkLine(vmVar, vars) {
  const op = OPCODE_NAMES[ri(0, OPCODE_NAMES.length-1)]
  const op2 = OPCODE_NAMES[ri(0, OPCODE_NAMES.length-1)]
  const op3 = OPCODE_NAMES[ri(0, OPCODE_NAMES.length-1)]
  const v = vars[ri(0, vars.length-1)]
  const v2 = vars[ri(0, vars.length-1)]
  const patterns = [
    // Asignación a tabla con hex index
    `(${v})${hi()}=${hbig()}+(${vmVar}.${op}((${vmVar}.${op2}((${vmVar}.d[${hx(ri(1,10))}]),(${vmVar}.d[${hx(ri(1,10))}])),(${vmVar}.d[${hx(ri(1,10))}]>=(-${hbig()}) and ${vmVar}.d[${hx(ri(1,10))}] or ${hbig()})));`,
    // Reasignación con ternario hex
    `${v}=${hbig()}+(((${vmVar}.${op}((${v2}${hi()}),(${vmVar}.d[${hx(ri(1,10))}]))<=${vmVar}.${op2}((${hbig()}),(${vmVar}.d[${hx(ri(1,10))}])) and ${vmVar}.d[${hx(ri(1,10))}] or ${hbig()})));`,
    // Asignación doble
    `(${v})${hi()}=${hnbig()}+(((${vmVar}.${op}((${vmVar}.${op2}((${vmVar}.d[${hx(ri(1,10))}]))))-${vmVar}.d[${hx(ri(1,10))}])));${v}=${hbig()}+((${vmVar}.${op3}((${v2}${hi()}),(${vmVar}.d[${hx(ri(1,10))}]))));`,
    // Triple operación
    `(${v})${hi()}=${hbig()}+((((${vmVar}.${op}((${vmVar}.d[${hx(ri(1,10))}]),(${hbig()}))*${vmVar}.${op2}((${vmVar}.d[${hx(ri(1,10))}]),(${vmVar}.d[${hx(ri(1,10))}])))%(${hbig()}-${hnbig()})));`,
    // Comparación anidada
    `(${v2})${hi()}=${hbig()}+(((((${vmVar}.d[${hx(ri(1,10))}]<${vmVar}.${op}((${vmVar}.d[${hx(ri(1,10))}])) and (${v}${hi()}%${vmVar}.d[${hx(ri(1,10))}]) or ${v}${hi()})*${vmVar}.${op2}((${vmVar}.d[${hx(ri(1,10))}]))))-(${vmVar}.d[${hx(ri(1,10))}]>=${hnbig()} and ${vmVar}.d[${hx(ri(1,10))}] or ${hnbig()})));`,
  ]
  return patterns[ri(0, patterns.length-1)]
}

function generatePLJunk(vmVar, vars, lines) {
  let j = ""
  for (let i = 0; i < lines; i++) j += plJunkLine(vmVar, vars)
  return j
}

// ─── FOR LOOP CFF ESTILO PL ──────────────────────────────────

function forCFF(vmVar, vars, blocks) {
  const loopVar = plName(ri(8,16))
  const start = hx(ri(0x50, 0x80))
  const step  = hx(ri(0x10, 0x30))
  // Genera valores hex para cada bloque
  const vals = blocks.map((_, i) => {
    const base = 0x50 + i * 0x19
    return hx(base)
  })
  const end = hx(0x50 + blocks.length * 0x19)

  let code = `for ${loopVar}=${start},${end},${step} do `
  blocks.forEach((block, i) => {
    if (i === 0) code += `if ${loopVar}==${vals[i]} then ${generatePLJunk(vmVar,vars,3)} ${block} `
    else code += `elseif ${loopVar}==${vals[i]} then ${generatePLJunk(vmVar,vars,2)} ${block} `
  })
  code += `end end `
  return code
}

// ─── ENCRIPTACIÓN PAYLOAD ─────────────────────────────────────

function buildTrueVM(payloadStr, vmVar) {
  const STACK = generateIlName()
  const KEY = generateIlName()
  const ORDER = generateIlName()
  const seed = ri(50, 200)

  let vmCore = `local ${STACK}={} local ${KEY}=${hx(seed)} `

  const chunkSize = 15
  let realChunks = []
  for (let i = 0; i < payloadStr.length; i += chunkSize)
    realChunks.push(payloadStr.slice(i, i + chunkSize))

  let poolVars = [], realOrder = []
  let totalChunks = realChunks.length * 3
  let currentReal = 0

  for (let i = 0; i < totalChunks; i++) {
    let memName = generateIlName()
    poolVars.push(memName)
    if (currentReal < realChunks.length &&
        (Math.random() > 0.5 || (totalChunks - i) === (realChunks.length - currentReal))) {
      realOrder.push(i + 1)
      let chunk = realChunks[currentReal]
      let enc = chunk.split('').map(c => hx(c.charCodeAt(0) ^ seed))
      vmCore += `local ${memName}={${enc.join(',')}} `
      currentReal++
    } else {
      let fake = Array.from({length: ri(5,20)}, () => hx(ri(0,255)))
      vmCore += `local ${memName}={${fake.join(',')}} `
    }
  }

  vmCore += `local _pool={${poolVars.join(',')}} `
  vmCore += `local ${ORDER}={${realOrder.map(n => hx(n)).join(',')}} `
  const idxV = generateIlName(), byteV = generateIlName()
  vmCore += `for _,${idxV} in ipairs(${ORDER}) do for _,${byteV} in ipairs(_pool[${idxV}]) do `
  vmCore += `table.insert(${STACK},string.char(bit32.bxor(${byteV},${KEY}))) end end `
  vmCore += `local _e=table.concat(${STACK}) ${STACK}=nil `

  const rts = s => `string.char(${s.split('').map(c=>hx(c.charCodeAt(0))).join(',')})`
  const ASSERT = `getfenv()[${rts("assert")}]`
  const LOADSTRING = `getfenv()[${rts("loadstring")}]`
  const GAME = `getfenv()[${rts("game")}]`
  const HTTPGET = rts("HttpGet")

  if (payloadStr.includes("http")) {
    vmCore += `${ASSERT}(${LOADSTRING}(${GAME}[${HTTPGET}](${GAME},_e)))()`
  } else {
    vmCore += `${ASSERT}(${LOADSTRING}(_e))()`
  }
  return vmCore
}

// ─── SINGLE VM (lM style) con junk PL ─────────────────────────

function buildSingleVM(innerCode, handlerCount, vmVar, vars) {
  const handlers = pickHandlers(handlerCount)
  const realIdx = ri(0, handlerCount-1)
  const DISPATCH = generateIlName()
  let out = `local lM={} `
  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) {
      out += `local ${handlers[i]}=function(lM) local lM=lM; ${generatePLJunk(vmVar,vars,4)} ${innerCode} end `
    } else {
      out += `local ${handlers[i]}=function(lM) local lM=lM; ${generatePLJunk(vmVar,vars,2)} return nil end `
    }
  }
  out += `local ${DISPATCH}={`
  for (let i = 0; i < handlers.length; i++) out += `[${hx(i+1)}]=${handlers[i]},`
  out += `} `
  // CFF estilo PL con for loop
  const stateV = generateIlName()
  out += `local ${stateV}=${hx(1)} while true do `
  for (let i = 0; i < handlers.length; i++) {
    if (i === 0) out += `if ${stateV}==${hx(1)} then ${DISPATCH}[${hx(1)}](lM) ${stateV}=${hx(2)} `
    else out += `elseif ${stateV}==${hx(i+1)} then ${DISPATCH}[${hx(i+1)}](lM) ${stateV}=${hx(i+2)} `
  }
  out += `elseif ${stateV}==${hx(handlers.length+1)} then break end end `
  return out
}

// ─── 12 VMs EN CASCADA ────────────────────────────────────────

function build12xVM(payloadStr, vmVar, vars) {
  let vm = buildTrueVM(payloadStr, vmVar)
  for (let i = 0; i < 11; i++) {
    vm = buildSingleVM(vm, ri(4,7), vmVar, vars)
  }
  return vm
}

// ─── 5 ANTI-DEBUGGERS ULTRA FRÁGILES ─────────────────────────

function antiDebuggers() {
  return (
    // AD-1: 1 sola iteración, threshold 0.00001 — cualquier lag lo mata
    `local _adT=os.clock() for _=${hx(1)},${hx(1)} do end if os.clock()-_adT>${hx(0)} then while true do end end ` +
    // AD-2: debug existe = muerte inmediata
    `if debug~=nil then while true do end end ` +
    // AD-3: pcall sentinel exacto — 1 char distinto = muerte
    `local _ok,_er=pcall(function() error(${hx(0x5644)}) end) if not _ok and not string.find(tostring(_er),tostring(${hx(0x5644)}),${hx(1)},true) then while true do end end ` +
    // AD-4: getmetatable(_G) no nil = hook detectado
    `if rawget~=nil and getmetatable(_G)~=nil then while true do end end ` +
    // AD-5: print fue reemplazada
    `if type(print)~=${hx(0)}.."function" then while true do end end `
  )
}

// ─── 12 ANTI-TAMPERS ──────────────────────────────────────────

function antiTampers() {
  return (
    `if math.pi<${hx(3)}.14 or math.pi>${hx(3)}.15 then while true do end end ` +
    `if bit32 and bit32.bxor(${hx(10)},${hx(5)})~=${hx(15)} then while true do end end ` +
    `if type(tostring)~="function" then while true do end end ` +
    `if not string.match("chk","^c.*k$") then while true do end end ` +
    `if type(coroutine.create)~="function" then while true do end end ` +
    `if type(table.concat)~="function" then while true do end end ` +
    `local _tm1=os.time() local _tm2=os.time() if _tm2<_tm1 then while true do end end ` +
    `if math.abs(-${hx(10)})~=${hx(10)} then while true do end end ` +
    `if gcinfo and gcinfo()<${hx(0)} then while true do end end ` +
    `if type(next)~="function" then while true do end end ` +
    `if string.len("a")~=${hx(1)} then while true do end end ` +
    `if type(table.insert)~="function" then while true do end end `
  )
}

// ─── FUNCIÓN PRINCIPAL ────────────────────────────────────────

function obfuscate(sourceCode) {
  if (!sourceCode) return '--ERROR'

  // 1. Crear nombre VM estilo PL
  const vmVar = plName(ri(10,18))

  // 2. Variables fake para el junk (estilo PL: nombres largos)
  const vars = Array.from({length:8}, () => plName(ri(8,16)))

  // 3. Generar objeto VM con opcodes
  const vmObj = generateVMObject(vmVar)

  // 4. Detectar payload
  const urlRegex = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i
  const match = sourceCode.match(urlRegex)
  const payload = match ? match[1] : sourceCode

  // 5. Anti-debug + Anti-tamper
  const adebug = antiDebuggers()
  const atamper = antiTampers()

  // 6. Junk PL antes del payload (para volumen)
  const junkBefore = generatePLJunk(vmVar, vars, 60)
  const junkMid    = generatePLJunk(vmVar, vars, 40)
  const junkAfter  = generatePLJunk(vmVar, vars, 40)

  // 7. Declarar variables fake locales (como PL)
  let fakeDecls = ""
  for (const v of vars) fakeDecls += `local ${v}={} `

  // 8. Build 12 VMs
  const finalVM = build12xVM(payload, vmVar, vars)

  // 9. Ensamblar
  let result = [
    HEADER,
    vmObj,
    fakeDecls,
    junkBefore,
    adebug,
    atamper,
    junkMid,
    `(function() ${finalVM} end)()`,
    junkAfter,
  ].join(" ")

  // 10. Normalizar espacios
  result = result.replace(/[ \t]+/g, " ").trim()

  // 11. Padding hasta ~32KB (32768 bytes)
  const TARGET = 32768
  if (result.length < TARGET) {
    const needed = TARGET - result.length
    const extraJunk = generatePLJunk(vmVar, vars, Math.ceil(needed / 120))
    result = result + " " + extraJunk.trim()
    // Recortar si se pasó ligeramente
    if (result.length > TARGET + 512) result = result.slice(0, TARGET)
  }

  return result
}

module.exports = { obfuscate }

// ─── USO ──────────────────────────────────────────────────────
// const { obfuscate } = require('./vvmer_obfuscator_pl')
// require('fs').writeFileSync('out.lua', obfuscate(`print("hola")`))
// → genera ~32KB de output estilo PL chaos
