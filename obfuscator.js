// ══════════════════════════════════════════════════════════════
//  vvmer obfuscator  ×  CodeVault v35 wrapper
//  Arquitectura:  CodeVault shell  →  vvmer 18x VM  →  código real
// ══════════════════════════════════════════════════════════════

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

function heavyMath(n) {
  if (Math.random() < 0.8) return n.toString();
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

// TÉCNICA CODE VAULT: Tarpits, Opaque Predicates y Symbol Waterfalls integrados en la Junk
function generateJunk(lines = 100) {
  let j = ''
  for (let i = 0; i < lines; i++) {
    const r = Math.random()
    if (r < 0.2) j += `local ${generateIlName()}=${heavyMath(Math.floor(Math.random() * 999))} `
    else if (r < 0.4) j += `local ${generateIlName()}=string.char(${heavyMath(Math.floor(Math.random()*255))}) `
    else if (r < 0.5) j += `if not(${heavyMath(1)}==${heavyMath(1)}) then local x=1 end `
    else if (r < 0.7) {
      // CODE VAULT: Tarpit (Bucle infinito en ruta muerta)
      const tp = generateIlName();
      j += `if type(nil)=="number" then while true do local ${tp}=1 end end `
    } else if (r < 0.85) {
      // CODE VAULT: Symbol Waterfall Noise
      const vt = generateIlName();
      j += `do local ${vt}={} ${vt}["_"]=1 ${vt}=nil end `
    } else {
      // CODE VAULT: Opaque Predicate
      j += `if type(math.pi)=="string" then local _=1 end `
    }
  }
  return j
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

function runtimeString(str) {
  return `string.char(${str.split('').map(c => heavyMath(c.charCodeAt(0))).join(',')})`;
}

// TÉCNICAS CODE VAULT APLICADAS: Rolling XOR Affine Cipher y Silent Key Corruption
function buildTrueVM(payloadStr) {
  const STACK = generateIlName(); const KEY = generateIlName(); const ORDER = generateIlName()
  const SALT = generateIlName();
  
  const seed = Math.floor(Math.random() * 200) + 50
  const saltVal = Math.floor(Math.random() * 250) + 1 // CODE VAULT: Salt rodante
  
  let vmCore = `local ${STACK}={} local ${KEY}=${heavyMath(seed)} local ${SALT}=${heavyMath(saltVal)} `
  const chunkSize = 15; let realChunks = [];
  for(let i = 0; i < payloadStr.length; i += chunkSize) { realChunks.push(payloadStr.slice(i, i + chunkSize)); }
  let poolVars = []; let realOrder = [];
  let totalChunks = realChunks.length * 3; let currentReal = 0; let globalIndex = 0;
  
  for(let i = 0; i < totalChunks; i++) {
    let memName = generateIlName(); poolVars.push(memName);
    if (currentReal < realChunks.length && (Math.random() > 0.5 || (totalChunks - i) === (realChunks.length - currentReal))) {
      realOrder.push(i + 1);
      let chunk = realChunks[currentReal]; let encryptedBytes = [];
      for(let j = 0; j < chunk.length; j++) { 
        // CODE VAULT: Cifrado Rolling-XOR Affine -> (byte + key + index*salt) % 256
        let enc = (chunk.charCodeAt(j) + seed + (globalIndex * saltVal)) % 256;
        encryptedBytes.push(heavyMath(enc)); 
        globalIndex++;
      }
      vmCore += `local ${memName}={${encryptedBytes.join(',')}} `;
      currentReal++;
    } else {
      let fakeBytes = []; let fakeLen = Math.floor(Math.random() * 20) + 5;
      for(let j = 0; j < fakeLen; j++) { fakeBytes.push(heavyMath(Math.floor(Math.random() * 255))); }
      vmCore += `local ${memName}={${fakeBytes.join(',')}} `;
    }
  }
  
  vmCore += `local _pool={${poolVars.join(',')}} local ${ORDER}={${realOrder.map(n => heavyMath(n)).join(',')}} `;
  const idxVar = generateIlName(); const byteVar = generateIlName();
  
  // CODE VAULT: Decode loop con Interwoven Tamper Checks (Corrupción Silenciosa)
  vmCore += `local _gIdx=0 for _, ${idxVar} in ipairs(${ORDER}) do for _, ${byteVar} in ipairs(_pool[${idxVar}]) do `;
  vmCore += `if type(math.pi)=="string" then ${KEY}=(${KEY}+137)%256 end `; // Silent corruption
  vmCore += `table.insert(${STACK}, string.char(math.floor((${byteVar} - ${KEY} - _gIdx * ${SALT}) % 256))) _gIdx=_gIdx+1 end end `;
  
  vmCore += `local _e = table.concat(${STACK}) ${STACK}=nil `;
  const ASSERT = `getfenv()[${runtimeString("assert")}]`;
  const LOADSTRING = `getfenv()[${runtimeString("loadstring")}]`;
  const GAME = `getfenv()[${runtimeString("game")}]`;
  const HTTPGET = runtimeString("HttpGet");
  if (payloadStr.includes("http")) { vmCore += `${ASSERT}(${LOADSTRING}(${GAME}[${HTTPGET}](${GAME}, _e)))() ` } 
  else { vmCore += `${ASSERT}(${LOADSTRING}(_e))() ` }
  return vmCore
}

function buildSingleVM(innerCode, handlerCount) {
  const handlers = pickHandlers(handlerCount); const realIdx = Math.floor(Math.random() * handlerCount);
  const DISPATCH = generateIlName(); let out = `local lM={} ` 
  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) { out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunk(5)} ${innerCode} end ` } 
    else { out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunk(3)} return nil end ` }
  }
  out += `local ${DISPATCH}={`
  for (let i = 0; i < handlers.length; i++) { out += `[${heavyMath(i + 1)}]=${handlers[i]},` }
  out += `} `
  let execBlocks = []; for (let i = 0; i < handlers.length; i++) { execBlocks.push(`${DISPATCH}[${heavyMath(i + 1)}](lM)`) }
  out += applyCFF(execBlocks); return out
}

function build18xVM(payloadStr) {
  let vm = buildTrueVM(payloadStr);
  for (let i = 0; i < 17; i++) {
    vm = buildSingleVM(vm, Math.floor(Math.random() * 2) + 3); 
  }
  return vm;
}

// TÉCNICAS CODE VAULT APLICADAS: IIFE Wrappers y Error() Oculto
function getExtraProtections() {
  const antiDebuggers =
    `local _adT=os.clock() for _=1,150000 do end if os.clock()-_adT>5.0 then while true do end end ` +
    `if debug~=nil and debug.getinfo then local _i=debug.getinfo(1) if _i.what~="main" and _i.what~="Lua" then while true do end end end ` +
    `local _adOk,_adE=pcall(function() error("__v") end) if not string.find(tostring(_adE),"__v") then while true do end end ` +
    `if getmetatable(_G)~=nil then while true do end end ` +
    `if type(print)~="function" then while true do end end `;

  // Conservando todos tus Tampers originales + Categorías nuevas de Code Vault
  const rawTampers = [
    `if math.pi<3.14 or math.pi>3.15 then _err() end`,
    `if bit32 and bit32.bxor(10,5)~=15 then _err() end`,
    `if type(tostring)~="function" then _err() end`,
    `if not string.match("chk","^c.*k$") then _err() end`,
    `if type(coroutine.create)~="function" then _err() end`,
    `if type(table.concat)~="function" then _err() end`,
    `local _tm1=os.time() local _tm2=os.time() if _tm2<_tm1 then _err() end`,
    `if math.abs(-10)~=10 then _err() end`,
    `if gcinfo and gcinfo()<0 then _err() end`,
    `if type(next)~="function" then _err() end`,
    `if string.len("a")~=1 then _err() end`,
    `if type(table.insert)~="function" then _err() end`,
    // CODE VAULT Categorías Extra
    `if string.byte("Z",1)~=90 then _err() end`,
    `if math.floor(-1/10)~=-1 then _err() end`,
    `if (true and 1 or 2)~=1 then _err() end`,
    `if type(1)~="number" then _err() end`,
    `if type(pcall)~="function" then _err() end`
  ];

  let codeVaultGuards = "";
  for(let t of rawTampers) {
    const fnName = generateIlName();
    const errName = generateIlName();
    // CODE VAULT: Envuelve la guardia en una función anónima inmediata (IIFE) 
    // y esconde 'error' en una variable local dinámica.
    const injectedError = t.replace("_err()", `${errName}("!")`);
    codeVaultGuards += `local ${fnName}=function() local ${errName}=error ${injectedError} end ${fnName}() `;
  }

  return antiDebuggers + codeVaultGuards;
}

function obfuscate(sourceCode) {
  if (!sourceCode) return '--ERROR'
  const antiDebug = `local _clk=os.clock local _t=_clk() for _=1,150000 do end if os.clock()-_t>5.0 then while true do end end `
  const extraProtections = getExtraProtections()
  let payloadToProtect = ""
  const isLoadstringRegex = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i
  const match = sourceCode.match(isLoadstringRegex)
  if (match) { payloadToProtect = match[1] } 
  else { payloadToProtect = detectAndApplyMappings(sourceCode) }
  
  const finalVM = build18xVM(payloadToProtect)
  const result = `${HEADER} ${generateJunk(50)} ${antiDebug} ${extraProtections} ${finalVM}`

  // ── CAPA CODEVAULT: envuelve todo lo anterior como si fuera el payload ──────
  // El resultado de vvmer se convierte en el "código fuente" que CodeVault cifra.
  // Quien vea el archivo solo ve la capa CodeVault; al romperla aparece vvmer.
  const vvmerLayer = result.replace(/\s+/g, " ").trim()
  return wrapWithCodeVault(vvmerLayer)
}

// ══════════════════════════════════════════════════════════════════════════════
//  CODEVAULT WRAPPER — Rolling-XOR affine cipher + base-10 encoding
//  Implementa en JS las mismas técnicas del obfuscador Python CodeVault v35:
//    • Cifrado afín rodante:  c[i] = (b[i] + key + i*salt) % 256
//    • Codificación 3-símbolo del alfabeto barajado (10 chars del pool de 26)
//    • Tabla de lookup O(1) ofuscada con nombres I/l/_
//    • Tarpits en rutas muertas (rawequal(1,2))
//    • Predicados opacos (type(math.pi)=="string")
//    • Corrupción silenciosa de clave en tamper check dentro del loop
//    • Symbol Waterfall Noise
//    • Chunks divididos + nil-out tras uso
// ══════════════════════════════════════════════════════════════════════════════

/** Genera nombre estilo CodeVault: solo I/l/_ de 12-19 chars + sufijo numérico */
function _cvName() {
  const IL = ['I','l','_']
  let nm = IL[Math.floor(Math.random()*3)]
  const len = 12 + Math.floor(Math.random()*8)
  for (let i = 1; i < len; i++) nm += IL[Math.floor(Math.random()*3)]
  return nm + Math.floor(Math.random()*9999)
}

/** Emite un número en hex con case aleatorio y padding variable */
function _cvHex(v) {
  v = Math.floor(v)
  const neg = v < 0; const abs = Math.abs(v)
  let h = abs.toString(16)
  const pads = [2,2,4,4,6]
  const padLen = Math.max(h.length, pads[Math.floor(Math.random()*pads.length)])
  h = h.padStart(padLen, '0')
  h = [...h].map(c => Math.random() < 0.5 ? c.toUpperCase() : c.toLowerCase()).join('')
  const px = Math.random() < 0.5 ? '0x' : '0X'
  return neg ? `(-${px}${h})` : `${px}${h}`
}

/** Junk mínimo (evita inflar el tamaño): tarpits + waterfalls + predicados opacos */
function _cvJunk(n = 4) {
  let j = ''
  for (let i = 0; i < n; i++) {
    const v = _cvName(); const r = Math.random()
    if      (r < 0.25) j += `local ${v}=${_cvHex(Math.floor(Math.random()*9999))} `
    else if (r < 0.50) j += `if type(nil)=="number" then while true do local ${v}=0 end end `
    else if (r < 0.75) j += `if type(math.pi)=="string" then local ${v}=1 end `
    else               j += `do local ${v}={} ${v}["_"]=1 ${v}=nil end `
  }
  return j
}

/**
 * wrapWithCodeVault(luaCode)
 *
 * Toma cualquier código Lua ya ofuscado por vvmer y lo envuelve con la capa
 * CodeVault: cifrado afín rodante → codificación base-10 → loadstring.
 *
 * Flujo en el archivo final generado:
 *   1. Se ve → capa CodeVault  (rolling-XOR + símbolos ilegibles)
 *   2. Al descifrar → capa vvmer  (18x VM + CFF + anti-debug)
 *   3. Al descifrar → código real del usuario
 */
function wrapWithCodeVault(luaCode) {

  // ── 1. Alfabeto de 10 símbolos barajado del pool de 26 ─────────────────────
  // Pool seguro para strings Lua: ningún char es " ni \
  const POOL = Array.from(">#_</$|^!@%?=+-*:.;,(){}[]")
  // Fisher-Yates shuffle
  for (let i = POOL.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [POOL[i], POOL[j]] = [POOL[j], POOL[i]]
  }
  const sym10 = POOL.slice(0, 10).join('')

  // ── 2. Cifrado Rolling-XOR afín  c[i] = (b[i] + key + i*salt) % 256 ───────
  const key  = Math.floor(Math.random()*254) + 1
  const salt = Math.floor(Math.random()*253) + 1
  // Codifica solo los primeros 8 bits de cada char (Lua scripts = ASCII/Latin1)
  const bytes    = Array.from(luaCode).map(c => c.charCodeAt(0) & 0xFF)
  const ciphered = bytes.map((b, i) => (b + key + i * salt) % 256)

  // ── 3. Cada byte cifrado → 3 símbolos del alfabeto barajado ────────────────
  const enc3 = b => sym10[Math.floor(b/100)] + sym10[Math.floor((b/10)%10)] + sym10[b%10]
  const encoded = ciphered.map(enc3).join('')

  // ── 4. Divide el payload en 4 chunks (hace el string menos obvio) ──────────
  const cs = Math.floor(encoded.length/4)
  const chunks = [
    encoded.slice(0,    cs),
    encoded.slice(cs,   cs*2),
    encoded.slice(cs*2, cs*3),
    encoded.slice(cs*3)
  ]

  // ── 5. Nombres de variables (solo I/l/_) ───────────────────────────────────
  const vK    = _cvName()  // clave
  const vS    = _cvName()  // salt
  const vMAP  = _cvName()  // tabla de lookup
  const vD    = _cvName()  // buffer de decode
  const vI    = _cvName()  // índice del loop
  const vB    = _cvName()  // byte reconstruido
  const vFN   = _cvName()  // función cargada
  const vTC   = _cvName()  // table.concat local
  const vFULL = _cvName()  // payload completo
  const vCHK  = [_cvName(), _cvName(), _cvName(), _cvName()]

  // Tabla de lookup: sym10[i] → i  (O(1), sin string.find)
  const mapEntries = [...sym10].map((c, i) => `["${c}"]=${_cvHex(i)}`).join(',')

  // ── 6. Construye el bloque Lua ──────────────────────────────────────────────
  let lua = ''

  // Preámbulo con ruido
  lua += _cvJunk(3)
  lua += `local ${vK}=${_cvHex(key)} `
  lua += `local ${vS}=${_cvHex(salt)} `
  lua += _cvJunk(2)

  // Tabla de lookup
  lua += `local ${vMAP}={${mapEntries}} `
  lua += _cvJunk(2)

  // Chunks  (con tarpits en rutas muertas — never fires)
  for (let i = 0; i < 4; i++) {
    lua += `local ${vCHK[i]}="${chunks[i]}" `
    lua += `if rawequal(1,2) then ${vCHK[i]}=nil end `   // tarpit / dead path
    lua += _cvJunk(1)
  }

  // Ensambla payload completo y destruye chunks
  lua += `local ${vTC}=table.concat `
  lua += `local ${vFULL}=${vTC}({${vCHK.join(',')}}) `
  for (const cv of vCHK) lua += `${cv}=nil `
  lua += _cvJunk(2)

  // ── 7. Loop de decodificación con tamper check de corrupción silenciosa ─────
  //  Si alguien parchea la clave (type(math.pi)=="string" nunca es true en Lua
  //  legítimo) → la clave se corrompe → el resultado decodificado es basura.
  //  No hay error(), el script "funciona" pero produce garbage.  Code Vault ♥
  lua += `local ${vD}={} `
  lua += `if not rawequal(1,2) then `                      // opaque predicate TRUE
  lua += `for ${vI}=1,#${vFULL},3 do `
  lua += `if type(math.pi)=="string" then ${vK}=(${vK}+137)%256 end `  // silent corruption
  lua += `local _c0=(${vMAP}[string.sub(${vFULL},${vI},${vI})] or 0) `
  lua += `local _c1=(${vMAP}[string.sub(${vFULL},${vI}+1,${vI}+1)] or 0) `
  lua += `local _c2=(${vMAP}[string.sub(${vFULL},${vI}+2,${vI}+2)] or 0) `
  lua += `local ${vB}=_c0*100+_c1*10+_c2 `
  lua += `local _xi=math.floor((${vI}-1)/3) `
  lua += `${vD}[#${vD}+1]=string.char(math.floor((${vB}-${vK}-_xi*${vS})%256)) `
  lua += `end end `

  // Destruye referencias sensibles
  lua += `${vMAP}=nil ${vFULL}=nil `
  lua += _cvJunk(2)

  // ── 8. Ejecuta el payload descifrado  ──────────────────────────────────────
  lua += `local ${vFN}=loadstring(${vTC}(${vD})) or load(${vTC}(${vD})) `
  lua += `${vD}=nil `
  lua += `if ${vFN} then ${vFN}() end `
  lua += _cvJunk(2)

  // Minify final: colapsa whitespace igual que CodeVault v35
  return lua.replace(/\s+/g, ' ').trim()
}

module.exports = { obfuscate }
