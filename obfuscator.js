const HEADER = `--[[ this code it's protected by vvmer obfoscator ]]`

const IL_POOL = ["IIIIIIII1", "vvvvvv1", "vvvvvvvv2", "vvvvvv3", "IIlIlIlI1", "lvlvlvlv2", "I1","l1","v1","v2","v3","II","ll","vv", "I2"]

function generateIlName() {
  return IL_POOL[Math.floor(Math.random() * IL_POOL.length)] + Math.floor(Math.random() * 99999)
}

function generateMassiveJunk(amount) {
    let junk = "";
    for(let i = 0; i < amount; i++) {
        const v1 = generateIlName();
        const v2 = generateIlName();
        junk += `local ${v1} = {${Math.random()}, "${v2}"}; if ${v1}[1] == 0 then ${v2} = {} end `;
    }
    return junk;
}

// --- 20 ANTI-DEBUGGERS EXPANDIDOS ---
function getAntiDebugs() {
  let code = "";
  const checks = [
    `if debug.getinfo(print) then while true do end end`,
    `if #debug.traceback() > 10 then print(nil) end`,
    `if (coroutine.yield == nil) then while true do end end`,
    `if (getfenv(0) ~= getfenv(1)) then while true do end end`,
    `if (os.time() < 1000) then while true do end end`
  ];
  for(let i=0; i<20; i++) {
    code += `local function ${generateIlName()}() ${generateMassiveJunk(2)} ${checks[i % checks.length]} end ${generateIlName()}() `;
  }
  return code;
}

// --- 100 ANTI-TAMPERS CON INYECCIÓN DE BASURA ---
function getAntiTampers() {
  let tampers = "";
  for(let i=0; i<100; i++) {
    const v = generateIlName();
    tampers += `local ${v} = function(...) ${generateMassiveJunk(3)} if not ... then return end end; ${v}(true); `;
    if(i % 10 === 0) {
        tampers += `if (game and game.ClassName ~= "DataModel") then while true do end end `;
    }
  }
  return tampers;
}

function runtimeString(str) {
  return `string.char(${str.split('').map(c => c.charCodeAt(0)).join(',')})`;
}

// --- VM CORE ---
function buildTrueVM(payloadStr) {
  const STACK = generateIlName();
  const KEY = Math.floor(Math.random() * 200) + 50;
  const SALT = 11;
  let encBytes = [];
  for(let i = 0; i < payloadStr.length; i++) {
    encBytes.push((payloadStr.charCodeAt(i) + KEY + (i * SALT)) % 256);
  }
  return `local ${STACK}={} local _p={${encBytes.join(',')}} for i,v in ipairs(_p) do table.insert(${STACK}, string.char((v - ${KEY} - (i-1) * ${SALT}) % 256)) end getfenv()[${runtimeString("loadstring")}](table.concat(${STACK}))()`;
}

// --- CAPA DE ENVOLTURA (WRAPPING) ---
function wrapInVM(innerCode) {
  const NAME = generateIlName();
  // Agregamos junk dentro de cada capa de la VM para que el código crezca exponencialmente
  return `local function ${NAME}() ${generateMassiveJunk(1)} ${innerCode} end ${NAME}()`;
}

// --- 300 CAPAS DE MÁQUINAS VIRTUALES ---
function buildExtremeVM(payloadStr) {
  let vm = buildTrueVM(payloadStr);
  for (let i = 0; i < 300; i++) {
    vm = wrapInVM(vm);
  }
  return vm;
}

function obfuscate(sourceCode) {
  if (!sourceCode) return '--ERROR';
  
  const header = HEADER;
  const antiVM = `local _v = (getgenv or function() return _G end)(); if _v.IsVenv then while true do end end `;
  const debugs = getAntiDebugs();
  const tampers = getAntiTampers();
  
  // Procesamiento de la carga útil
  const finalVM = buildExtremeVM(sourceCode);
  
  // Generación de bloque final masivo (Junk)
  const finalJunk = generateMassiveJunk(200);
  
  const result = `${header} ${antiVM} ${debugs} ${tampers} ${finalVM} ${finalJunk}`;
  
  // No usamos .replace(/\s+/g, " ") de forma tan agresiva para mantener un volumen visual impactante
  return result.trim();
}

module.exports = { obfuscate }
