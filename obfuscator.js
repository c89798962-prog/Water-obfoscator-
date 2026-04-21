const HEADER = `--[[ PROTECTED BY VVVER-ULTRA-VM (22 LAYERS) ]]`

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

// Sustituto de Math: Generador de bytes ofuscados mediante tablas
function rawByte(n) {
  return `string.byte(string.char(${n}))`
}

function generateJunk(lines = 50) {
  let j = ''
  for (let i = 0; i < lines; i++) {
    const r = Math.random()
    if (r < 0.3) j += `local ${generateIlName()}=_G[${generateIlName()}] `
    else if (r < 0.6) j += `if _G["\0"] then return end `
    else j += `local ${generateIlName()} = function() return end `
  }
  return j
}

// VM Real con Corrupción Silenciosa
function buildTrueVM(payloadStr) {
  const STACK = generateIlName(); 
  const KEY_TABLE = generateIlName();
  const DATA_POOL = generateIlName();
  const seed = Math.floor(Math.random() * 255);
  
  // Encriptación por desplazamiento de bytes
  let encrypted = [];
  for(let i = 0; i < payloadStr.length; i++) {
    encrypted.push((payloadStr.charCodeAt(i) + seed) % 256);
  }

  let vmCore = `
    local ${STACK} = {}
    local ${KEY_TABLE} = {${seed}, ${Math.floor(Math.random()*255)}}
    local ${DATA_POOL} = {${encrypted.join(',')}}
    
    -- Silent Corruption Logic
    if (collectgarbage("count") < 0) then ${KEY_TABLE}[1] = ${KEY_TABLE}[1] + 1 end
    
    for i=1, #${DATA_POOL} do
        local b = ${DATA_POOL}[i] - ${KEY_TABLE}[1]
        while b < 0 do b = b + 256 end
        ${STACK}[i] = string.char(b)
    end
    
    local _exec = loadstring(table.concat(${STACK}))
    if _exec then _exec() else error("Core Corrupted") end
  `;
  return vmCore;
}

// Generador de Capas VM (Virtual Machine Shells)
function buildShellVM(innerCode) {
    const handlers = pickHandlers(5);
    const validIdx = Math.floor(Math.random() * 5);
    const DISPATCHER = generateIlName();
    const STATE = generateIlName();

    let shell = `local ${STATE} = ${validIdx + 1}; `;
    shell += `local ${DISPATCHER} = { `;
    for (let i = 0; i < 5; i++) {
        if (i === validIdx) {
            shell += `[${i+1}] = function() ${innerCode} end, `;
        } else {
            shell += `[${i+1}] = function() ${generateJunk(5)} end, `;
        }
    }
    shell += `}; `;
    shell += `${DISPATCHER}[${STATE}](); `;
    return shell;
}

function obfuscate(sourceCode) {
    if (!sourceCode) return '-- [Empty Input]'

    // Capa 22: La VM Real
    let currentCode = buildTrueVM(sourceCode);

    // Capas 21 a 1: Máquinas Virtuales de Despacho (Shells)
    for (let i = 0; i < 21; i++) {
        currentCode = buildShellVM(currentCode);
    }

    // Protecciones Anti-Debug integradas en el flujo
    const antiDebug = `
        local _t = tick()
        local _f = function() 
            if tick() - _t > 1 then 
                -- Corrupción silenciosa: altera el entorno global si se detecta lag de debug
                getfenv().print = nil 
                getfenv().warn = nil
            end 
        end
        _f()
    `;

    const finalResult = `
        ${HEADER}
        ${generateJunk(20)}
        ${antiDebug}
        ${currentCode}
        ${generateJunk(20)}
    `;

    return finalResult.replace(/\s+/g, " ").trim();
}

module.exports = { obfuscate }
