const HEADER = `--[[ this code it's protected by vvmer obfoscator ]]`

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

// Reducción del 25% en complejidad matemática según instrucción
function heavyMath(n) {
  if (Math.random() < 0.85) return n.toString(); 
  let a = Math.floor(Math.random() * 1000) + 100
  return `((${n}+${a})-${a})`
}

function mba() {
  return `(1)`; // Simplificado para balancear con la agresividad de las VMs
}

// --- NUEVA SECCIÓN: ANTI-VM / ANTI-SANDBOX (AGRESIVO) ---
function getAntiVM() {
  return `
    local _gv = (getgenv or function() return _G end)()
    local _vmn = {"virtual", "vmware", "vbox", "qemu", "hyperv"}
    for _, v in pairs(_vmn) do 
        if string.find(string.lower(tostring(game:GetService("HttpService"):GetAsync("http://ip-api.com/json"))), v) then 
            while true do end 
        end 
    end
    if _gv.IsVenv or _gv.checkvm then while true do end end
  `;
}

const MAPEO = {
  "ScreenGui":"Aggressive Renaming","Frame":"String to Math","TextLabel":"Table Indirection",
  "TextButton":"Mixed Boolean Arithmetic","Humanoid":"Dynamic Junk","Player":"Fake Flow",
  "RunService":"Virtual Machine","TweenService":"Fake Flow","Players":"Fake Flow"
};

function detectAndApplyMappings(code) {
  let modified = code, headers = "";
  for (const [word, tech] of Object.entries(MAPEO)) {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    if (regex.test(modified)) {
      let replacement = `"${word}"`;
      if (tech.includes("Aggressive Renaming")) { const v = generateIlName(); headers += `local ${v}="${word}";`; replacement = v; }
      else if (tech.includes("String to Math")) replacement = `string.char(${word.split('').map(c => heavyMath(c.charCodeAt(0))).join(',')})`;
      regex.lastIndex = 0;
      modified = modified.replace(regex, (match) => `game[${replacement}]`);
    }
  }
  return headers + modified;
}

function generateJunk(lines = 100) {
  let j = ''
  for (let i = 0; i < lines; i++) {
    const r = Math.random()
    if (r < 0.2) j += `local ${generateIlName()}=${heavyMath(Math.floor(Math.random() * 999))} `
    else if (r < 0.5) j += `if not(${heavyMath(1)}==${heavyMath(1)}) then while true do end end `
    else j += `do local ${generateIlName()}={} end `
  }
  return j
}

function applyCFF(blocks) {
  const stateVar = generateIlName()
  let lua = `local ${stateVar}=${heavyMath(1)} while true do `
  for (let i = 0; i < blocks.length; i++) {
    lua += `if ${stateVar}==${heavyMath(i + 1)} then ${blocks[i]} ${stateVar}=${heavyMath(i + 2)} `
  }
  lua += `elseif ${stateVar}==${heavyMath(blocks.length + 1)} then break end end `
  return lua
}

function runtimeString(str) {
  return `string.char(${str.split('').map(c => heavyMath(c.charCodeAt(0))).join(',')})`;
}

// --- VM QUINTUPLE FUERZA ---
function buildTrueVM(payloadStr) {
  const STACK = generateIlName(); const KEY = generateIlName(); const SALT = generateIlName();
  const seed = Math.floor(Math.random() * 250); const saltVal = 13;
  
  let vmCore = `local ${STACK}={} local ${KEY}=${seed} local ${SALT}=${saltVal} `
  let encBytes = [];
  for(let i = 0; i < payloadStr.length; i++) {
    encBytes.push((payloadStr.charCodeAt(i) + seed + (i * saltVal)) % 256);
  }
  
  vmCore += `local _p={${encBytes.join(',')}} `
  vmCore += `for i,v in ipairs(_p) do table.insert(${STACK}, string.char((v - ${KEY} - (i-1) * ${SALT}) % 256)) end `
  vmCore += `local _e = table.concat(${STACK}) `
  vmCore += `getfenv()[${runtimeString("loadstring")}](_e)() `
  return vmCore
}

function buildSingleVM(innerCode) {
  const DISPATCH = generateIlName();
  // Agresividad extrema: Múltiples capas de wrapping
  return `local function ${DISPATCH}() ${generateJunk(10)} ${innerCode} end ${DISPATCH}()`;
}

// Aplicación de 3 VM Machines Extra + Quintuple fuerza (Lógica de 18x expandida)
function buildExtremeVM(payloadStr) {
  let vm = buildTrueVM(payloadStr);
  // Iteración agresiva: 21 capas (18 originales + 3 solicitadas)
  for (let i = 0; i < 21; i++) {
    vm = buildSingleVM(vm); 
  }
  return vm;
}

function getExtraProtections() {
  const antiDebuggers = `if (os.clock() > 100000) then while true do end end `;

  // 2 Anti-Tampers Adicionales (Totalmente agresivos)
  const extremeTampers = [
    `if tostring(getfenv) ~= "function" then while true do end end`,
    `if #game:GetService("HttpService"):GenerateGUID(false) ~= 36 then while true do end end`
  ];

  let guards = "";
  for(let t of extremeTampers) {
    guards += `local function ${generateIlName()}() ${t} end ${generateIlName()}() `;
  }

  return antiDebuggers + guards;
}

function obfuscate(sourceCode) {
  if (!sourceCode) return '--ERROR'
  const header = HEADER;
  const antiVM = getAntiVM();
  const extraProtections = getExtraProtections();
  
  let payload = detectAndApplyMappings(sourceCode);
  const finalVM = buildExtremeVM(payload);
  
  const result = `${header} ${antiVM} ${extraProtections} ${finalVM} ${generateJunk(20)}`;
  return result.replace(/\s+/g, " ").trim();
}

module.exports = { obfuscate }
  
