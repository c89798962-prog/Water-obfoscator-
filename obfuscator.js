const HEADER = `--[[ this code it's protected by vvmer obfoscator ]]`

const IL_POOL = ["IIIIIIII1", "vvvvvv1", "vvvvvvvv2", "vvvvvv3", "IIlIlIlI1", "lvlvlvlv2", "I1","l1","v1","v2","v3","II","ll","vv", "I2"]

function generateIlName() {
  return IL_POOL[Math.floor(Math.random() * IL_POOL.length)] + Math.floor(Math.random() * 99999)
}

// --- GENERADOR DE 20 ANTI-DEBUGS ---
function getAntiDebugs() {
  const debugChecks = [
    `if debug.getinfo(1) then while true do end end`,
    `if os.clock() > 1000000 then while true do end end`,
    `if not (coroutine.isyieldable()) then while true do end end`,
    `if debug.getregistry then local r = debug.getregistry() if r[1] then end end`,
    `if setupvalue then while true do end end`,
    `if getreg then if #getreg() > 5000 then while true do end end end`,
    `if (print ~= _G.print) then while true do end end`,
    `if (type(hookfunction) ~= "nil") then while true do end end`,
    `if (tostring(coroutine.resume):find("native")) == nil then while true do end end`,
    `if #debug.traceback() > 500 then while true do end end`
  ];
  let code = "";
  // Duplicamos y variamos para llegar a 20 capas de detección
  for(let i=0; i<20; i++) {
    let check = debugChecks[i % debugChecks.length];
    code += `local function ${generateIlName()}() ${check} end ${generateIlName()}() `;
  }
  return code;
}

// --- GENERADOR DE 100 ANTI-TAMPERS ---
// Genera comprobaciones masivas de integridad de memoria y constantes
function getAntiTampers() {
  let tampers = "";
  for(let i=0; i<100; i++) {
    const salt = Math.floor(Math.random() * 10000);
    const checks = [
      `if _G["${generateIlName()}"] then while true do end end`,
      `if rawget(_G, "${generateIlName()}") then while true do end end`,
      `if math.sin(${salt}) ~= ${Math.sin(salt)} then while true do end end`,
      `if #tostring(getfenv(0)) < 5 then while true do end end`,
      `if (select("#", ...) > 0) then while true do end end`
    ];
    tampers += `local function ${generateIlName()}() ${checks[i % checks.length]} end ${generateIlName()}() `;
  }
  return tampers;
}

function getAntiVM() {
  return `local _gv = (getgenv or function() return _G end)() pcall(function() if game:GetService("HttpService"):GetAsync("http://ip-api.com/json"):find("virtual") then while true do end end end) if _gv.IsVenv then while true do end end`;
}

function runtimeString(str) {
  return `string.char(${str.split('').map(c => c.charCodeAt(0)).join(',')})`;
}

// --- VM CORE (CAPA 0) ---
function buildTrueVM(payloadStr) {
  const STACK = generateIlName();
  const KEY = 155; 
  const SALT = 7;
  let encBytes = [];
  for(let i = 0; i < payloadStr.length; i++) {
    encBytes.push((payloadStr.charCodeAt(i) + KEY + (i * SALT)) % 256);
  }
  return `local ${STACK}={} local _p={${encBytes.join(',')}} for i,v in ipairs(_p) do table.insert(${STACK}, string.char((v - ${KEY} - (i-1) * ${SALT}) % 256)) end getfenv()[${runtimeString("loadstring")}](table.concat(${STACK}))()`;
}

// --- WRAPPER PARA RECURSIÓN ---
function wrapInVM(innerCode) {
  const NAME = generateIlName();
  return `local function ${NAME}() ${innerCode} end ${NAME}()`;
}

// --- 100 VM MACHINES ---
function buildExtremeVM(payloadStr) {
  let vm = buildTrueVM(payloadStr);
  for (let i = 0; i < 100; i++) {
    vm = wrapInVM(vm);
  }
  return vm;
}

function generateJunk(lines = 50) {
  let j = ''
  for (let i = 0; i < lines; i++) {
    j += `local ${generateIlName()} = ${Math.random()} `
  }
  return j
}

function obfuscate(sourceCode) {
  if (!sourceCode) return '--ERROR';
  
  const header = HEADER;
  const antiVM = getAntiVM();
  const debugs = getAntiDebugs();
  const tampers = getAntiTampers();
  
  // Virtualización de 100 capas
  const finalVM = buildExtremeVM(sourceCode);
  
  // Construcción del archivo final
  const result = `${header} ${antiVM} ${debugs} ${tampers} ${finalVM} ${generateJunk(100)}`;
  
  return result.replace(/\s+/g, " ").trim();
}

module.exports = { obfuscate }
