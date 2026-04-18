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
  let execBlocks = []
  for (let i = 0; i < handlers.length; i++) {
    execBlocks.push(`${DISPATCH}[${heavyMath(i + 1)}](lM)`)
  }
  out += applyCFF(execBlocks)
  return out
}

function buildTripleVM(payload) {
  return buildSingleVM(buildSingleVM(buildSingleVM(payload, 4), 6), 8)
}

function obfuscate(sourceCode) {
  if (!sourceCode) return '--ERROR'
  const antiDebug = `local _clk=os.clock local _t=_clk() for _=1,100000 do end if os.clock()-_t>5.5 then while true do end end `
  
  const isLoadstringRegex = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i
  const match = sourceCode.match(isLoadstringRegex)

  let corePayload = ""
  if (match) {
    const urlBytewise = match[1].split('').map(c => heavyMath(c.charCodeAt(0))).join(',')
    corePayload = `loadstring(game:HttpGet(string.char(${urlBytewise})))()`
  } else {
    const bytes = sourceCode.split('').map(c => heavyMath(c.charCodeAt(0))).join(',')
    corePayload = `assert(loadstring(string.char(${bytes})))()`
  }

  const tripleVM = buildTripleVM(corePayload)
  const bytecode = []
  for(let i=0; i<tripleVM.length; i++) { bytecode.push(tripleVM.charCodeAt(i)) }

  const BC_VAR = generateIlName()
  const STR_VAR = generateIlName()
  
  let finalLua = `${HEADER} ${antiDebug} `
  finalLua += `local ${BC_VAR} = {`
  for(let i=0; i<bytecode.length; i+=Math.ceil(bytecode.length/5)) {
    finalLua += `{${bytecode.slice(i, i+Math.ceil(bytecode.length/5)).map(b => heavyMath(b)).join(',')}},`
  }
  finalLua += `} `
  finalLua += `local ${STR_VAR}="" for _,v in pairs(${BC_VAR}) do for _,b in pairs(v) do ${STR_VAR}=${STR_VAR}..string.char(b) end end `
  finalLua += `assert(loadstring(${STR_VAR}))()`

  return finalLua.replace(/\s+/g, " ").trim()
}

module.exports = { obfuscate }
                  
