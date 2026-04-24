// ============================================================
// Vmmer Obfuscator – 70% less math, full MoonVeil-style tech
// Custom IL_POOL & HANDLER_POOL, no MoonVeil similarities
// ============================================================
const HEADER = `--[[ this code it's protected by vmmer obfoscator ]]`;

// ---------- Custom variable/function name pools (not MoonVeil) ----------
const IL_POOL  = ["Xa","Yb","Zc","P1","Q2","R3","S4","T5","U6","V7","W8","K9","L0","Mx","Ny","Oz"];
const HANDLER_POOL = ["Aa","Bb","Cc","Dd","Ee","Ff","Gg","Hh","Ii","Jj","Kk","Ll"];

function generateIlName() {
  return IL_POOL[Math.floor(Math.random() * IL_POOL.length)] + Math.floor(Math.random() * 999);
}

function pickHandlers(count) {
  const used = new Set();
  const result = [];
  while (result.length < count) {
    const base = HANDLER_POOL[Math.floor(Math.random() * HANDLER_POOL.length)];
    const name = base + Math.floor(Math.random() * 99);
    if (!used.has(name)) { used.add(name); result.push(name); }
  }
  return result;
}

// ==================== MATH REDUCIDO (~70% menos operaciones) ====================
// Instead of heavy nested calls, we only use minimal arithmetic.
function lightMath(n) {
  if (Math.random() < 0.6) return n.toString();   // directo el 60% de las veces
  // Simple wrap: n+0 or n*1
  const mode = Math.floor(Math.random() * 3);
  if (mode === 0) return `(${n}+0)`;
  if (mode === 1) return `(${n}*1)`;
  return `((${n}*2)/2)`;                          // neutral, muy ligero
}

// mixed boolean arithmetic (más pequeña)
function mbaNormal() {
  let n = Math.random() > 0.5 ? 1 : 2;
  return `(${n}*1/${1}+0)`;   // siempre 1 o 2
}

// ==================== JUNK ====================
function generateJunkNormal(lines = 100) {
  let j = '';
  for (let i = 0; i < lines; i++) {
    const r = Math.random();
    if (r < 0.2) {
      j += `local ${generateIlName()}=${lightMath(Math.floor(Math.random() * 999))} `;
    } else if (r < 0.4) {
      j += `local ${generateIlName()}=string.char(${lightMath(Math.floor(Math.random()*255))}) `;
    } else if (r < 0.5) {
      j += `if not(${lightMath(1)}==${lightMath(1)}) then local x=1 end `;
    } else if (r < 0.7) {
      const tp = generateIlName();
      j += `if type(nil)=="number" then while true do local ${tp}=1 end end `;
    } else if (r < 0.85) {
      const vt = generateIlName();
      j += `do local ${vt}={} ${vt}["_"]=1 ${vt}=nil end `;
    } else {
      j += `if type(math.pi)=="string" then local _=1 end `;
    }
  }
  return j;
}

function runtimeString(str) {
  return `string.char(${str.split('').map(c => lightMath(c.charCodeAt(0))).join(',')})`;
}

// ==================== TÉCNICAS MOONVEIL (adaptadas) ====================

// 1. Mangle statements: wrap each statement in an "if true then" block
function mangleStatements(code) {
  // Simple regex: split on ; detect lines, wrap
  return code.replace(/([^;\n]+)/g, (stmt) => {
    if (stmt.trim().length === 0) return stmt;
    return `if true then ${stmt} end`;
  });
}

// 2. Mangle numbers: replace literal numbers with lightMath expressions
function mangleNumbers(code) {
  return code.replace(/\b(\d+)\b/g, (num) => lightMath(parseInt(num)));
}

// 3. Lift constants (0, 25, 50, 75, 100) style: replace them with cached variables
function liftConstants(code) {
  const lifted = [];
  const map = {0:'_c0',25:'_c25',50:'_c50',75:'_c75',100:'_c100'};
  let pre = '';
  for (const [val, vname] of Object.entries(map)) {
    if (code.includes(val)) {
      pre += `local ${vname}=${val}; `;
      lifted.push({ regex: new RegExp(`\\b${val}\\b`, 'g'), vname });
    }
  }
  for (const l of lifted) {
    code = code.replace(l.regex, l.vname);
  }
  return pre + code;
}

// 4. Flatten control flow (simplistic): wrap whole script in a while true do break end
function flattenControlFlow(code) {
  return `while true do ${code} break end`;
}

// 5. Mangle strings: replace with runtimeString calls
function mangleStrings(code) {
  return code.replace(/"([^"]*)"/g, (_, str) => runtimeString(str));
}

// 6. Mangle self-calls: rename self to a random variable
function mangleSelfCalls(code) {
  const selfVar = generateIlName();
  return `local ${selfVar}=... ` + code.replace(/\bself\b/g, selfVar);
}

// 7. Mangle globals: prefix globals with _G access wrapped in function
function mangleGlobals(code) {
  return code.replace(/\b(game|workspace|script|Enum)\b/g, (word) => `_G[${runtimeString(word)}]`);
}

// ==================== MAPPING DETECTION ====================
function detectAndApplyMappingsNormal(code) {
  const MAPEO = {
    "ScreenGui":"Aggressive Renaming",
    "Frame":"String to Math",
    "TextLabel":"Table Indirection",
    "TextButton":"Mixed Boolean Arithmetic",
    "Humanoid":"Dynamic Junk",
    "Player":"Fake Flow"
  };
  let modified = code, headers = "";
  for (const [word, tech] of Object.entries(MAPEO)) {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    if (regex.test(modified)) {
      let replacement = `"${word}"`;
      if (tech.includes("Aggressive Renaming")) {
        const v = generateIlName();
        headers += `local ${v}="${word}";`;
        replacement = v;
      } 
      else if (tech.includes("String to Math")) {
        replacement = runtimeString(word);
      } 
      else if (tech.includes("Mixed Boolean Arithmetic")) {
        replacement = `((${mbaNormal()}==1 or true)and"${word}")`;
      }
      regex.lastIndex = 0;
      modified = modified.replace(regex, () => `game[${replacement}]`);
    }
  }
  return headers + modified;
}

// ==================== VM (modificado con menos matemática) ====================
function buildTrueVMNormal(payloadStr) {
  const STACK = generateIlName();
  const KEY = generateIlName();
  const SALT = generateIlName();
  const seed = Math.floor(Math.random() * 200) + 50;
  const saltVal = Math.floor(Math.random() * 250) + 1;
  let vmCore = `local ${STACK}={} local ${KEY}=${lightMath(seed)} local ${SALT}=${lightMath(saltVal)} `;
  const chunkSize = 15;
  let realChunks = [];
  for (let i = 0; i < payloadStr.length; i += chunkSize) {
    realChunks.push(payloadStr.slice(i, i + chunkSize));
  }
  let poolVars = [];
  let realOrder = [];
  let totalChunks = realChunks.length * 3;
  let currentReal = 0;
  let globalIndex = 0;
  for (let i = 0; i < totalChunks; i++) {
    let memName = generateIlName();
    poolVars.push(memName);
    if (currentReal < realChunks.length && Math.random() > 0.5) {
      realOrder.push(i + 1);
      let chunk = realChunks[currentReal];
      let encryptedBytes = [];
      for (let j = 0; j < chunk.length; j++) {
        let enc = (chunk.charCodeAt(j) + seed + (globalIndex * saltVal)) % 256;
        encryptedBytes.push(lightMath(enc));
        globalIndex++;
      }
      vmCore += `local ${memName}={${encryptedBytes.join(',')}} `;
      currentReal++;
    } else {
      let fakeBytes = [];
      for (let j = 0; j < 10; j++) {
        fakeBytes.push(lightMath(Math.floor(Math.random() * 255)));
      }
      vmCore += `local ${memName}={${fakeBytes.join(',')}} `;
    }
  }
  vmCore += `local _pool={${poolVars.join(',')}} local _order={${realOrder.map(n => lightMath(n)).join(',')}} `;
  vmCore += `local _gIdx=0 for _, idx in ipairs(_order) do for _, byte in ipairs(_pool[idx]) do `;
  vmCore += `table.insert(${STACK}, string.char(math.floor((byte - ${KEY} - _gIdx * ${SALT}) % 256))) _gIdx=_gIdx+1 end end `;
  vmCore += `local _e = table.concat(${STACK}) ${STACK}=nil `;
  const ASSERT = `getfenv()[${runtimeString("assert")}]`;
  const LOADSTRING = `getfenv()[${runtimeString("loadstring")}]`;
  vmCore += `${ASSERT}(${LOADSTRING}(_e))() `;
  return vmCore;
}

// ==================== PROTECCIONES ====================
function getNormalProtections() {
  return `local _adT=os.clock() for _=1,100000 do end if os.clock()-_adT>5 then while true do end end `;
}

// ==================== OBFUSCATE PRINCIPAL ====================
function obfuscateNormal(sourceCode) {
  if (!sourceCode) return '-- Error: No Source';

  // Aplicar técnicas secuencialmente
  let code = sourceCode;
  // 1. Mangle statements
  code = mangleStatements(code);
  // 2. Mangle numbers
  code = mangleNumbers(code);
  // 3. Lift constants
  code = liftConstants(code);
  // 4. Flatten control flow
  code = flattenControlFlow(code);
  // 5. Mangle strings
  code = mangleStrings(code);
  // 6. Mangle self-calls
  code = mangleSelfCalls(code);
  // 7. Mangle globals
  code = mangleGlobals(code);
  // 8. Apply mapping (rename as needed)
  code = detectAndApplyMappingsNormal(code);

  // 9. Embed protections and wrap in VM
  const protections = getNormalProtections();
  let vm = buildTrueVMNormal(code);

  // 10. Final assembly with junk
  let finalCode = `${HEADER} ${generateJunkNormal(40)} ${protections} ${vm}`;

  // Compactar un poco
  finalCode = finalCode.replace(/\s+/g, " ").trim();
  return finalCode;
}

module.exports = { obfuscateNormal };
