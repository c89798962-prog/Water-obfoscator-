const DISCORD = "https://discord.gg/UttE8VYAY"
const HEADER = `--[[ this code it's protected by water obfoscator:${DISCORD} ]]`

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

function heavyMath(n) {
  let a = Math.floor(Math.random() * 3000) + 500
  let b = Math.floor(Math.random() * 50) + 2
  let c = Math.floor(Math.random() * 800) + 10
  let d = Math.floor(Math.random() * 20) + 2
  return `(((((${n}+${a})*${b})/${b})-${a})+((${c}*${d})/${d})-${c})`
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
  let lua = `local ${stateVar}=1 while true do `
  for (let i = 0; i < blocks.length; i++) {
    if (i === 0) lua += `if ${stateVar}==1 then ${blocks[i]} ${stateVar}=2 `
    else lua += `elseif ${stateVar}==${i + 1} then ${blocks[i]} ${stateVar}=${i + 2} `
  }
  lua += `elseif ${stateVar}==${blocks.length + 1} then break end end `
  return lua
}

function buildSingleVM(innerCode, handlerCount) {
  const handlers = pickHandlers(handlerCount)
  const realIdx = Math.floor(Math.random() * handlerCount)
  const DISPATCH = generateIlName()
  
  let out = `local lM={} ` 
  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) {
      out += `local ${handlers[i]}=function(lM) ${generateJunk(15)} ${innerCode} end `
    } else {
      out += `local ${handlers[i]}=function(lM) ${generateJunk(5)} return nil end `
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

function buildDoubleVM(payload) {
  const innerVM = buildSingleVM(payload, 4)
  const outerVM = buildSingleVM(innerVM, 6)
  return outerVM
}

function minify(code) {
  return code.replace(/\s+/g, " ").trim()
}

function obfuscate(sourceCode) {
  if (!sourceCode || typeof sourceCode !== 'string') return '--ERROR'

  const antiDebug = `local _clk=os.clock local _t=_clk() for _=1,150000 do end if os.clock()-_t>5.5 then while true do end end if tostring(string.char):find("hook") or tostring(loadstring):find("hook") then while true do end end `

  const isLoadstringRegex = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i
  const match = sourceCode.match(isLoadstringRegex)

  if (match) {
    const url = match[1]
    const urlBytes = url.split('').map(c => heavyMath(c.charCodeAt(0))).join(',')
    
    const innerPayload = `loadstring(game:HttpGet(string.char(${urlBytes})))()`
    const dualVmBody = buildDoubleVM(innerPayload)
    
    const finalCode = `${HEADER} ${generateJunk(120)} ${antiDebug} ${dualVmBody}`
    return minify(finalCode)
  }

  const seed = Date.now()
  const xorKeyBase = Math.floor(seed % 250) + 1
  const bytes = sourceCode.split('').map((char) => (char.charCodeAt(0) ^ xorKeyBase) & 0xFF)

  const VM_DATA = generateIlName(), XOR_KEY = generateIlName(), STR = generateIlName()

  let innerCode = `local ${VM_DATA}={${bytes.map(b => heavyMath(b)).join(',')}} `
  innerCode += `local ${XOR_KEY}=${heavyMath(xorKeyBase)} local ${STR}="" `
  
  let decodeLoop = `for _,v in pairs(${VM_DATA}) do ${STR}=${STR}..string.char(bit32.bxor(v,${XOR_KEY})) end `
  let execBlock = `local _p=assert(loadstring(${STR})) _p() `
  
  innerCode += decodeLoop + execBlock
  let dualVmBody = buildDoubleVM(innerCode)
  
  const finalVM = `${HEADER} ${generateJunk(150)} ${antiDebug} ${dualVmBody} ${generateJunk(50)}`
  
  return `return function(...) do do ${minify(finalVM)} end end end`
}

module.exports = { obfuscate }
  if (match) {
    const url = match[1]
    const urlBytes = url.split('').map(c => heavyMath(c.charCodeAt(0))).join(',')
    
    const innerPayload = `loadstring(game:HttpGet(string.char(${urlBytes})))()`
    const dualVmBody = buildDoubleVM(innerPayload)
    
    const finalCode = `${HEADER} ${generateJunk(120)} ${antiDebug} ${dualVmBody}`
    return minify(finalCode)
  }

  // ==========================================
  // MODO 2: DOUBLE VM + BYTECODE FUERTE
  // ==========================================
  const seed = Date.now()
  const xorKeyBase = Math.floor(seed % 250) + 1
  const bytes = sourceCode.split('').map((char) => (char.charCodeAt(0) ^ xorKeyBase) & 0xFF)

  const VM_DATA = generateIlName(), XOR_KEY = generateIlName(), STR = generateIlName()

  let innerCode = `local ${VM_DATA}={${bytes.map(b => heavyMath(b)).join(',')}} `
  innerCode += `local ${XOR_KEY}=${heavyMath(xorKeyBase)} local ${STR}="" `
  
  // Decodificación de Bytecode mediante Control Flow Flattening
  let decodeLoop = `for _,v in pairs(${VM_DATA}) do ${STR}=${STR}..string.char(bit32.bxor(v,${XOR_KEY})) end `
  let execBlock = `local _p=assert(loadstring(${STR})) _p() `
  
  // Juntamos todo en el núcleo y lo metemos a la Doble VM
  innerCode += decodeLoop + execBlock
  let dualVmBody = buildDoubleVM(innerCode)
  
  const finalVM = `${HEADER} ${generateJunk(150)} ${antiDebug} ${dualVmBody} ${generateJunk(50)}`
  
  return `return function(...) do do ${minify(finalVM)} end end end`
}

module.exports = { obfuscate }
  return `return function(...) do do ${minify(finalVM)} end end end`
}

module.exports = { obfuscate }
