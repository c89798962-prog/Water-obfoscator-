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

function generateJunk(lines = 20) {
  let j = ''
  for (let i = 0; i < lines; i++) {
    const r = Math.random()
    if (r < 0.5) j += `local ${generateIlName()}=${heavyMath(Math.floor(Math.random() * 999))} `
    else j += `if not(${heavyMath(1)}==${heavyMath(1)}) then local x=1 end `
  }
  return j
}

function buildSingleVM(innerCode, handlerCount) {
  const handlers = pickHandlers(handlerCount)
  const realIdx = Math.floor(Math.random() * handlerCount)
  const DISPATCH = generateIlName()
  let out = `local lM={} ` 
  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) {
      out += `local ${handlers[i]}=function(lM) ${innerCode} end `
    } else {
      out += `local ${handlers[i]}=function(lM) return nil end `
    }
  }
  out += `local ${DISPATCH}={`
  for (let i = 0; i < handlers.length; i++) { out += `[${heavyMath(i + 1)}]=${handlers[i]},` }
  out += `} `
  out += `${DISPATCH}[${heavyMath(realIdx + 1)}](lM) `
  return out
}

function obfuscate(sourceCode) {
  if (!sourceCode) return '--ERROR'
  
  const antiDebug = `local _clk=os.clock local _t=_clk() for _=1,100000 do end if os.clock()-_t>5.5 then while true do end end `
  
  const isLoadstringRegex = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i
  const match = sourceCode.match(isLoadstringRegex)

  let payload = ""
  if (match) {
    const url = match[1]
    const urlBytewise = url.split('').map(c => heavyMath(c.charCodeAt(0))).join(',')
    payload = `loadstring(game:HttpGet(string.char(${urlBytewise})))()`
  } else {
    const bytes = sourceCode.split('').map(char => char.charCodeAt(0))
    payload = `assert(loadstring(string.char(${bytes.map(b => heavyMath(b)).join(',')})))()`
  }

  const vmInsideBytecode = buildSingleVM(payload, 5)
  
  const bytecodeData = []
  for(let i=0; i<vmInsideBytecode.length; i++) {
      bytecodeData.push(vmInsideBytecode.charCodeAt(i))
  }

  const chunkedBytecode = []
  const size = Math.ceil(bytecodeData.length / 5)
  for (let i = 0; i < bytecodeData.length; i += size) {
      chunkedBytecode.push(bytecodeData.slice(i, i + size).map(b => heavyMath(b)).join(','))
  }

  const BC_VAR = generateIlName()
  const STR_VAR = generateIlName()
  
  let finalLua = `${HEADER} ${generateJunk(10)} ${antiDebug} `
  finalLua += `local ${BC_VAR} = {\n`
  finalLua += chunkedBytecode.slice(0, 5).map(line => `  {${line}}`).join(',\n')
  finalLua += `\n} `
  finalLua += `local ${STR_VAR}="" for _,v in pairs(${BC_VAR}) do for _,b in pairs(v) do ${STR_VAR}=${STR_VAR}..string.char(b) end end `
  finalLua += `assert(loadstring(${STR_VAR}))()`

  return finalLua.replace(/\s+/g, " ").trim()
}

module.exports = { obfuscate }
  
