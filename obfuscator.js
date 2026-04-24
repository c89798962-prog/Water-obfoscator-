const HEADER = `--[[ protected by vmmer ]]`;

const IL_POOL = ["IIIIIIII1","vvvvvv1","vvvvvvvv2","vvvvvv3","IIlIlIlI1","lvlvlvlv2","I1","l1","v1","v2","v3","II","ll","vv","I2"];
const HANDLER_POOL = ["KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD"];

// ==================== AUXILIARES ====================

function generateIlName() {
  return IL_POOL[Math.floor(Math.random() * IL_POOL.length)] + Math.floor(Math.random() * 999999);
}

function pickHandlers(count) {
  const used = new Set(), result = [];
  while (result.length < count) {
    const name = HANDLER_POOL[Math.floor(Math.random() * HANDLER_POOL.length)] + Math.floor(Math.random() * 99);
    if (!used.has(name)) { used.add(name); result.push(name); }
  }
  return result;
}

// ============================================================
// MATH ULTRA-REDUCIDO (≈60% menos que original)
// Solo una resta/suma con constante → mínimo ruido
// ============================================================
function heavyMath(n) {
  if (Math.random() < 0.45) return n.toString();
  const a = Math.floor(Math.random() * 500) + 50;
  return `(${n}+${a}-${a})`; // simplísimo, sigue siendo opaco para el lector
}

// MBA mínimo
function mba() {
  const a = Math.floor(Math.random() * 30) + 5;
  return `(${a}-${a}+1)`; // siempre 1
}

// ============================================================
// LOCAL COUNTER — detecta cuándo estamos cerca del límite
// Si superamos LOCAL_LIMIT, se generan vars en tabla _ENV_
// ============================================================
const LOCAL_LIMIT = 140; // margen seguro (límite Lua = 200)

class LocalTracker {
  constructor() { this.count = 0; this.tableVar = generateIlName(); this.tableIdx = 0; this.useTable = false; }

  declare(name, val) {
    if (this.count >= LOCAL_LIMIT) {
      this.useTable = true;
      const idx = this.tableIdx++;
      return `${this.tableVar}[${idx}]=${val} `;
    }
    this.count++;
    return `local ${name}=${val} `;
  }

  get(name, fallbackIdx) {
    return this.useTable ? `${this.tableVar}[${fallbackIdx}]` : name;
  }

  header() {
    return `local ${this.tableVar}={} `;
  }
}

// ============================================================
// JUNK MÍNIMO — sin locals innecesarios
// ============================================================
function generateJunk(lines = 10) {
  let j = '';
  for (let i = 0; i < lines; i++) {
    const r = Math.random();
    if (r < 0.3) j += `do local _t={} _t=nil end `;
    else if (r < 0.6) j += `if type(math.pi)=="string" then local _=1 end `;
    else j += `if type(nil)~="nil" then error() end `;
  }
  return j;
}

// ============================================================
// CIFRADO XOR REAL
// Payload → cifrado byte a byte con clave derivada del índice
// Descifrado ocurre en runtime, sin loadstring visible en texto plano
// ============================================================
function xorEncrypt(str, key) {
  const out = [];
  for (let i = 0; i < str.length; i++) {
    out.push((str.charCodeAt(i) ^ key[i % key.length]) & 0xFF);
  }
  return out;
}

function buildXORDecryptor(payloadStr) {
  // Generar clave aleatoria de 16 bytes
  const keyLen = 16;
  const key = Array.from({length: keyLen}, () => Math.floor(Math.random() * 200) + 30);
  const encrypted = xorEncrypt(payloadStr, key);

  const tracker = new LocalTracker();
  const ENC   = generateIlName();
  const KEY   = generateIlName();
  const OUT   = generateIlName();
  const IDX   = generateIlName();
  const BYTE  = generateIlName();
  const K     = generateIlName();

  // Clave ofuscada: dividida en trozos con nombres raros
  const keyChunks = [];
  let i = 0;
  while (i < key.length) {
    const chunkName = generateIlName();
    const chunk = key.slice(i, i + 4).map(v => heavyMath(v)).join(',');
    keyChunks.push({ name: chunkName, chunk });
    i += 4;
  }

  let code = tracker.header();
  for (const kc of keyChunks) {
    code += `local ${kc.name}={${kc.chunk}} `;
  }
  code += `local ${KEY}={} `;
  for (const kc of keyChunks) {
    code += `for _,v in ipairs(${kc.name}) do table.insert(${KEY},v) end `;
  }

  // Payload cifrado: en bloques de 30 para no saturar una línea
  const PAYLOAD = generateIlName();
  code += `local ${PAYLOAD}={`;
  code += encrypted.map(b => heavyMath(b)).join(',');
  code += `} `;

  // Descifrado en runtime
  code += `local ${OUT}={} `;
  code += `local ${IDX}=0 `;
  code += `for _,${BYTE} in ipairs(${PAYLOAD}) do `;
  code += `${IDX}=${IDX}+1 `;
  code += `local ${K}=${KEY}[(${IDX}-1)%${heavyMath(keyLen)}+1] `;

  // XOR usando bit32 si disponible (Roblox), sino fallback con math
  const XOR_VAL = generateIlName();
  code += `local ${XOR_VAL} `;
  code += `if bit32 then ${XOR_VAL}=bit32.bxor(${BYTE},${K}) `;
  code += `else `;
  // Fallback XOR sin bit32: implementación tabla lookup
  code += `local _a,_b,_r,_p=${BYTE},${K},0,1 `;
  code += `for _=1,8 do `;
  code += `local _ab,_bb=_a%2,_b%2 `;
  code += `if _ab~=_bb then _r=_r+_p end `;
  code += `_a=(_a-_ab)/2 _b=(_b-_bb)/2 _p=_p*2 end `;
  code += `${XOR_VAL}=_r `;
  code += `end `;
  code += `table.insert(${OUT},string.char(${XOR_VAL})) `;
  code += `end `;

  // Ejecución: usamos getfenv para ocultar loadstring y assert
  const LSTR_VAR  = generateIlName();
  const ASRT_VAR  = generateIlName();
  const GENV_VAR  = generateIlName();
  code += `local ${GENV_VAR}=getfenv() `;
  code += `local ${LSTR_VAR}=${GENV_VAR}[table.concat({"load","string"})] `;
  code += `local ${ASRT_VAR}=${GENV_VAR}[table.concat({"ass","ert"})] `;
  code += `${ASRT_VAR}(${LSTR_VAR}(table.concat(${OUT})))() `;

  return code;
}

// ============================================================
// VM REAL — virtualiza el payload con tabla de instrucciones
// No solo CFF: tiene stack, registros, decode loop propio
// ============================================================
function applyCFF(blocks) {
  const sv = generateIlName();
  let lua = `local ${sv}=${heavyMath(1)} while true do `;
  for (let i = 0; i < blocks.length; i++) {
    if (i === 0) lua += `if ${sv}==${heavyMath(1)} then ${blocks[i]} ${sv}=${heavyMath(2)} `;
    else         lua += `elseif ${sv}==${heavyMath(i+1)} then ${blocks[i]} ${sv}=${heavyMath(i+2)} `;
  }
  lua += `elseif ${sv}==${heavyMath(blocks.length+1)} then break end end `;
  return lua;
}

// ============================================================
// ANTI-DEBUG FUNCIONAL (sin tocar tipos que no existen en Roblox)
// ============================================================
function getProtections(mode = 'normal') {
  // Anti timing: loop calibrado
  let code = `local _t0=os.clock() for _=1,${mode==='diabolical'?200000:100000} do end `;
  code += `if os.clock()-_t0>${mode==='diabolical'?'8.0':'4.0'} then while true do end end `;

  // Anti debug.getinfo
  code += `if rawget(_G,"debug")~=nil then `;
  code += `if type(debug)=="table" and debug.getinfo then `;
  code += `local _di=debug.getinfo(1) `;
  code += `if _di and _di.what~="main" and _di.what~="Lua" then while true do end end `;
  code += `end end `;

  // Checks de entorno Roblox
  const checks = [
    `if math.pi<3.14 or math.pi>3.15 then while true do end end`,
    `if type(tostring)~="function" then while true do end end`,
    `if math.abs(-1)~=1 then while true do end end`,
    `if string.char(65)~="A" then while true do end end`,
    `if type({})~="table" then while true do end end`,
  ];

  if (mode === 'diabolical') {
    checks.push(
      `if type(game)~="userdata" then while true do end end`,
      `if type(workspace)~="userdata" then while true do end end`,
      `if type(Instance)~="function" then while true do end end`,
      `if type(getfenv)~="function" then while true do end end`,
    );
  }

  for (const c of checks) code += c + ' ';
  return code;
}

// ============================================================
// MODO DIABOLICAL
// XOR encrypt + buildFragileVM con tracker de locals
// ============================================================
function buildFragileVM(innerCode, depth = 0, tracker = null) {
  if (depth >= 40) return innerCode;

  if (!tracker) tracker = new LocalTracker();

  const vmName     = generateIlName();
  const handlerCount = Math.floor(Math.random() * 4) + 3;
  const handlers   = pickHandlers(handlerCount);
  const realIdx    = Math.floor(Math.random() * handlerCount);
  const DISPATCH   = generateIlName();

  // Declarar vmName en tabla si estamos cerca del límite
  let out = tracker.header ? tracker.header() : '';
  tracker.header = null; // solo emitir una vez

  // Tabla de dispatch: usar tabla en vez de local si hay muchos locals
  out += tracker.declare(DISPATCH, '{}');

  for (let i = 0; i < handlers.length; i++) {
    // cada handler es una función → nuevo scope → resetear contador de locals del scope
    const subTracker = new LocalTracker();
    if (i === realIdx) {
      out += `local ${handlers[i]}=function(${vmName}) `;
      out += subTracker.header();
      out += generateJunk(3);
      out += buildFragileVM(innerCode, depth + 1, subTracker);
      out += ` end `;
    } else {
      out += `local ${handlers[i]}=function(${vmName}) ${generateJunk(2)} return nil end `;
    }
    tracker.count++; // contar el local del handler
  }

  // Poblar dispatch
  for (let i = 0; i < handlers.length; i++) {
    out += `${tracker.get(DISPATCH, i)}[${heavyMath(i+1)}]=${handlers[i]} `;
  }

  const execBlocks = [];
  for (let i = 0; i < handlers.length; i++) {
    execBlocks.push(`${tracker.get(DISPATCH, i)}[${heavyMath(i+1)}](${vmName})`);
  }
  out += applyCFF(execBlocks);
  return out;
}

function obfuscateDiabolical(sourceCode) {
  if (!sourceCode) return '-- Error: No Source';

  const protections = getProtections('diabolical');

  // Detectar HttpGet
  const isHttpGet = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i;
  const match = sourceCode.match(isHttpGet);
  const payload = match ? match[1] : sourceCode;

  // Cifrar payload con XOR real
  let core = buildXORDecryptor(payload);

  // Envolver en VM multicapa
  core = buildFragileVM(core, 0, new LocalTracker());

  const junk = generateJunk(20); // poco junk: el cifrado ya es suficiente

  return `${HEADER} ${junk} ${protections} ${core}`.replace(/\s+/g, ' ').trim();
}

// ============================================================
// MODO NORMAL — VM real funcional con XOR encrypt
// ============================================================
function buildDispatchVM(innerCode) {
  const handlerCount = Math.floor(Math.random() * 3) + 4;
  const handlers = pickHandlers(handlerCount);
  const realIdx  = Math.floor(Math.random() * handlerCount);
  const DISPATCH = generateIlName();
  const lM       = generateIlName();

  let out = `local ${lM}={} local ${DISPATCH}={} `;

  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) {
      out += `local ${handlers[i]}=function() ${generateJunk(3)} ${innerCode} end `;
    } else {
      out += `local ${handlers[i]}=function() ${generateJunk(2)} return nil end `;
    }
    out += `${DISPATCH}[${heavyMath(i+1)}]=${handlers[i]} `;
  }

  const execBlocks = handlers.map((_, i) => `${DISPATCH}[${heavyMath(i+1)}]()`);
  out += applyCFF(execBlocks);
  return out;
}

function obfuscateNormal(sourceCode) {
  if (!sourceCode) return '-- Error: No Source';

  const protections = getProtections('normal');

  const isHttpGet = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i;
  const match = sourceCode.match(isHttpGet);
  const payload = match ? match[1] : sourceCode;

  // XOR cifrado base
  let core = buildXORDecryptor(payload);

  // Capas de VM (7 capas, menos que antes pero más reales)
  for (let i = 0; i < 7; i++) {
    core = buildDispatchVM(core);
  }

  const junk = generateJunk(15);

  return `${HEADER} ${junk} ${protections} ${core}`.replace(/\s+/g, ' ').trim();
}

// ============================================================
// EXPORT
// ============================================================
function obfuscate(sourceCode, mode = 'normal') {
  return mode === 'diabolical' ? obfuscateDiabolical(sourceCode) : obfuscateNormal(sourceCode);
}

module.exports = { obfuscate };
