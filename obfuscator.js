const HEADER = `--[[ this code it's protected by vvmer obfoscator ]]`

const IL_POOL = ["IIIIIIII1", "vvvvvv1", "vvvvvvvv2", "vvvvvv3", "IIlIlIlI1", "lvlvlvlv2", "I1","l1","v1","v2","v3","II","ll","vv", "I2"]

function generateIlName() {
  return IL_POOL[Math.floor(Math.random() * IL_POOL.length)] + Math.floor(Math.random() * 99999)
}

// --- NUEVO MOTOR DE MATH JUNK (RANDOM FAKE) ---
// Genera operaciones matemáticas confusas que siempre resultan en valores reales pero inútiles
function generateMathJunk() {
    const a = Math.floor(Math.random() * 1000);
    const b = Math.floor(Math.random() * 1000);
    const ops = [
        `local ${generateIlName()} = ((${a} + ${b}) * ${Math.floor(Math.random() * 10)}) / ${Math.floor(Math.random() * 5) + 1}`,
        `if (${a} * ${b}) > ${a + b} then local ${generateIlName()} = math.sin(${a}) end`,
        `local ${generateIlName()} = math.sqrt(${a * a}) + math.cos(${b})`,
        `for i=${Math.floor(Math.random() * 5)}, ${Math.floor(Math.random() * 10) + 6} do local x = i * ${a} end`
    ];
    return ops[Math.floor(Math.random() * ops.length)] + "; ";
}

// Generador de ruido agresivo (Bloated Junk + 30% Extra Math)
function generateAggressiveJunk(density) {
    let junk = "";
    // Incrementamos un 30% la iteración para más volumen
    const adjustedDensity = Math.floor(density * 1.3); 
    for(let i = 0; i < adjustedDensity; i++) {
        junk += generateMathJunk();
        if (Math.random() > 0.5) {
            const v1 = generateIlName();
            junk += `local ${v1} = function() ${generateMathJunk()} return "${v1}" end; `;
        }
    }
    return junk;
}

// --- 20 ANTI-DEBUGGERS AGRESIVOS ---
function getAntiDebugs() {
  let code = "";
  const checks = [
    `if debug.getinfo(print) or debug.getinfo(error) then while true do end end`,
    `if #debug.traceback() > 15 then while true do end end`,
    `if (identifyexecutor and identifyexecutor():find("Decompiler")) then while true do end end`,
    `if not coroutine.isyieldable() then while true do end end`
  ];
  for(let i=0; i<20; i++) {
    code += `local function ${generateIlName()}() ${generateAggressiveJunk(3)} ${checks[i % checks.length]} end ${generateIlName()}() `;
  }
  return code;
}

// --- 100 ANTI-TAMPERS AGRESIVOS ---
function getAntiTampers() {
  let tampers = "";
  for(let i=0; i<100; i++) {
    const v = generateIlName();
    tampers += `local ${v} = function(...) ${generateAggressiveJunk(2)} if not ... then while true do end end end; ${v}(true); `;
  }
  return tampers;
}

function runtimeString(str) {
  return `string.char(${str.split('').map(c => c.charCodeAt(0)).join(',')})`;
}

// --- VM CORE (Ejecución Principal) ---
function buildTrueVM(payloadStr) {
  const STACK = generateIlName();
  const KEY = 188;
  const SALT = 14;
  let encBytes = [];
  for(let i = 0; i < payloadStr.length; i++) {
    encBytes.push((payloadStr.charCodeAt(i) + KEY + (i * SALT)) % 256);
  }
  return `local ${STACK}={} local _p={${encBytes.join(',')}} for i,v in ipairs(_p) do table.insert(${STACK}, string.char((v - ${KEY} - (i-1) * ${SALT}) % 256)) end getfenv()[${runtimeString("loadstring")}](table.concat(${STACK}))()`;
}

// --- 50 VM MACHINES AGRESIVAS ---
function wrapInAggressiveVM(innerCode) {
  const NAME = generateIlName();
  // Cada capa ahora es un "tanque" de código basura y matemáticas
  return `local function ${NAME}() ${generateAggressiveJunk(5)} ${innerCode} ${generateAggressiveJunk(2)} end ${NAME}()`;
}

function buildExtremeVM(payloadStr) {
  let vm = buildTrueVM(payloadStr);
  for (let i = 0; i < 50; i++) {
    vm = wrapInAggressiveVM(vm);
  }
  return vm;
}

function obfuscate(sourceCode) {
  if (!sourceCode) return '--ERROR';
  
  const header = HEADER;
  const antiVM = `local _v = (getgenv or function() return _G end)(); if _v.IsVenv or _v.checkvm then while true do end end `;
  const debugs = getAntiDebugs();
  const tampers = getAntiTampers();
  
  // Virtualización con 50 capas de alta densidad
  const finalVM = buildExtremeVM(sourceCode);
  
  // Bloque final masivo con el incremento del 30% solicitado
  const finalJunk = generateAggressiveJunk(150);
  
  const result = `${header} ${antiVM} ${debugs} ${tampers} ${finalVM} ${finalJunk}`;
  
  // Retornamos sin limpiar excesivamente los espacios para que el peso del archivo sea evidente
  return result.trim();
}

module.exports = { obfuscate }
