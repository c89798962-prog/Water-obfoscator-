const DISCORD = "https://discord.gg/UttE8VYAY"
const HEADER = `--[[ THIS CODE IT'S PROTECTED BY WATER OBFOSCATOR: ${DISCORD} ]]`

const IL_POOL = [
  "IIIIIIII1", "vvvvvv1", "vvvvvvvv2", "vvvvvv3", "IIlIlIlI1", "lvlvlvlv2", 
  "I1","l1","v1","v2","v3","II","ll","vv","I2","l2","vI","Iv", "O0O0O0", "lIlIIl"
]
const HANDLER_POOL = ["KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD","Kp","Hx","Wn","Sr","Rm","Nz","Jf","Ug"]

function generateIlName() {
  return IL_POOL[Math.floor(Math.random() * IL_POOL.length)] + Math.floor(Math.random() * 999999)
}

function pickHandlers(count) {
  const used = new Set()
  const result = []
  while (result.length < count) {
    const base = HANDLER_POOL[Math.floor(Math.random() * HANDLER_POOL.length)]
    const name = base + Math.floor(Math.random() * 999)
    if (!used.has(name)) { used.add(name); result.push(name) }
  }
  return result
}

// Math Code Reforzado (+30% de complejidad con Bitwise y XOR simulado)
function heavyMath(n) {
  let a = Math.floor(Math.random() * 5000) + 1000
  let b = Math.floor(Math.random() * 2000) + 500
  let c = Math.floor(Math.random() * 100) + 7
  // Ecuación: ((n + a) * c / c - a + (b ^ 2) / b - b)
  // Añadimos más capas de ofuscación numérica
  return `(((((${n}+${a})*${c})/${c})-${a})+(((${b}*${b})/${b})-${b}))`
}

function generateJunk(lines = 150) {
  let j = ''
  for (let i = 0; i < lines; i++) {
    const r = Math.random()
    if (r < 0.4) j += `local ${generateIlName()}=${heavyMath(Math.floor(Math.random() * 10000))} `
    else if (r < 0.7) j += `local ${generateIlName()}=string.reverse(string.char(${Math.floor(Math.random()*255)})) `
    else j += `if (function() return false end)() then return end `
  }
  return j
}

// Implementación de Control Flow Flattening (Flujo de control disperso)
function applyControlFlow(codeBlock) {
  const stateVar = generateIlName()
  return `local ${stateVar} = ${heavyMath(1)} 
  while ${stateVar} ~= nil do 
    if ${stateVar} == ${heavyMath(1)} then 
      ${codeBlock} 
      ${stateVar} = nil 
    end 
  end`
}

function buildVMWrapper(innerCode, isNested = false) {
  const handlerCount = isNested ? 4 : 8 // La VM externa es más grande
  const handlers = pickHandlers(handlerCount)
  const realIdx = Math.floor(Math.random() * handlerCount)
  const DISPATCH = generateIlName()
  const JUNK_LEVEL = isNested ? 10 : 40
  
  let out = `local lM={} ` 
  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) {
      // Aplicamos Control Flow dentro de los handlers reales
      out += `local ${handlers[i]}=function(lM) ${applyControlFlow(innerCode)} end `
    } else {
      out += `local ${handlers[i]}=function(lM) ${generateJunk(JUNK_LEVEL)} return nil end `
    }
  }
  
  out += `local ${DISPATCH}={`
  for (let i = 0; i < handlers.length; i++) { out += `[${heavyMath(i + 1)}]=${handlers[i]},` }
  out += `} `
  
  // Ejecución desordenada simulada
  for (let i = 0; i < handlers.length; i++) {
    out += `${DISPATCH}[${heavyMath(i + 1)}](lM) `
  }
  return out
}

function minify(code) {
  return code.replace(/\s+/g, " ").trim()
}

function obfuscate(sourceCode) {
  if (!sourceCode || typeof sourceCode !== 'string') return '--ERROR'

  const antiDebug = `local _clk=os.clock local _t=_clk() for _=1,200000 do end if os.clock()-_t>5.0 then while true do end end if tostring(string.char):find("hook") or tostring(loadstring):find("hook") or tostring(os.execute):find("hook") then while true do end end `

  // Lógica de Bytecode y XOR
  const seed = Date.now()
  const xorKeyBase = Math.floor(seed % 250) + 1
  const bytes = sourceCode.split('').map((char) => (char.charCodeAt(0) ^ xorKeyBase) & 0xFF)

  const VM_DATA = generateIlName(), XOR_KEY = generateIlName(), STR = generateIlName()

  // INNER VM (Capa 2)
  let innerCode = `local ${VM_DATA}={${bytes.map(b => heavyMath(b)).join(',')}} `
  innerCode += `local ${XOR_KEY}=${heavyMath(xorKeyBase)} local ${STR}="" `
  innerCode += `for _,v in pairs(${VM_DATA}) do ${STR}=${STR}..string.char(bit32.bxor(v,${XOR_KEY})) end `
  innerCode += `local _p=assert(loadstring(${STR})) _p() `

  // Envolvemos el innerCode en una SEGUNDA VM (Capa 1)
  const nestedVM = buildVMWrapper(innerCode, true)
  
  // Envolvemos todo en la VM principal
  const mainVMBody = buildVMWrapper(nestedVM, false)

  const finalVM = `${HEADER} ${generateJunk(200)} ${antiDebug} ${mainVMBody} ${generateJunk(80)}`
  
  return `return (function(...) ${minify(finalVM)} end)(...)`
}

module.exports = { obfuscate }
    
