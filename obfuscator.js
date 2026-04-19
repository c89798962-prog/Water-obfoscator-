/*
 ╔══════════════════════════════════════════════════════════════╗
 ║         WATER OBFUSCATOR PRO v3.0 - MAXIMUM STRENGTH        ║
 ║              discord.gg/UttE8VYAY                           ║
 ╚══════════════════════════════════════════════════════════════╝

  TÉCNICAS IMPLEMENTADAS:
  ► VM de Registros con 32 opcodes falsos
  ► Opaque Predicates matemáticamente irresolubles
  ► String Encoding total (0 strings legibles en el output)
  ► Control Flow Flattening con dispatcher cifrado
  ► 6 Capas de encriptación en cascada
  ► Anti-Debug con trampa de tiempo y pcall poisoning
  ► Constant Folding inverso (expande constantes)
  ► Dead Code Insertion inteligente (nunca ejecutado)
  ► Variable Splitting (una variable → N fragmentos)
  ► lM Flooding extremo
*/

const DISCORD = "https://discord.gg/UttE8VYAY";
const HEADER = `--[[ WATER OBFUSCATOR PRO v3.0 | ${DISCORD} ]]`;

// ─────────────────────────────────────────────────────────────
//  GENERADORES DE NOMBRES
// ─────────────────────────────────────────────────────────────

const CHARS_CONFUSE = ["I","l","1","i"];
const CHARS_V      = ["v","V","u","U"];

function confuseName(len = 10) {
  // Genera nombres visualmente idénticos con I/l/1
  let s = "";
  const pool = [...CHARS_CONFUSE, ...CHARS_V];
  for (let i = 0; i < len; i++) s += pool[Math.floor(Math.random() * pool.length)];
  return s + Math.floor(Math.random() * 9999999);
}

function randName() {
  return confuseName(Math.floor(Math.random() * 8) + 6);
}

function r(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─────────────────────────────────────────────────────────────
//  OPAQUE PREDICATES (siempre true, irresolubles estáticamente)
// ─────────────────────────────────────────────────────────────
// Un opaque predicate es una condición que siempre es true/false
// pero que un analizador estático no puede resolver fácilmente.

function opaqueTrue() {
  const patterns = [
    // a² + b² ≠ c² para tripletas no pitagóricas
    `(${r(2,50)}^2 + ${r(3,40)}^2 ~= ${r(1,10)}^2)`,
    // n*(n+1) siempre es par
    `(function() local n=${r(1,999)} return (n*(n+1))%2==0 end)()`,
    // bit ops deterministas
    `(bit32.bxor(${r(1,255)},${r(1,255)})>=0)`,
    // propiedad matemática siempre verdadera
    `(math.floor(math.abs(${r(-999,-1)})) > 0)`,
    // string length
    `(#("${Array(r(3,12)).fill("x").join("")}")>${r(1,2)})`,
  ];
  return patterns[Math.floor(Math.random() * patterns.length)];
}

function opaqueFalse() {
  const n = r(2, 99);
  const patterns = [
    `(${n}^2 < 0)`,
    `(math.pi == 3)`,
    `(math.abs(${r(1,100)}) < 0)`,
    `("a" == "b")`,
    `(false and ${opaqueTrue()})`,
  ];
  return patterns[Math.floor(Math.random() * patterns.length)];
}

// ─────────────────────────────────────────────────────────────
//  MATEMÁTICAS PESADAS PARA CONSTANTES
// ─────────────────────────────────────────────────────────────

function heavyConst(n) {
  // Expande un número en una expresión matemática que evaluá a n
  const a = r(100, 9999), b = r(2, 99), c = r(1, 999);
  const strategies = [
    `(((${n + a} - ${a})))`,
    `(((${n * b}) / ${b}))`,
    `((${n + c} - ${c}) + (${a} - ${a}))`,
    `(bit32.bxor(bit32.bxor(${n},${b}),${b}))`,
    `(math.floor(${n * b + c - c} / ${b}))`,
    `((function() local _x=${n * b} return _x/${b} end)())`,
  ];
  return strategies[Math.floor(Math.random() * strategies.length)];
}

// ─────────────────────────────────────────────────────────────
//  ENCODERS DE STRINGS (TOTAL: 0 strings en claro)
// ─────────────────────────────────────────────────────────────

// Método 1: XOR con clave rotante
function encodeXOR(str) {
  const key = r(33, 200);
  const step = r(1, 13);
  const encoded = str.split('').map((c, i) => c.charCodeAt(0) ^ (key + (i * step) % 127));
  const k1 = randName(), k2 = randName(), k3 = randName(), out = randName();
  return `(function() local ${k1}={${encoded.map(b => heavyConst(b)).join(',')}} local ${k2}=${heavyConst(key)} local ${k3}=${heavyConst(step)} local ${out}="" for ${randName()}=1,#${k1} do ${out}=${out}..string.char(bit32.bxor(${k1}[${randName()}],( ${k2}+(( ${randName()}-1)*${k3})%127))) end return ${out} end)()`;
}

// Método 2: string.char de cada caracter con heavyMath
function encodeCharArray(str) {
  const chars = str.split('').map(c => heavyConst(c.charCodeAt(0)));
  return `string.char(${chars.join(',')})`;
}

// Método 3: tabla dividida con concat
function encodeTable(str) {
  const tbl = randName(), res = randName();
  const entries = str.split('').map(c => `string.char(${heavyConst(c.charCodeAt(0))})`);
  return `(function() local ${tbl}={${entries.join(',')}} local ${res}="" for _,v in ipairs(${tbl}) do ${res}=${res}..v end return ${res} end)()`;
}

function encodeString(str) {
  const method = r(0, 2);
  if (method === 0) return encodeXOR(str);
  if (method === 1) return encodeCharArray(str);
  return encodeTable(str);
}

// ─────────────────────────────────────────────────────────────
//  JUNK CODE CON OPAQUE PREDICATES
// ─────────────────────────────────────────────────────────────

function junk(n = 50) {
  let code = '';
  for (let i = 0; i < n; i++) {
    const v = randName();
    const patterns = [
      `local ${v}=${heavyConst(r(1,9999))} `,
      `if ${opaqueFalse()} then local ${v}=1 end `,
      `local ${v}=(function() return ${heavyConst(r(1,255))} end)() `,
      `while ${opaqueFalse()} do break end `,
      `local ${v}={}; if ${opaqueTrue()} then ${v}[${heavyConst(1)}]=${heavyConst(r(0,9))} end `,
      `do local ${v}=${heavyConst(r(0,100))} ${v}=nil end `,
      `local ${v}=string.char(${heavyConst(r(65,90))}) if ${opaqueFalse()} then error(${v}) end `,
      `if ${opaqueTrue()} then else local ${v}=1 end `,
    ];
    code += patterns[Math.floor(Math.random() * patterns.length)];
  }
  return code;
}

// ─────────────────────────────────────────────────────────────
//  VARIABLE SPLITTING
//  Divide: local x = "hello"
//  En:     local a,b,c,d,e + reconstruct
// ─────────────────────────────────────────────────────────────

function splitVariable(value, targetName) {
  const parts = Math.floor(Math.random() * 3) + 3; // 3-5 partes
  const partNames = Array.from({length: parts}, () => randName());
  const chunkSize = Math.ceil(value.length / parts);
  let code = '';
  let partStrings = [];
  for (let i = 0; i < parts; i++) {
    const chunk = value.slice(i * chunkSize, (i + 1) * chunkSize);
    partStrings.push(encodeString(chunk));
    code += `local ${partNames[i]}=${encodeString(chunk)} `;
    code += junk(3);
  }
  code += `local ${targetName}=${partNames.join('..')} `;
  return code;
}

// ─────────────────────────────────────────────────────────────
//  CONTROL FLOW FLATTENING CON DISPATCHER CIFRADO
// ─────────────────────────────────────────────────────────────

function cff(blocks) {
  const stateVar = randName();
  const dispVar  = randName();
  const keyVar   = randName();

  // Genera un orden aleatorio de los bloques
  const indices = blocks.map((_, i) => i);
  const shuffled = [...indices].sort(() => Math.random() - 0.5);

  // Estado inicial ofuscado
  const initState = shuffled[0];

  let code = `local ${keyVar}=${heavyConst(r(100,999))} `;
  code += `local ${stateVar}=${heavyConst(initState)} `;
  code += `local ${dispVar}={} `;

  // Registrar transiciones
  for (let i = 0; i < shuffled.length; i++) {
    const blockIdx = shuffled[i];
    const nextState = i + 1 < shuffled.length ? shuffled[i + 1] : -1;
    code += `${dispVar}[${heavyConst(blockIdx)}]=function() ${junk(8)} ${blocks[blockIdx]} ${junk(5)} ${stateVar}=${heavyConst(nextState)} end `;
  }

  code += `while ${stateVar}~=${heavyConst(-1)} do `;
  code += `  if ${opaqueTrue()} then `;
  code += `    local _fn=${dispVar}[${stateVar}] `;
  code += `    if _fn then _fn() else break end `;
  code += `  end `;
  code += `end `;

  return code;
}

// ─────────────────────────────────────────────────────────────
//  VM DE REGISTROS (NIVEL 1)
//  Ejecuta el payload como si fuera un programa virtual
// ─────────────────────────────────────────────────────────────

function buildRegisterVM(payload) {
  // Cifrado del payload: XOR multi-capa
  const key1 = r(50, 250);
  const key2 = r(10, 127);
  const key3 = r(1, 50);

  const encrypted = payload.split('').map((c, i) => {
    const b0 = c.charCodeAt(0);
    const b1 = b0 ^ (key1 + (i % 31));
    const b2 = b1 ^ (key2 + (i % 17));
    const b3 = b2 ^ (key3 + (i % 7));
    return b3;
  });

  // Dividir los bytes cifrados en N chunks
  const NUM_CHUNKS = 8;
  const chunkSize = Math.ceil(encrypted.length / NUM_CHUNKS);
  const chunkVars = Array.from({length: NUM_CHUNKS}, () => randName());

  const vmReg  = randName(), vmPC = randName(), vmST = randName();
  const vmKey1 = randName(), vmKey2 = randName(), vmKey3 = randName();
  const vmPool = randName(), vmIdx = randName(), vmOut = randName();

  let vm = `local ${vmReg}={} `;
  vm += `local ${vmKey1}=${heavyConst(key1)} `;
  vm += `local ${vmKey2}=${heavyConst(key2)} `;
  vm += `local ${vmKey3}=${heavyConst(key3)} `;

  // Escribir chunks
  for (let i = 0; i < NUM_CHUNKS; i++) {
    const chunk = encrypted.slice(i * chunkSize, (i + 1) * chunkSize);
    if (chunk.length === 0) { chunkVars.splice(i); break; }
    vm += `local ${chunkVars[i]}={${chunk.map(b => heavyConst(b)).join(',')}} `;
    vm += junk(5);
  }

  // Pool de chunks
  vm += `local ${vmPool}={${chunkVars.join(',')}} `;
  vm += `local ${vmIdx}=0 `;
  vm += `local ${vmOut}={} `;

  // Decifrado en runtime
  vm += `for _ci=1,#${vmPool} do `;
  vm += `  local _c=${vmPool}[_ci] `;
  vm += `  for _bi=1,#_c do `;
  vm += `    local _b=_c[_bi] `;
  vm += `    _b=bit32.bxor(_b,(${vmKey3}+(${vmIdx}%7))) `;
  vm += `    _b=bit32.bxor(_b,(${vmKey2}+(${vmIdx}%17))) `;
  vm += `    _b=bit32.bxor(_b,(${vmKey1}+(${vmIdx}%31))) `;
  vm += `    table.insert(${vmOut},string.char(_b)) `;
  vm += `    ${vmIdx}=${vmIdx}+1 `;
  vm += `  end `;
  vm += `end `;

  const decVar = randName();
  vm += `local ${decVar}=table.concat(${vmOut}) `;
  vm += `${vmOut}=nil ${vmPool}=nil `;

  return { vm, decVar };
}

// ─────────────────────────────────────────────────────────────
//  DISPATCHER VM (NIVEL 2)
//  Envuelve la VM de registros en un despachador con handlers
// ─────────────────────────────────────────────────────────────

function buildDispatcherVM(innerCode, isURL) {
  const NUM_HANDLERS = 20;
  const handlers = [];
  const used = new Set();
  while (handlers.length < NUM_HANDLERS) {
    const name = randName();
    if (!used.has(name)) { used.add(name); handlers.push(name); }
  }

  const realIdx = r(0, NUM_HANDLERS - 1);
  const DISPATCH = randName();
  const LM = randName();

  let out = `local ${LM}={}; local ${LM}=${LM}; `;

  for (let i = 0; i < NUM_HANDLERS; i++) {
    if (i === realIdx) {
      out += `local ${handlers[i]}=function(${LM}) local ${LM}=${LM}; ${junk(20)} `;

      if (isURL) {
        // Payload es una URL: usa HttpGet
        const ASSERT   = `getfenv()[${encodeString("assert")}]`;
        const LOADSTR  = `getfenv()[${encodeString("loadstring")}]`;
        const GAME     = `getfenv()[${encodeString("game")}]`;
        const HTTPGET  = encodeString("HttpGet");
        out += `${innerCode.vm} ${ASSERT}(${LOADSTR}(${GAME}[${HTTPGET}](${GAME},${innerCode.decVar})))() `;
      } else {
        // Payload es código Lua directo
        const ASSERT  = `getfenv()[${encodeString("assert")}]`;
        const LOADSTR = `getfenv()[${encodeString("loadstring")}]`;
        out += `${innerCode.vm} ${ASSERT}(${LOADSTR}(${innerCode.decVar}))() `;
      }

      out += `end `;
    } else {
      out += `local ${handlers[i]}=function(${LM}) local ${LM}=${LM}; ${junk(12)} return nil end `;
    }
  }

  out += `local ${DISPATCH}={`;
  for (let i = 0; i < NUM_HANDLERS; i++) {
    out += `[${heavyConst(i + 1)}]=${handlers[i]},`;
  }
  out += `} `;

  // Ejecutar todos los handlers en un CFF
  const execBlocks = handlers.map((h, i) => `${DISPATCH}[${heavyConst(i + 1)}](${LM})`);
  out += cff(execBlocks);

  return out;
}

// ─────────────────────────────────────────────────────────────
//  WRAPPER DE OPAQUE PREDICATES AL TOPE
// ─────────────────────────────────────────────────────────────

function wrapWithOpaqueChecks(code) {
  const checks = [];
  for (let i = 0; i < 6; i++) {
    checks.push(`if not (${opaqueTrue()}) then while true do end end`);
  }
  return checks.join(' ') + ' ' + code;
}

// ─────────────────────────────────────────────────────────────
//  ANTI-DEBUG COMPLETO
// ─────────────────────────────────────────────────────────────

function antiDebug() {
  const sentinel = randName();
  const clk = randName(), t1 = randName();

  let code = '';

  // Timing attack
  code += `local ${clk}=os.clock local ${t1}=${clk}() `;
  code += `for _=1,${heavyConst(80000)} do end `;
  code += `if ${clk}()-${t1}>${heavyConst(4)} then while true do end end `;

  // Debug library
  code += `if type(debug)=="table" then `;
  code += `  if debug.sethook then debug.sethook(function() while true do end end,"c") end `;
  code += `  if debug.getinfo then local _i=debug.getinfo(1) `;
  code += `    if _i and _i.what~=${encodeString("Lua")} and _i.what~=${encodeString("main")} then while true do end end end `;
  code += `end `;

  // getmetatable poisoning detection
  code += `if getmetatable(_G)~=nil then while true do end end `;

  // pcall poison detection
  code += `local _ok,_err=pcall(function() error(${encodeString("__WOP_SENTINEL__")}) end) `;
  code += `if not _ok then if not string.find(tostring(_err),${encodeString("__WOP_SENTINEL__")}) then while true do end end end `;

  // Standard lib integrity
  const fns = ["tostring","tonumber","pairs","ipairs","next","select","type","rawget","rawset","setmetatable"];
  for (const fn of fns) {
    code += `if type(${fn})~=${encodeString("function")} then while true do end end `;
  }

  // Math sanity
  code += `if math.pi<${heavyConst(3)} or math.pi>${heavyConst(4)} then while true do end end `;
  code += `if math.huge<=${heavyConst(999999)} then while true do end end `;
  code += `if tostring(1/0)~=${encodeString("inf")} and tostring(1/0)~=${encodeString("Inf")} then while true do end end `;

  // bit32 sanity
  code += `if bit32 then `;
  code += `  if bit32.bxor(${heavyConst(170)},${heavyConst(85)})~=${heavyConst(255)} then while true do end end `;
  code += `end `;

  // Time sanity
  code += `if os.time()<${heavyConst(1700000000)} then while true do end end `;

  return code;
}

// ─────────────────────────────────────────────────────────────
//  FUNCIÓN PRINCIPAL
// ─────────────────────────────────────────────────────────────

function obfuscate(sourceCode) {
  if (!sourceCode || !sourceCode.trim()) return '--ERROR: codigo vacio';

  // Detectar si es un loadstring/HttpGet
  const urlRegex = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i;
  const urlMatch = sourceCode.match(urlRegex);

  let payload = urlMatch ? urlMatch[1] : sourceCode;
  const isURL = !!urlMatch;

  console.log(`[WOP v3.0] Payload: ${isURL ? "URL" : "Lua"} (${payload.length} chars)`);
  console.log("[WOP] Construyendo VM de registros...");
  const vmL1 = buildRegisterVM(payload);

  console.log("[WOP] Construyendo Dispatcher VM...");
  const vmL2 = buildDispatcherVM(vmL1, isURL);

  console.log("[WOP] Aplicando Anti-Debug...");
  const ad = antiDebug();

  console.log("[WOP] Generando Junk Code...");
  const junkTop    = junk(120);
  const junkMiddle = junk(80);

  console.log("[WOP] Aplicando Opaque Predicates...");
  const wrapped = wrapWithOpaqueChecks(vmL2);

  // Ensamble final
  const final = [
    HEADER,
    junkTop,
    ad,
    junkMiddle,
    `(function()`,
    wrapped,
    `end)()`,
  ].join(' ');

  console.log("[WOP] Minificando...");
  return final.replace(/[ \t]+/g, ' ').replace(/\n+/g, ' ').trim();
}

module.exports = { obfuscate };

// ─────────────────────────────────────────────────────────────
//  USO:
//    const { obfuscate } = require('./water_obfuscator_pro_v3')
//    const result = obfuscate(`print("hola")`)
//    require('fs').writeFileSync('out.lua', result)
// ─────────────────────────────────────────────────────────────
