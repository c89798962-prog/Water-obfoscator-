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

function mba() {
  let n = Math.random() > 0.5 ? 1 : 2, a = Math.floor(Math.random() * 70) + 15, b = Math.floor(Math.random() * 40) + 8;
  return `((${n}*${a}-${a})/(${b}+1)+${n})`;
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
      else if (tech.includes("Mixed Boolean Arithmetic")) replacement = `((${mba()}==1 or true)and"${word}")`;
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
    if (r < 0.3) j += `local ${generateIlName()}=${heavyMath(Math.floor(Math.random() * 999))} `
    else if (r < 0.6) j += `local ${generateIlName()}=string.char(${heavyMath(Math.floor(Math.random()*255))}) `
    else j += `if not(${heavyMath(1)}==${heavyMath(1)}) then local x=1 end `
  }
  return j
}

// NUEVA FUNCIÓN: Anti-Debuggers ligeros y de tiempo
function getAntiDebug() {
  const T_NAME = generateIlName();
  const START_T = generateIlName();
  return `
    local ${START_T} = os.clock()
    -- Anti-Debugger 7.2s
    task.wait(0.1) 
    if os.clock() - ${START_T} > 7.2 then while true do end end
    
    -- 5 Light Anti-Debuggers
    if (not game or not workspace) then return end
    if (tostring(getfenv) ~= "function") then return end
    if (rawget(getgenv(), "identifyexecutor")) then local check = {pcall(function() return game.JobId end)} end
    if (coroutine.status(coroutine.running()) ~= "running") then return end
    local debug_check = pcall(function() return #game:GetChildren() > 0 end)
    if not debug_check then return end
  `;
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

function buildTrueVM(payloadStr) {
  const STACK = generateIlName()
  const KEY = generateIlName()
  const bytes = payloadStr.split('').map(c => c.charCodeAt(0))
  const seed = Math.floor(Math.random() * 150) + 50
  const encryptedBytes = bytes.map((b, i) => b ^ (seed + i * 2))

  let vmCore = `local ${STACK}={${encryptedBytes.map(b => heavyMath(b)).join(',')}} `
  vmCore += `local ${KEY}=${heavyMath(seed)} `
  
  // Inyección de Anti-Debug antes de procesar el stack
  vmCore += getAntiDebug();

  vmCore += `local _res="" for i=1,#${STACK} do _res=_res..string.char(bit32.bxor(${STACK}[i], ${KEY}+((i-1)*2))) end `
  
  // ANTI-TAMPER ESTABLE (Sin Crash)
  vmCore += `if not print or type(loadstring) ~= "function" then return end `
  vmCore += `local _ls = loadstring; local _f, _err = _ls(_res); if _f then _f() end _res=nil `
  
  return vmCore
}

function buildDoubleVM(payloadStr) {
  const innerVM = buildTrueVM(payloadStr)
  return buildSingleVM(innerVM, 7)
}

function buildSingleVM(innerCode, handlerCount) {
  const handlers = pickHandlers(handlerCount)
  const realIdx = Math.floor(Math.random() * handlerCount)
  const DISPATCH = generateIlName()
  let out = `local lM={} ` 
  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) {
      out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunk(5)} ${innerCode} end `
    } else {
      out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunk(2)} return nil end `
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

function buildTripleVM(payloadStr) {
  const innerVM = buildDoubleVM(payloadStr);
  const handlers = pickHandlers(8); 
  const realHandler = handlers[Math.floor(Math.random() * handlers.length)];
  let vm = `local lM = { r = {}, i = {}, p = 1 }; local lM=lM; `;
  vm += `lM.i = { `;
  for (let i = 0; i < 12; i++) {
    const fakeH = handlers[Math.floor(Math.random() * handlers.length)];
    vm += `{ OP = "${fakeH}", A = ${heavyMath(i)}, B = ${heavyMath(i+5)} }, `;
  }
  vm += `{ OP = "${realHandler}", A = "EXEC", B = "lM" }, `;
  vm += `}; `;
  handlers.forEach(h => {
    if (h === realHandler) {
      vm += `local ${h} = function(lM) local lM=lM; if lM.i[lM.p].A == "EXEC" then ${innerVM} end lM.p = lM.p + 1; return lM; end `;
    } else {
      vm += `local ${h} = function(lM) local lM=lM; lM.p = lM.p + 1; return lM; end `;
    }
  });
  vm += `while lM.p <= #lM.i do local curOP = lM.i[lM.p].OP; `;
  handlers.forEach((h, idx) => {
    if (idx === 0) vm += `if curOP == "${h}" then lM = ${h}(lM); `;
    else vm += `elseif curOP == "${h}" then lM = ${h}(lM); `;
  });
  vm += `end end `;
  return vm;
}

function obfuscate(sourceCode) {
  if (!sourceCode) return '--ERROR'
  let payloadToProtect = detectAndApplyMappings(sourceCode);
  const finalVM = buildTripleVM(payloadToProtect)
  const result = `${HEADER} ${generateJunk(20)} ${finalVM}`
  return result.replace(/\s+/g, " ").trim()
}

module.exports = { obfuscate }
       
