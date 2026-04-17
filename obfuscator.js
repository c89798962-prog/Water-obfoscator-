const DISCORD = "https://discord.gg/5E45u5eES"
const HEADER = `--[[ this code it's protected by water obfoscator:https://discord.gg/UttE8VYAY ]]`
const IL_POOL = ["I1","l1","v1","v2","v3","II","ll","vv","v4","v5","I2","l2","vI","Iv","v6","I3","lI","Il"]
const HANDLER_POOL = ["KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD","Kp","Hx","Wn","Sr","Rm","Nz","Jf","Ug"]

function generateIlName() {
  return IL_POOL[Math.floor(Math.random() * IL_POOL.length)] + Math.floor(Math.random() * 9999)
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

function lightMath(n) {
  let a = Math.floor(Math.random() * 90) + 20, b = Math.floor(Math.random() * 60) + 10
  return `(${n}+${a+b+100}-${a})`
}

function stringToMath(str) {
  return `{${str.split('').map(c => lightMath(c.charCodeAt(0))).join(',')}}`
}

function mba() {
  let a = Math.floor(Math.random() * 70) + 15
  return `(${a}-${a}+1)`
}

function generateJunk(lines = 144) {
  let j = ''
  for (let i = 0; i < lines; i++) {
    const r = Math.random()
    if (r < 0.25)      j += `local ${generateIlName()}=${Math.floor(Math.random() * 999)} `
    else if (r < 0.5)  j += `local ${generateIlName()}=${mba()} `
    else               j += `local ${generateIlName()}=string.char(${Math.floor(Math.random()*255)}) `
  }
  return j
}

const MAPEO = {
  "ScreenGui":"Aggressive Renaming","Frame":"String to Math","TextLabel":"Table Indirection",
  "TextButton":"Mixed Boolean Arithmetic","TextBox":"Aggressive Renaming","ImageLabel":"Size-Based Execution Switch",
  "Humanoid":"Dynamic Junk","Player":"Fake Flow","Character":"Math Encoding","Part":"Literal Obfuscation",
  "Camera":"Table Indirection","TweenService":"Fake Flow","RunService":"Virtual Machine",
  "UserInputService":"Mixed Boolean Arithmetic","RemoteEvent":"Fake Flow","Workspace":"Reverse If",
  "Lighting":"Size-Based Execution Switch","Players":"Fake Flow","ReplicatedStorage":"Table Indirection","StarterGui":"String to Math"
}

function detectAndApplyMappings(code) {
  let modified = code, headers = ""
  const sorted = Object.entries(MAPEO).sort((a, b) => b[0].length - a[0].length)
  for (const [word, tech] of sorted) {
    const regex = new RegExp(`(game\\s*\\.\\s*|\\b\\.\\s*)?\\b${word}\\b`, "g")
    if (regex.test(modified)) {
      let replacement = `"${word}"`
      if (tech.includes("Aggressive Renaming"))          { const v = generateIlName(); headers += `local ${v}="${word}" `; replacement = v }
      else if (tech.includes("String to Math"))           replacement = `string.char(${stringToMath(word)})`
      else if (tech.includes("Table Indirection"))        { const t = generateIlName(); headers += `local ${t}={"${word}"} `; replacement = `${t}[1]` }
      else if (tech.includes("Mixed Boolean Arithmetic")) replacement = `((${mba()}==1 or true)and"${word}")`
      else if (tech.includes("Fake Flow"))                replacement = `(function()return ${mba()}==1 and"${word}"or"${word}"end)()`
      regex.lastIndex = 0
      modified = modified.replace(regex, (match, prefix) => {
        if (prefix) return prefix.includes("game") ? `game[${replacement}]` : `[${replacement}]`
        return replacement
      })
    }
  }
  return headers + modified
}

function buildVMWrapper(innerCode) {
  const handlerCount = 5 + Math.floor(Math.random() * 4)
  const handlers = pickHandlers(handlerCount)
  const realIdx = Math.floor(Math.random() * handlerCount)
  const DISPATCH = generateIlName()
  let out = ''
  out += `local lM={} `
  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) {
      out += `local ${handlers[i]}=function(lM) `
      out += generateJunk(5)
      out += innerCode
      out += ` end `
    } else {
      out += `local ${handlers[i]}=function(lM) return lM end `
    }
  }
  out += `local ${DISPATCH}={`
  for (let i = 0; i < handlers.length; i++) {
    out += `[${i + 1}]=${handlers[i]},`
  }
  out += `} `
  for (let i = 0; i < handlers.length; i++) {
    if (i !== realIdx) out += `${DISPATCH}[${i + 1}](lM) `
  }
  out += `${DISPATCH}[${realIdx + 1}](lM) `
  return out
}

function minify(code) {
  return code.replace(/\s+/g, " ").trim().replace(/\s*([=+\-{},])\s*/g, '$1')
}

function obfuscate(sourceCode) {
  if (!sourceCode || typeof sourceCode !== 'string') return '--ERROR'
  let preProcessed = detectAndApplyMappings(sourceCode)
  const seed = Date.now()
  const xorKeyBase = Math.floor(seed % 1000) + 1
  const bytes = preProcessed.split('').map((char, i) => {
    return (char.charCodeAt(0) ^ xorKeyBase) & 0xFF
  })

  const VM_DATA = generateIlName(), XOR_KEY = generateIlName()
  const STACK = generateIlName(), DECODER = generateIlName()

  let innerCode = ''
  // CORRECCIÓN 1: Se eliminan corchetes JSON y se usa formato de tabla de Lua { }
  innerCode += `local ${VM_DATA}={${bytes.map(b => lightMath(b)).join(',')}} `
  innerCode += `local ${XOR_KEY}=${xorKeyBase} `
  innerCode += `local ${STACK}="" `
  innerCode += `local ${DECODER}=function() `
  // CORRECCIÓN 3: Se elimina el bucle vacío ineficiente
  innerCode += `for _,v in pairs(${VM_DATA}) do `
  innerCode += `${STACK}=${STACK}..string.char(bit32.bxor(v,${XOR_KEY})) `
  innerCode += `end return ${STACK} end `
  innerCode += `local payload=(loadstring or load)(${DECODER}()) if payload then payload() end `

  let vm = HEADER + '\n'
  vm += generateJunk(50)
  vm += buildVMWrapper(innerCode)
  vm += generateJunk(50)
  vm = minify(vm)
  
  // CORRECCIÓN 2: Se invoca la función inmediatamente para que el código se ejecute
  return `(function() do do ${vm} end end end)()`
}

module.exports = { obfuscate }
        
