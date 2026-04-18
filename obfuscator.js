const DISCORD = "https://discord.gg/5E45u5eES"
const HEADER = `--[[ MIMOSA VM v4.5 - ${DISCORD} - Protegido ]]`

// Pool de variables con los nombres masivos que pediste
const IL_POOL = [
  "IIIIIIII1", "vvvvvv1", "vvvvvvvv2", "vvvvvv3", "IIlIlIlI1", "lvlvlvlv2", 
  "I1","l1","v1","v2","v3","II","ll","vv","I2","l2","vI","Iv"
]
const HANDLER_POOL = ["KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD","Kp","Hx","Wn","Sr","Rm","Nz","Jf","Ug"]

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

// Math Code Reforzado (+20% complejidad)
function lightMath(n) {
  let a = Math.floor(Math.random() * 1500) + 300
  let b = Math.floor(Math.random() * 800) + 100
  let c = Math.floor(Math.random() * 50) + 5
  // Estructura más pesada: ((n+a)-a + (b*c)/c - b)
  return `((((${n}+${a})-${a})+((${b}*${c})/${c}))-${b})`
}

function generateJunk(lines = 100) {
  let j = ''
  for (let i = 0; i < lines; i++) {
    const r = Math.random()
    if (r < 0.3) j += `local ${generateIlName()}=${lightMath(Math.floor(Math.random() * 999))} `
    else if (r < 0.6) j += `local ${generateIlName()}=string.char(${Math.floor(Math.random()*255)}) `
    else j += `if not(1==1) then local x=1 end `
  }
  return j
}

function buildVMWrapper(innerCode) {
  const handlerCount = 6
  const handlers = pickHandlers(handlerCount)
  const realIdx = Math.floor(Math.random() * handlerCount)
  const DISPATCH = generateIlName()
  
  let out = `local lM={} ` 
  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) {
      out += `local ${handlers[i]}=function(lM) ${generateJunk(20)} ${innerCode} end `
    } else {
      out += `local ${handlers[i]}=function(lM) return nil end `
    }
  }
  out += `local ${DISPATCH}={`
  for (let i = 0; i < handlers.length; i++) { out += `[${i + 1}]=${handlers[i]},` }
  out += `} `
  for (let i = 0; i < handlers.length; i++) {
    out += `${DISPATCH}[${i + 1}](lM) `
  }
  return out
}

function minify(code) {
  return code.replace(/\s+/g, " ").trim()
}

function obfuscate(sourceCode) {
  if (!sourceCode || typeof sourceCode !== 'string') return '--ERROR'

  const antiDebug = `local _clk=os.clock local _t=_clk() for _=1,100000 do end if os.clock()-_t>6.5 then while true do end end if tostring(string.char):find("hook") or tostring(loadstring):find("hook") then while true do end end `

  const isLoadstringRegex = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i
  const match = sourceCode.match(isLoadstringRegex)

  // ==========================================
  // MODO 1: WATERMARK + VM + LOADSTRING
  // ==========================================
  if (match) {
    const url = match[1]
    const urlBytes = url.split('').map(c => lightMath(c.charCodeAt(0))).join(',')
    
    // Ahora el Modo 1 usa la VM para esconder el loadstring
    const innerVM1 = `loadstring(game:HttpGet(string.char(${urlBytes})))()`
    const vmBody1 = buildVMWrapper(innerVM1)
    
    const finalCode = `${HEADER} ${generateJunk(120)} ${antiDebug} ${vmBody1}`
    return minify(finalCode)
  }

  // ==========================================
  // MODO 2: VM FUERTE (Sin cambios en lógica, solo math y nombres)
  // ==========================================
  const seed = Date.now()
  const xorKeyBase = Math.floor(seed % 250) + 1
  const bytes = sourceCode.split('').map((char) => (char.charCodeAt(0) ^ xorKeyBase) & 0xFF)

  const VM_DATA = generateIlName(), XOR_KEY = generateIlName(), STR = generateIlName()

  let innerCode = `local ${VM_DATA}={${bytes.map(b => lightMath(b)).join(',')}} `
  innerCode += `local ${XOR_KEY}=${lightMath(xorKeyBase)} local ${STR}="" `
  innerCode += `for _,v in pairs(${VM_DATA}) do ${STR}=${STR}..string.char(bit32.bxor(v,${XOR_KEY})) end `
  innerCode += `local _p=assert(loadstring(${STR})) _p() `

  let vmBody = buildVMWrapper(innerCode)
  const finalVM = `${HEADER} ${generateJunk(150)} ${antiDebug} ${vmBody} ${generateJunk(50)}`
  
  return `return function(...) do do ${minify(finalVM)} end end end`
}

module.exports = { obfuscate }
