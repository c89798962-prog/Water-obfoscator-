const HEADER = `--[[ this code it's protected by vvmer obfoscator ]]`

const IL_POOL = ["IIIIIIII1", "vvvvvv1", "vvvvvvvv2", "vvvvvv3", "IIlIlIlI1", "lvlvlvlv2", "I1","l1","v1","v2","v3","II","ll","vv", "I2"]

function generateIlName() {
  return IL_POOL[Math.floor(Math.random() * IL_POOL.length)] + Math.floor(Math.random() * 99999)
}

// --- MOTOR MATH JUNK (Reducido un 15% en frecuencia/volumen) ---
function generateMathJunk() {
    const a = Math.floor(Math.random() * 500);
    const b = Math.floor(Math.random() * 500);
    const ops = [
        `local ${generateIlName()} = ${a} + ${b}`,
        `if ${a} > ${b} then local ${generateIlName()} = math.cos(${a}) end`,
        `local ${generateIlName()} = math.sqrt(${a + b})`
    ];
    // Retornamos una operación aleatoria
    return ops[Math.floor(Math.random() * ops.length)] + "; ";
}

function generateAggressiveJunk(density) {
    let junk = "";
    // Reducción del 15% aplicada a la densidad de iteración
    const reducedDensity = Math.max(1, Math.floor(density * 0.85)); 
    for(let i = 0; i < reducedDensity; i++) {
        junk += generateMathJunk();
        if (Math.random() > 0.6) { // Probabilidad ligeramente menor de bloques grandes
            const v1 = generateIlName();
            junk += `local ${v1} = function() return ${a} end; `;
        }
    }
    return junk;
}

// --- 20 ANTI-DEBUGGERS ---
function getAntiDebugs() {
  let code = "";
  const checks = [
    `if debug.getinfo(print) then while true do end end`,
    `if #debug.traceback() > 20 then while true do end end`,
    `if (identifyexecutor and identifyexecutor():find("Decompiler")) then while true do end end`
  ];
  for(let i=0; i<20; i++) {
    code += `local function ${generateIlName()}() ${generateAggressiveJunk(2)} ${checks[i % checks.length]} end ${generateIlName()}() `;
  }
  return code;
}

// --- 100 ANTI-TAMPERS ---
function getAntiTampers() {
  let tampers = "";
  for(let i=0; i<100; i++) {
    const v = generateIlName();
    tampers += `local ${v} = function(...) ${generateAggressiveJunk(1)} if not ... then while true do end end end; ${v}(true); `;
  }
  return tampers;
}

function runtimeString(str) {
  return `string.char(${str.split('').map(c => c.charCodeAt(0)).join(',')})`;
}

// --- VM CORE ---
function buildTrueVM(payloadStr) {
  const STACK = generateIlName();
  const KEY = 201;
  const SALT = 11;
  let encBytes = [];
  for(let i = 0; i < payloadStr.length; i++) {
    encBytes.push((payloadStr.charCodeAt(i) + KEY + (i * SALT)) % 256);
  }
  return `local ${STACK}={} local _p={${encBytes.join(',')}} for i,v in ipairs(_p) do table.insert(${STACK}, string.char((v - ${KEY} - (i-1) * ${SALT}) % 256)) end getfenv()[${runtimeString("loadstring")}](table.concat(${STACK}))()`;
}

// --- 30 VM MACHINES AGRESIVAS ---
function wrapInAggressiveVM(innerCode) {
  const NAME = generateIlName();
  // Estructura agresiva pero con un 15% menos de basura matemática interna
  return `local function ${NAME}() ${generateAggressiveJunk(4)} ${innerCode} end ${NAME}()`;
}

function buildExtremeVM(payloadStr) {
  let vm = buildTrueVM(payloadStr);
  for (let i = 0; i < 30; i++) {
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
  
  // Virtualización con 30 capas
  const finalVM = buildExtremeVM(sourceCode);
  
  // Junk final balanceado (-15%)
  const finalJunk = generateAggressiveJunk(120);
  
  const result = `${header} ${antiVM} ${debugs} ${tampers} ${finalVM} ${finalJunk}`;
  
  return result.trim();
}

module.exports = { obfuscate }
