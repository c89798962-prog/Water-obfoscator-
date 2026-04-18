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

function buildTrueVM(payloadBytes) {
  const STACK = generateIlName()
  const MEM = generateIlName()
  const PTR = generateIlName()
  
  let vmCore = `local ${STACK}={} local ${MEM}={${payloadBytes.map(b => heavyMath(b)).join(',')}} `
  vmCore += `local ${PTR}=${heavyMath(1)} while ${PTR}<=(#${MEM}) do `
  vmCore += `table.insert(${STACK}, string.char(${MEM}[${PTR}])) ${PTR}=${PTR}+${heavyMath(1)} end `
  vmCore += `local _e = "" for _,v in pairs(${STACK}) do _e=_e..v end assert(loadstring(_e))() `
  
  return vmCore
}

function buildDoubleVM(payloadBytes) {
  const innerVM = buildTrueVM(payloadBytes)
  return buildSingleVM(innerVM, 7)
}

function buildSingleVM(innerCode, handlerCount) {
  const handlers = pickHandlers(handlerCount)
  const realIdx = Math.floor(Math.random() * handlerCount)
  const DISPATCH = generateIlName()
  let out = `local lM={} ` 
  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) {
      out += `local ${handlers[i]}=function(lM) ${generateJunk(10)} ${innerCode} end `
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

function obfuscate(sourceCode) {
  if (!sourceCode) return '--ERROR'
  const antiDebug = `local _clk=os.clock local _t=_clk() for _=1,150000 do end if os.clock()-_t>5.5 then while true do end end `
  
  let rawPayload = ""
  const isLoadstringRegex = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i
  const match = sourceCode.match(isLoadstringRegex)

  if (match) {
    const url = match[1]
    const urlBytes = url.split('').map(c => c.charCodeAt(0)).join(',')
    rawPayload = `loadstring(game:HttpGet(string.char(${urlBytes})))()`
  } else {
    rawPayload = sourceCode
  }

  const payloadBytes = rawPayload.split('').map(c => c.charCodeAt(0))
  const finalVM = buildDoubleVM(payloadBytes)
  
  const result = `${HEADER} ${generateJunk(50)} ${antiDebug} ${finalVM}`
  return result.replace(/\s+/g, " ").trim()
}

module.exports = { obfuscate }
