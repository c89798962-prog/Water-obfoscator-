const DISCORD = "https://discord.gg/UttE8VYAY"
const HEADER = `--[[ water obfoscator: protected with heavy math & multi-vm ]]`

const IL_POOL = ["IIIIIIII1", "vvvvvv1", "vvvvvvvv2", "vvvvvv3", "IIlIlIlI1", "lvlvlvlv2", "I1","l1","v1","v2","v3","II","ll","vv", "I2"]
const HANDLER_POOL = ["KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD"]

function generateIlName() {
  return IL_POOL[Math.floor(Math.random() * IL_POOL.length)] + Math.floor(Math.random() * 99999)
}

// 25% MÁS MATH CODE (Ecuaciones más profundas)
function heavyMath(n) {
  let a = Math.floor(Math.random() * 5000) + 1000
  let b = Math.floor(Math.random() * 100) + 5
  let c = Math.floor(Math.random() * 1200) + 50
  let d = Math.floor(Math.random() * 40) + 2
  let e = Math.floor(Math.random() * 10) + 1
  // Operaciones anidadas extra
  return `(((((((${n}+${a})*${b})/${b})-${a})+((${c}*${d})/${d})-${c})*${e})/${e})`
}

function mba() {
  let n = Math.random() > 0.5 ? 1 : 2, a = Math.floor(Math.random() * 100) + 20, b = Math.floor(Math.random() * 50) + 10;
  return `(((${n}*${a}-${a})/(${b}+1)+${n}) * (${heavyMath(1)}/${heavyMath(1)}))`;
}

// 3 ANTI-TAMPERS + 1 ANTI-DEBUG FRÁGIL
function getProtections() {
  const S_TIME = generateIlName()
  return `
    -- Anti-Tamper 1: Verificación de integridad de funciones base
    if tostring(print) ~= "function" or tostring(loadstring) ~= "function" then return end
    
    -- Anti-Tamper 2: Detección de Hooks en metatablas
    local check_mt = getmetatable(game)
    if check_mt and rawget(check_mt, "__index") then return end
    
    -- Anti-Tamper 3: Bloqueo de lectura de script.Source
    pcall(function() if script and script.Source then script.Source = "" end end)

    -- Anti-Debug Frágil: Si se detecta un delay por inspección manual, corrompe el flujo
    local ${S_TIME} = os.clock()
    task.wait(0.05)
    if os.clock() - ${S_TIME} > 0.5 then 
        local crash = function() while true do end end
        pcall(crash)
    end
  `;
}

// VM CORE: El sistema OP/A/B para máxima resistencia
function buildOpVM(payloadStr) {
    const STACK = generateIlName()
    const INST = generateIlName()
    const PTR = generateIlName()
    
    // Convertimos el payload en bytes y luego en instrucciones OP
    const bytes = payloadStr.split('').map(c => c.charCodeAt(0))
    let instData = bytes.map(b => `{OP="PUSH", A=${heavyMath(b)}}`).join(",")
    instData += `,{OP="EXEC", A=0}`

    return `
    local ${STACK} = {}
    local ${INST} = {${instData}}
    local ${PTR} = 1
    while ${PTR} <= #${INST} do
        local i = ${INST}[${PTR}]
        if i.OP == "PUSH" then
            table.insert(${STACK}, string.char(i.A))
        elseif i.OP == "EXEC" then
            local res = table.concat(${STACK})
            ${getProtections()}
            local f, err = loadstring(res)
            if f then f() end
        end
        ${PTR} = ${PTR} + 1
    end`
}

function generateJunk(lines = 50) {
  let j = ''
  for (let i = 0; i < lines; i++) {
    const r = Math.random()
    if (r < 0.3) j += `local ${generateIlName()}=${heavyMath(Math.floor(Math.random() * 999))} `
    else j += `if not(${heavyMath(1)}==${heavyMath(1)}) then --[[ ${generateIlName()} ]] end `
  }
  return j
}

function obfuscate(sourceCode) {
  if (!sourceCode) return '--ERROR'
  
  // Capa 1: Mapeo y Mutación de Strings
  let modified = sourceCode;
  const MAPEO = { "ScreenGui": "Aggressive", "Humanoid": "Math", "Player": "MBA" };
  
  for (const [word, tech] of Object.entries(MAPEO)) {
      const regex = new RegExp(`\\b${word}\\b`, "g");
      if (regex.test(modified)) {
          modified = modified.replace(regex, `game["${word}"]`);
      }
  }

  // Capa 2: Empaquetado en la nueva VM de OpCodes
  const finalVM = buildOpVM(modified)
  
  // Resultado Final con basura y cabecera
  const result = `${HEADER} ${generateJunk(15)} ${finalVM} ${generateJunk(10)}`
  return result.replace(/\s+/g, " ").trim()
}

module.exports = { obfuscate }
