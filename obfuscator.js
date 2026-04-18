const DISCORD = "https://discord.gg/UttE8VYAY"
const HEADER = `--[[ water obfoscator | ${DISCORD} ]]`

const IL_POOL = ["I1","l1","v1","II","ll","vv"]
const HANDLER_POOL = ["KQ","HF","W8","SX","Rj"]

function generateIlName() {
  return IL_POOL[Math.floor(Math.random() * IL_POOL.length)] + Math.floor(Math.random() * 999)
}

function heavyMath(n) {
  let a = Math.floor(Math.random() * 100) + 1
  return `((${n}+${a})-${a})`
}

// VM Ligera: Ejecuta sin usar la palabra 'loadstring' de forma directa
function buildTrueVM(payloadStr) {
  const STACK = generateIlName()
  const KEY = generateIlName()
  const DECODER = generateIlName()
  
  const seed = Math.floor(Math.random() * 100) + 10
  const encrypted = payloadStr.split('').map((c, i) => c.charCodeAt(0) ^ (seed + i * 2))

  // Usamos getfenv para evadir detecciones estáticas de loadstring
  return `
    local ${KEY} = ${heavyMath(seed)}
    local ${STACK} = {${encrypted.map(b => heavyMath(b)).join(',')}}
    local function ${DECODER}(t, k)
        local res = {}
        for i=1, #t do res[i] = string.char(bit32.bxor(t[i], k + (i-1)*2)) end
        return table.concat(res)
    end
    local _e = ${DECODER}(${STACK}, ${KEY})
    local _f = task.spawn(function() 
        local success, err = pcall(function()
            -- Llamada dinámica indirecta
            return _G["\\108\\111\\97\\100\\115\\116\\114\\105\\110\\103"](_e)()
        end)
    end)
  `
}

function buildSingleVM(innerCode) {
  const handler = HANDLER_POOL[Math.floor(Math.random() * HANDLER_POOL.length)] + "x"
  const stateVar = generateIlName()
  
  return `
    local ${stateVar} = 0
    local function ${handler}()
        ${innerCode}
    end
    while ${stateVar} < 1 do
        ${handler}()
        ${stateVar} = ${stateVar} + 1
    end
  `
}

function obfuscate(sourceCode) {
  if (!sourceCode) return '-- ERROR: No source'
  
  let payload = ""
  // Detectar si es una URL de HttpGet
  const isUrl = sourceCode.match(/https?:\/\/[^\s"']+/)
  
  if (isUrl) {
    payload = `game:HttpGet("${isUrl[0]}")`
    // Si era un loadstring(game:HttpGet(...)), lo convertimos a ejecutable
    if (sourceCode.includes("loadstring")) {
        payload = `loadstring(game:HttpGet("${isUrl[0]}"))()`
    }
  } else {
    payload = sourceCode
  }

  const vmCore = buildTrueVM(payload)
  const finalCode = buildSingleVM(vmCore)
  
  return `${HEADER}\n${finalCode}`
}

module.exports = { obfuscate }
