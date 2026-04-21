const HEADER = `--[[ this code it's protected by vvmer obfoscator ]]`

const IL_POOL = ["IIIIIIII1", "vvvvvv1", "vvvvvvvv2", "vvvvvv3", "IIlIlIlI1", "lvlvlvlv2", "I1","l1","v1","v2","v3","II","ll","vv", "I2"]
const HANDLER_POOL = ["KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD"]

function generateIlName() {
  return IL_POOL[Math.floor(Math.random() * IL_POOL.length)] + Math.floor(Math.random() * 99999)
}

// --- PROTECCIONES ANTI-TAMPERS Y ANTI-DEBUGS (10 TOTAL) ---
function getSecurityLayer() {
  const checks = [
    `if debug.getinfo(print) then while true do end end`, // Check de hooks en funciones core
    `if setreadonly then local t={} setreadonly(t, false) end`, // Detección de entorno
    `if (coroutine.running() == nil) then while true do end end`, // Anti-parallel execution
    `if #game:GetService("HttpService"):GenerateGUID(false) ~= 36 then while true do end end`, // Tamper check
    `if tostring(getfenv) ~= "function" then while true do end end`, // Environment integrity
    `if (os.clock() > 10^7) then while true do end end`, // Time manipulation check
    `if not (type(hookmetamethod) == "nil") then if (hookmetamethod == print) then while true do end end end`, // Hook detection
    `local _count = 0; for k,v in pairs(_G) do _count = _count + 1 end; if _count > 500 then while true do end end`, // Global pollution check
    `if (identifyexecutor and identifyexecutor() == "N/A") then while true do end end`, // Executor check
    `if (not _G) then while true do end end` // Engine integrity
  ];
  
  let code = "";
  checks.forEach(check => {
    code += `local function ${generateIlName()}() ${check} end ${generateIlName()}() `;
  });
  return code;
}

function getAntiVM() {
  return `
    local _gv = (getgenv or function() return _G end)()
    local _vmn = {"virtual", "vmware", "vbox", "qemu", "hyperv", "titan", "sentinel"}
    pcall(function()
        local _info = tostring(game:GetService("HttpService"):GetAsync("http://ip-api.com/json"))
        for _, v in pairs(_vmn) do 
            if string.find(string.lower(_info), v) then while true do end end 
        end
    end)
    if _gv.IsVenv or _gv.checkvm then while true do end end
  `;
}

// Eliminación de Heavy Math - Ahora devuelve el número puro para evitar errores de tipo
function mathPure(n) {
  return n;
}

function runtimeString(str) {
  return `string.char(${str.split('').map(c => c.charCodeAt(0)).join(',')})`;
}

// --- VM CORE ---
function buildTrueVM(payloadStr) {
  const STACK = generateIlName(); 
  const KEY = Math.floor(Math.random() * 250); 
  const SALT = 13;
  
  let encBytes = [];
  for(let i = 0; i < payloadStr.length; i++) {
    encBytes.push((payloadStr.charCodeAt(i) + KEY + (i * SALT)) % 256);
  }
  
  let vmCore = `local ${STACK}={} local _p={${encBytes.join(',')}} `;
  vmCore += `for i,v in ipairs(_p) do table.insert(${STACK}, string.char((v - ${KEY} - (i-1) * ${SALT}) % 256)) end `;
  vmCore += `local _e = table.concat(${STACK}) `;
  vmCore += `getfenv()[${runtimeString("loadstring")}](_e)() `;
  return vmCore
}

function wrapInVM(innerCode) {
  const DISPATCH = generateIlName();
  const JUNK = generateJunk(5);
  return `local function ${DISPATCH}() ${JUNK} ${innerCode} end ${DISPATCH}()`;
}

// --- 40 CAPAS DE VIRTUALIZACIÓN ---
function buildExtremeVM(payloadStr) {
  let vm = buildTrueVM(payloadStr);
  for (let i = 0; i < 40; i++) {
    vm = wrapInVM(vm); 
  }
  return vm;
}

function generateJunk(lines = 20) {
  let j = ''
  for (let i = 0; i < lines; i++) {
    const r = Math.random()
    if (r < 0.3) j += `local ${generateIlName()}=${Math.floor(Math.random() * 999)} `
    else j += `do local ${generateIlName()}={} end `
  }
  return j
}

function obfuscate(sourceCode) {
  if (!sourceCode) return '--ERROR'
  
  const header = HEADER;
  const antiVM = getAntiVM();
  const security = getSecurityLayer();
  
  // Transformación básica de strings antes de entrar a la VM
  const payload = sourceCode.replace(/"(.*?)"/g, (match, p1) => {
    return `string.char(${p1.split('').map(c => c.charCodeAt(0)).join(',')})`;
  });

  const finalVM = buildExtremeVM(payload);
  
  const result = `${header} ${antiVM} ${security} ${finalVM} ${generateJunk(30)}`;
  return result.replace(/\s+/g, " ").trim();
}

module.exports = { obfuscate }
  
