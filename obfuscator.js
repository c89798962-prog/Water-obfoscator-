// ╔═══════════════════════════════════════════════════════════════╗
// ║  vvmer obfuscator v7 - MERGED EDITION                         ║
// ║  • Triple runtime keys (math.pi) + Rolling XOR Cipher         ║
// ║  • Decoy VMs + 18x Structural Layers + CFF                    ║
// ║  • Code Vault: Tarpits, Opaque Predicates, Symbol Noise       ║
// ║  • Advanced Mapping (MBA, Aggressive Renaming)                ║
// ╚═══════════════════════════════════════════════════════════════╝

const HEADER = `--[[ this code it's protected by vvmer obfoscator ]]`;

// ── Pools & Utils ────────────────────────────────────────────────
const IL_POOL = ["IIIIIIII1", "vvvvvv1", "vvvvvvvv2", "vvvvvv3", "IIlIlIlI1", "lvlvlvlv2", "I1","l1","v1","v2","v3","II","ll","vv", "I2", "lI", "Il", "Iv"];
const HANDLER_POOL = ["KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD"];

const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const generateIlName = () => IL_POOL[rnd(0, IL_POOL.length - 1)] + rnd(1000, 99999);

function pickHandlers(count) {
  const used = new Set(), res = [];
  while (res.length < count) {
    const n = HANDLER_POOL[rnd(0, HANDLER_POOL.length - 1)] + rnd(10, 99);
    if (!used.has(n)) { used.add(n); res.push(n); }
  }
  return res;
}

function heavyMath(n) {
  if (Math.random() < 0.6) return String(n); // Mixed math and plain to avoid obvious patterns
  const a = rnd(500, 3500), b = rnd(2, 50), c = rnd(10, 810), d = rnd(2, 22);
  return `(((((${n}+${a})*${b})/${b})-${a})+((${c}*${d})/${d})-${c})`;
}

function mba() {
  const n = Math.random() > 0.5 ? 1 : 2, a = rnd(15, 85), b = rnd(8, 48);
  return `((${n}*${a}-${a})/(${b}+1)+${n})`;
}

const runtimeString = (str) => `string.char(${str.split('').map(c => heavyMath(c.charCodeAt(0))).join(',')})`;

// ── Obfuscation Logic (Mappings & Junk) ──────────────────────────
const MAPEO = {
  "ScreenGui": "Aggressive Renaming", "Frame": "String to Math", "TextLabel": "Table Indirection",
  "TextButton": "Mixed Boolean Arithmetic", "Humanoid": "Dynamic Junk", "Player": "Fake Flow",
  "RunService": "Virtual Machine", "TweenService": "Fake Flow", "Players": "Fake Flow"
};

function detectAndApplyMappings(code) {
  let modified = code, headers = "";
  for (const [word, tech] of Object.entries(MAPEO)) {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    if (regex.test(modified)) {
      let replacement = `"${word}"`;
      if (tech.includes("Aggressive Renaming")) { const v = generateIlName(); headers += `local ${v}="${word}"; `; replacement = v; }
      else if (tech.includes("String to Math")) replacement = runtimeString(word);
      else if (tech.includes("Mixed Boolean Arithmetic")) replacement = `((${mba()}==1 or true)and"${word}")`;
      regex.lastIndex = 0;
      modified = modified.replace(regex, () => `game[${replacement}]`);
    }
  }
  return headers + modified;
}

function generateJunk(lines = 20) {
  let j = '';
  for (let i = 0; i < lines; i++) {
    const r = Math.random();
    if (r < 0.2) j += `local ${generateIlName()}=${heavyMath(rnd(1, 999))} `;
    else if (r < 0.4) j += `local ${generateIlName()}=string.char(${heavyMath(rnd(1, 255))}) `;
    else if (r < 0.5) j += `if not(${heavyMath(1)}==${heavyMath(1)}) then local x=1 end `;
    else if (r < 0.7) j += `if type(nil)=="number" then while true do local ${generateIlName()}=1 end end `; // Tarpit
    else if (r < 0.85) { const vt = generateIlName(); j += `do local ${vt}={} ${vt}["_"]=1 ${vt}=nil end `; } // Symbol Noise
    else j += `if type(math.pi)=="string" then local _=1 end `; // Opaque Predicate
  }
  return j;
}

// ── Virtual Machines (Real & Decoys) ─────────────────────────────
function buildTrueVM(payloadStr) {
  const STACK = generateIlName(), KEY = generateIlName(), ORDER = generateIlName(), SALT = generateIlName();
  const seed = rnd(50, 250), saltVal = rnd(1, 250);
  
  // Triple Math.PI key integration from v7
  const K1E = `string.byte(tostring(math.pi),1)`, K2E = `string.byte(tostring(math.pi),2)`;
  let vmCore = `local ${STACK}={} local _kpi1=${K1E} local _kpi2=${K2E} local ${KEY}=${heavyMath(seed)}+(_kpi1*0) local ${SALT}=${heavyMath(saltVal)} `;
  
  const chunkSize = 15; let realChunks = [];
  for(let i = 0; i < payloadStr.length; i += chunkSize) realChunks.push(payloadStr.slice(i, i + chunkSize));
  
  let poolVars = [], realOrder = [];
  let totalChunks = realChunks.length * 3, currentReal = 0, globalIndex = 0;
  
  for(let i = 0; i < totalChunks; i++) {
    let memName = generateIlName(); poolVars.push(memName);
    if (currentReal < realChunks.length && (Math.random() > 0.5 || (totalChunks - i) === (realChunks.length - currentReal))) {
      realOrder.push(i + 1);
      let chunk = realChunks[currentReal]; let encryptedBytes = [];
      for(let j = 0; j < chunk.length; j++) { 
        let enc = (chunk.charCodeAt(j) + seed + (globalIndex * saltVal)) % 256;
        encryptedBytes.push(heavyMath(enc)); 
        globalIndex++;
      }
      vmCore += `local ${memName}={${encryptedBytes.join(',')}} `;
      currentReal++;
    } else {
      let fakeBytes = []; let fakeLen = rnd(5, 25);
      for(let j = 0; j < fakeLen; j++) fakeBytes.push(heavyMath(rnd(0, 255)));
      vmCore += `local ${memName}={${fakeBytes.join(',')}} `;
    }
  }
  
  vmCore += `local _pool={${poolVars.join(',')}} local ${ORDER}={${realOrder.map(n => heavyMath(n)).join(',')}} `;
  const idxVar = generateIlName(), byteVar = generateIlName();
  
  vmCore += `local _gIdx=0 for _, ${idxVar} in ipairs(${ORDER}) do for _, ${byteVar} in ipairs(_pool[${idxVar}]) do `;
  vmCore += `if type(math.pi)=="string" then ${KEY}=(${KEY}+137)%256 end `; // Silent Corruption
  vmCore += `table.insert(${STACK}, string.char(math.floor((${byteVar} - ${KEY} - _gIdx * ${SALT}) % 256))) _gIdx=_gIdx+1 end end `;
  
  vmCore += `local _e = table.concat(${STACK}) ${STACK}=nil `;
  const ASSERT = `getfenv()[${runtimeString("assert")}]`, LOADSTRING = `getfenv()[${runtimeString("loadstring")}]`, GAME = `getfenv()[${runtimeString("game")}]`;
  
  if (payloadStr.includes("http")) { vmCore += `${ASSERT}(${LOADSTRING}(${GAME}[${runtimeString("HttpGet")}](${GAME}, _e)))() ` } 
  else { vmCore += `${ASSERT}(${LOADSTRING}(_e))() ` }
  
  return `coroutine.resume(coroutine.create(function() ${vmCore} end))`; // Coroutine Isolation
}

function buildDecoyVM() {
    const garbagePayload = `print("${rnd(1000,9999)}")`;
    let decoy = buildTrueVM(garbagePayload).replace('coroutine.resume', 'pcall'); // Silent fail
    return decoy;
}

// ── Control Flow Flattening & Layers ─────────────────────────────
function applyCFF(blocks) {
  const stateVar = generateIlName();
  let lua = `local ${stateVar}=${heavyMath(1)} while true do `;
  for (let i = 0; i < blocks.length; i++) {
    if (i === 0) lua += `if ${stateVar}==${heavyMath(1)} then ${blocks[i]} ${stateVar}=${heavyMath(2)} `;
    else lua += `elseif ${stateVar}==${heavyMath(i + 1)} then ${blocks[i]} ${stateVar}=${heavyMath(i + 2)} `;
  }
  lua += `elseif ${stateVar}==${heavyMath(blocks.length + 1)} then break end end `;
  return lua;
}

function buildSingleVM(innerCode, handlerCount) {
  const handlers = pickHandlers(handlerCount); const realIdx = rnd(0, handlerCount - 1);
  const DISPATCH = generateIlName(); let out = `local lM={} `;
  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) { out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunk(2)} ${innerCode} end `; } 
    else { out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunk(2)} return nil end `; }
  }
  out += `local ${DISPATCH}={${handlers.map((h, i) => `[${heavyMath(i + 1)}]=${h}`).join(',')}} `;
  let execBlocks = handlers.map((_, i) => `${DISPATCH}[${heavyMath(i + 1)}](lM)`);
  out += applyCFF(execBlocks); 
  return out;
}

// ── Anti-Tampering & Execution ───────────────────────────────────
function getExtraProtections() {
  const antiDebuggers = `local _adT=os.clock() for _=1,150000 do end if os.clock()-_adT>5.0 then while true do end end ` +
    `if debug~=nil and debug.getinfo then local _i=debug.getinfo(1) if _i.what~="main" and _i.what~="Lua" then while true do end end end ` +
    `local _adOk,_adE=pcall(function() error("__v") end) if not string.find(tostring(_adE),"__v") then while true do end end ` +
    `if getmetatable(_G)~=nil then while true do end end `;

  const rawTampers = [
    `if math.pi<3.14 or math.pi>3.15 then _err() end`,
    `if bit32 and bit32.bxor(10,5)~=15 then _err() end`,
    `if type(tostring)~="function" then _err() end`,
    `if type(coroutine.create)~="function" then _err() end`,
    `if type(table.concat)~="function" then _err() end`
  ];

  let codeVaultGuards = "";
  for(let t of rawTampers) {
    const fnName = generateIlName(), errName = generateIlName();
    const injectedError = t.replace("_err()", `${errName}("!")`);
    codeVaultGuards += `local ${fnName}=function() local ${errName}=error ${injectedError} end ${fnName}() `;
  }
  return antiDebuggers + codeVaultGuards;
}

function obfuscate(sourceCode) {
  if (!sourceCode?.trim()) return '--ERROR';
  
  // 1. Detect Payload & Apply mappings
  let payloadToProtect = "";
  const match = sourceCode.match(/loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i);
  if (match) payloadToProtect = match[1];
  else payloadToProtect = detectAndApplyMappings(sourceCode);
  
  // 2. Build True VM and mix with Decoy VMs (from Script 1)
  const trueVM = buildTrueVM(payloadToProtect);
  const decoy1 = buildDecoyVM();
  const decoy2 = buildDecoyVM();
  
  // Shuffle VMs
  const vmPool = [trueVM, decoy1, decoy2];
  for (let i = vmPool.length - 1; i > 0; i--) {
    const j = rnd(0, i);
    [vmPool[i], vmPool[j]] = [vmPool[j], vmPool[i]];
  }
  
  // 3. Wrap everything in up to 18 layers (from Script 2)
  let finalLayer = vmPool.join(' ');
  const layerCount = rnd(12, 18);
  for (let i = 0; i < layerCount; i++) {
    finalLayer = buildSingleVM(finalLayer, rnd(2, 4)); 
  }
  
  // 4. Combine Header, Junk, Protections, and Layers
  const result = `${HEADER}\n${generateJunk(10)}\n${getExtraProtections()}\n${finalLayer}`;
  return result.replace(/\s+/g, " ").trim();
}

module.exports = { obfuscate };
      
