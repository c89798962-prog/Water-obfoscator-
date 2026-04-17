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
  return `(${n}+${a}*${b}-${a}*${b})` // Corregido: la resta vuelve a anular la multiplicación para que el resultado matemático sea exacto a 'n'
}

function stringToMath(str) {
  return `{${str.split('').map(c => lightMath(c.charCodeAt(0))).join(',')}}`
}

function mba() {
  let n = Math.random() > 0.5 ? 1 : 2, a = Math.floor(Math.random() * 70) + 15, b = Math.floor(Math.random() * 40) + 8
  return `((${n}*${a}-${a})/(${b}+1)+${n})`
}

// CORRECCIÓN BUG 5: Evita el desbordamiento de "locals" reasignando una sola variable
function generateJunk(lines = 50) {
  let j = `local _j=0 `
  for (let i = 0; i < lines; i++) {
    const r = Math.random()
    if (r < 0.25)      j += `_j=${lightMath(Math.floor(Math.random() * 9999))} `
    else if (r < 0.5)  j += `_j=${mba()} `
    else if (r < 0.75) j += `_j=${lightMath(mba())} `
    else               j += `_j=(${mba()}+${lightMath(Math.floor(Math.random() * 999))}) `
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
      else if (tech.includes("String to Math"))           replacement = `string.char(unpack(${stringToMath(word)}))`
      else if (tech.includes("Table Indirection"))        { const t = generateIlName(); headers += `local ${t}={"${word}"} `; replacement = `${t}[1]` }
      else if (tech.includes("Mixed Boolean Arithmetic")) replacement = `((${mba()}==1 or true)and"${word}")`
      else if (tech.includes("Fake Flow"))                replacement = `(function()return ${mba()}==1 and"${word}"or"${word}"end)()`
      // CORRECCIÓN BUG 4: Reemplazo seguro de Virtual Machine en lugar de loadstring
      else if (tech.includes("Virtual Machine"))          replacement = `(function() return "${word}" end)()` 
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

  out += `local lM={`
  for (let i = 1; i <= 8; i++) {
    out += `[${i}]=${lightMath(Math.floor(Math.random() * 999))},`
  }
  out += `} `
  out += `local lM=lM `

  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) {
      out += `local ${handlers[i]}=function(lM) `
      out += `local lM=lM `
      out += generateJunk(5)
      out += innerCode
      out += `end `
    } else {
      const junkCount = 3 + Math.floor(Math.random() * 6)
      out += `local ${handlers[i]}=function(lM) `
      out += `local lM=lM `
      out += generateJunk(junkCount)
      out += `return lM `
      out += `end `
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

function generateProtections() {
  let p = ""
  p += `local _clk=os.clock if _clk then local _st=_clk() for _=1,1500 do local _dummy=_*2 end if _clk()-_st>10.2 then while true do end end end `
  p += `local _sc=string.char local _t=type local _ts=tostring local _gm=getmetatable local _d=debug `
  p += `if _t(_gm)=="function"then local _mt=_gm("")if _t(_mt)=="table"and _mt.__index then while true do end end end `
  p += `if _d and _t(_d.getinfo)=="function"then local _i=_d.getinfo(_sc)if _i and _i.what~="C"then while true do end end end `
  p += `if _t(_sc)~="function"or _ts(_sc):lower():find("hook")or _ts(_sc):lower():find("closure")then while true do end end `
  return p
}

// CORRECCIÓN BUG 6: Minificación segura que no destruye la separación de palabras clave
function minify(code) {
  let minified = code.replace(/\s+/g, " ").trim();
  // Solo eliminamos espacios alrededor de operadores donde es 100% seguro en Lua
  return minified.replace(/\s*([+*\/\[\]{}])\s*/g, '$1').replace(/\s*=\s*/g, '=');
}

function obfuscate(sourceCode) {
  if (!sourceCode || typeof sourceCode !== 'string') return '--ERROR'

  let preProcessed = detectAndApplyMappings(sourceCode)
  
  // CORRECCIÓN BUG 2: Reemplazamos XOR por Shift (Suma dinámica segura y compatible en Lua sin bits)
  const shiftKey = Math.floor(Math.random() * 200) + 10;
  const bytes = preProcessed.split('').map((char) => {
    return (char.charCodeAt(0) + shiftKey) % 256;
  });

  const VM_DATA = generateIlName(), SHIFT_KEY = generateIlName()
  const PC = generateIlName(), STACK = generateIlName(), DECODER = generateIlName()

  let innerCode = ''
  
  // CORRECCIÓN BUG 1: Array mapeado directamente sin JSON.stringify()
  const mathBytes = bytes.map(b => lightMath(b)).join(',');
  innerCode += `local ${VM_DATA}={${mathBytes}} `
  innerCode += `local ${SHIFT_KEY}=${lightMath(shiftKey)} `
  innerCode += `local ${PC}=1 local ${STACK}="" `
  innerCode += `local ${DECODER}=function() `
  innerCode += generateJunk(10)
  innerCode += `while ${PC}<=#${VM_DATA} do `
  innerCode += `local lM=${VM_DATA}[${PC}] `
  // Decodificador nativo usando aritmética básica en lugar de XOR
  innerCode += `${STACK}=${STACK}..string.char((lM - ${SHIFT_KEY}) % 256) `
  innerCode += `${PC}=${PC}+1 `
  innerCode += `end return ${STACK} end `
  
  innerCode += generateProtections()
  
  innerCode += `local payload=(loadstring or load)(${DECODER}()) payload() `

  let vm = HEADER + '\n'
  vm += generateJunk(20)
  vm += buildVMWrapper(innerCode)
  vm += generateJunk(20)

  vm = minify(vm)
  
  // CORRECCIÓN BUG 3: Envuelve en un bloque 'do' autoejecutable, no en un return function()
  return `do ${vm} end`
}

module.exports = { obfuscate }
        
