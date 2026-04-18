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

// NUEVO: Extraído de Mimosa (Mixed Boolean Arithmetic)
function mba() {
  let n = Math.random() > 0.5 ? 1 : 2, a = Math.floor(Math.random() * 70) + 15, b = Math.floor(Math.random() * 40) + 8;
  return `((${n}*${a}-${a})/(${b}+1)+${n})`;
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

// NUEVO: El motor de Mapeo de Mimosa para ofuscar el 60% de los Hubs
const MAPEO = {
  "ScreenGui":"Aggressive Renaming","Frame":"String to Math","TextLabel":"Table Indirection",
  "TextButton":"Mixed Boolean Arithmetic","TextBox":"Aggressive Renaming","ImageLabel":"Size-Based Execution Switch",
  "Humanoid":"Dynamic Junk","Player":"Fake Flow","Character":"Math Encoding","Part":"Literal Obfuscation",
  "Camera":"Table Indirection","TweenService":"Fake Flow","RunService":"Virtual Machine",
  "UserInputService":"Mixed Boolean Arithmetic","RemoteEvent":"Fake Flow","Workspace":"Reverse If",
  "Lighting":"Size-Based Execution Switch","Players":"Fake Flow","ReplicatedStorage":"Table Indirection","StarterGui":"String to Math"
};

function detectAndApplyMappings(code) {
  let modified = code, headers = "";
  const sorted = Object.entries(MAPEO).sort((a, b) => b[0].length - a[0].length);
  for (const [word, tech] of sorted) {
    const regex = new RegExp(`(game\\s*\\.\\s*|\\b\\.\\s*)?\\b${word}\\b`, "g");
    if (regex.test(modified)) {
      let replacement = `"${word}"`;
      if (tech.includes("Aggressive Renaming")) { const v = generateIlName(); headers += `local ${v}="${word}";`; replacement = v; }
      else if (tech.includes("String to Math")) replacement = `string.char(${word.split('').map(c => heavyMath(c.charCodeAt(0))).join(',')})`;
      else if (tech.includes("Table Indirection")) { const t = generateIlName(); headers += `local ${t}={"${word}"};`; replacement = `${t}[1]`; }
      else if (tech.includes("Mixed Boolean Arithmetic")) replacement = `((${mba()}==1 or true)and"${word}")`;
      else if (tech.includes("Fake Flow")) replacement = `(function()return ${mba()}==1 and"${word}"or"${word}"end)()`;
      else if (tech.includes("Virtual Machine")) replacement = `loadstring("return '${word}'")()`; 
      regex.lastIndex = 0;
      modified = modified.replace(regex, (match, prefix) => {
        if (prefix) return prefix.includes("game") ? `game[${replacement}]` : `[${replacement}]`;
        return replacement;
      });
    }
  }
  return headers + modified;
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
  const XOR_KEY = generateIlName() // Extraído de Mimosa

  // MEJORA EXTREMA: Cifrado XOR Indexado. 
  // Ya no guardamos la URL tal cual, los bytes mutan dependiendo de su posición.
  const seed = Date.now() + Math.floor(Math.random() * 99999);
  const xorKeyBase = Math.floor(seed % 255) + 1;
  const encryptedBytes = payloadBytes.map((b, i) => {
    return (b ^ (xorKeyBase + i * 5)) & 0xFF;
  });
  
  let vmCore = `local ${STACK}={} local ${MEM}={${encryptedBytes.map(b => heavyMath(b)).join(',')}} `
  vmCore += `local ${XOR_KEY}=${heavyMath(xorKeyBase)} ` // Clave base ofuscada
  vmCore += `local ${PTR}=${heavyMath(1)} while ${PTR}<=(#${MEM}) do `
  
  // La VM ahora tiene que resolver el cifrado en tiempo real (XOR + Posición * 5)
  vmCore += `local _dec = bit32.bxor(${MEM}[${PTR}], ${XOR_KEY} + (${PTR} - 1) * 5) `
  vmCore += `table.insert(${STACK}, string.char(_dec)) ${PTR}=${PTR}+${heavyMath(1)} end `
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
      // SHADOWING: "local lM=lM;" extraído de Mimosa para confundir rastreadores
      out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunk(10)} ${innerCode} end `
    } else {
      out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunk(5)} return nil end `
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
    // NUEVO: Si es un Hub gigante, aplicamos el Mapeo de Mimosa
    // Esto destruye el 60% del código legible antes de meterlo a la VM
    rawPayload = detectAndApplyMappings(sourceCode)
  }

  const payloadBytes = rawPayload.split('').map(c => c.charCodeAt(0))
  const finalVM = buildDoubleVM(payloadBytes)
  
  const result = `${HEADER} ${generateJunk(50)} ${antiDebug} ${finalVM}`
  return result.replace(/\s+/g, " ").trim()
}

module.exports = { obfuscate }
