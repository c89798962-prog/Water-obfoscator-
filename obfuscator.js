const DISCORD = "https://discord.gg/UttE8VYAY"
const HEADER = `--[[ this code it's protected by water obfoscator:${DISCORD} ]]`

const IL_POOL = ["IIIIIIII1", "vvvvvv1", "vvvvvvvv2", "vvvvvv3", "IIlIlIlI1", "lvlvlvlv2", "I1","l1","v1","v2","v3","II","ll","vv","I2","l2","vI","Iv"]
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
  let lua = `local ${stateVar}=${heavyMath(1)} while true do `
  for (let i = 0; i < blocks.length; i++) {
    if (i === 0) lua += `if ${stateVar}==${heavyMath(1)} then ${blocks[i]} ${stateVar}=${heavyMath(2)} `
    else lua += `elseif ${stateVar}==${heavyMath(i + 1)} then ${blocks[i]} ${stateVar}=${heavyMath(i + 2)} `
  }
  lua += `elseif ${stateVar}==${heavyMath(blocks.length + 1)} then break end end `
  return lua
}

// ESTA ES LA VM EXTREMA QUE PEDISTE
function buildExtremeVM(payload) {
  const STACK = generateIlName()
  const MEM = generateIlName()
  const PTR = generateIlName()
  const KEY = generateIlName()
  
  const seed = Math.floor(Math.random() * 250) + 1
  const bytes = payload.split('').map(c => c.charCodeAt(0))
  
  // CIFRADO POR ENCADENAMIENTO: Cada byte depende del anterior
  let encryptedBytes = []
  let last = seed
  for (let b of bytes) {
    let encrypted = b ^ last
    encryptedBytes.push(encrypted)
    last = encrypted
  }

  let out = `local ${STACK}={} local ${KEY}=${heavyMath(seed)} `
  out += `local ${MEM}={${encryptedBytes.map(b => heavyMath(b)).join(',')}} `
  out += `local ${PTR}=1 while ${PTR}<=#${MEM} do `
  out += `local _cur=${MEM}[${PTR}] `
  out += `table.insert(${STACK}, string.char(bit32.bxor(_cur, ${KEY}))) `
  out += `${KEY}=_cur ${PTR}=${PTR}+1 end `
  out += `local _res=table.concat(${STACK}) ${STACK}=nil `
  out += `assert(loadstring(_res))() `
  
  return out
}

function buildDoubleVM(payload) {
  // Metemos la VM EXTREMA dentro de tu sistema original de handlers
  return buildSingleVM(buildExtremeVM(payload), 7)
}

function obfuscate(sourceCode) {
  if (!sourceCode) return '--ERROR'
  const antiDebug = `local _clk=os.clock local _t=_clk() for _=1,150000 do end if os.clock()-_t>5.5 then while true do end end `
  
  let payload = ""
  const isLoadstringRegex = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i
  const match = sourceCode.match(isLoadstringRegex)

  if (match) {
    const url = match[1]
    // La URL ahora se inyecta como un flujo de bytes encadenados
    payload = `loadstring(game:HttpGet(string.char(${url.split('').map(c => c.charCodeAt(0)).join(',')})))()`
  } else {
    payload = sourceCode
  }

  const finalVM = buildDoubleVM(payload)
  const result = `${HEADER} ${generateJunk(60)} ${antiDebug} ${finalVM}`
  return result.replace(/\s+/g, " ").trim()
}

module.exports = { obfuscate }
