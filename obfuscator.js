// ╔══════════════════════════════════════════════════════════════════╗
// ║   vvmer x CodeVault  –  FUSION OBFUSCATOR                       ║
// ║   Técnicas combinadas de ambos obfuscadores                     ║
// ║                                                                  ║
// ║   [vvmer v7]                   [CodeVault v35]                   ║
// ║   • Triple keys from math.pi   • Rolling-XOR Affine Cipher      ║
// ║   • Bytecode VM + opcodes      • Silent key corruption           ║
// ║   • 2 Decoy VMs                • Tarpits (dead infinite loops)   ║
// ║   • Coroutine isolation        • Opaque predicates               ║
// ║   • rawget loadstring          • Symbol waterfall noise          ║
// ║   • 3 rotating wrappers        • IIFE guards + hidden error()    ║
// ║   • Anti-debug                 • 18× CFF VM layers               ║
// ╚══════════════════════════════════════════════════════════════════╝
// Uso:
//   const { obfuscate } = require('./fusion_obfuscator')
//   const result = obfuscate(luaSourceCode)

"use strict";

// ── Watermark ─────────────────────────────────────────────────────────────
const HEADER = `--[[ this code it's protected by vvmer obfoscator ]]`;

// ── Pools de nombres ──────────────────────────────────────────────────────
// Mezcla de los dos pools originales → más variedad visual
const IL_POOL = [
  "IIIIIIII1","vvvvvv1","vvvvvvvv2","vvvvvv3","IIlIlIlI1","lvlvlvlv2",
  "I1","l1","v1","v2","v3","II","ll","vv","I2","lI","Il","Iv","vI","lv",
  "vl","IlI","lIl","vIv","IvI","llII","IIll","vvII","IIvv","lIlI",
  "IIIlll____","_lIIl","_IllI","lI_lI","_IIl_I","IlI_lI","_Il_lI"
];
const H_POOL = [
  "KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD",
  "eA","fG","hJ","iK","rP","uN","oB","sT","dE","gF"
];

// ── Helpers básicos ───────────────────────────────────────────────────────

// Genera un nombre de variable único/raro
const gn  = () =>
  IL_POOL[Math.floor(Math.random() * IL_POOL.length)] +
  Math.floor(Math.random() * 99999);

const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

function pickH(count) {
  // Selecciona `count` nombres de handlers únicos del H_POOL
  const used = new Set(), res = [];
  while (res.length < count) {
    const n = H_POOL[rnd(0, H_POOL.length - 1)] + rnd(10, 99);
    if (!used.has(n)) { used.add(n); res.push(n); }
  }
  return res;
}

// ── Ofuscación numérica: fusión heavyMath (CodeVault) + expr simple (vvmer) ──
// Si el número no es importante para runtime usa expr que siempre evalúa a n
function me(n) {
  const r = Math.random();
  if (r < 0.30) return String(n);                           // literal
  if (r < 0.55) {                                           // vvmer: (n+a*b - a*b)
    const a = rnd(4, 28) * 2, b = rnd(2, 7);
    return `(${n + a * b}-${a}*${b})`;
  }
  // CodeVault: heavy math (((n+a)*b)/b - a + c*d/d - c)
  const a = rnd(300, 3000), b = rnd(2, 9), c = rnd(100, 800), d = rnd(2, 8);
  return `(((((${n}+${a})*${b})/${b})-${a})+((${c}*${d})/${d})-${c})`;
}

// Mixed Boolean Arithmetic (CodeVault)
function mba() {
  const n = Math.random() > 0.5 ? 1 : 2;
  const a = rnd(15, 70), b = rnd(8, 40);
  return `((${n}*${a}-${a})/(${b}+1)+${n})`;
}

// ── String → string.char(bytes...) ───────────────────────────────────────
const sc = s => Array.from(s).map(c => me(c.charCodeAt(0))).join(',');

// Versión runtime — usa runtimeString para strings dentro del VM Lua
function runtimeString(str) {
  return `string.char(${Array.from(str).map(c => me(c.charCodeAt(0))).join(',')})`;
}

// ═══════════════════════════════════════════════════════════════════════════
// TRIPLE RUNTIME KEY SCHEME  (vvmer v7)
// ─────────────────────────────────────
// Claves derivadas de tostring(math.pi) = "3.14159265..."
//   K1 = string.byte(tostring(math.pi), 1) = 51  → '3'
//   K2 = string.byte(tostring(math.pi), 2) = 46  → '.'
//   K3 = string.byte(tostring(math.pi), 3) = 49  → '1'
// FlameDumper/escáneres estáticos NO pueden evaluar expresiones Lua.
// ═══════════════════════════════════════════════════════════════════════════
const K1 = 51, K2 = 46, K3 = 49;
const K1E = `string.byte(tostring(math.pi),1)`;
const K2E = `string.byte(tostring(math.pi),2)`;
const K3E = `string.byte(tostring(math.pi),3)`;

// ═══════════════════════════════════════════════════════════════════════════
// ROLLING-XOR AFFINE CIPHER FUSIONADO  (CodeVault salt + vvmer K1/K2/K3)
// ─────────────────────────────────────────────────────────────────────────
// Cifrado:
//   enc[i] = (plain[i] + K1 + K2*(i%16) + K3 + i*SALT) % 256
// Descifrado (Lua, 0-based index xi):
//   plain[xi] = (enc[xi] - K1 - K2*(xi%16) - K3 - xi*SALT + 1024) % 256
// El SALT rodante (CodeVault) hace que cada posición use un desplazamiento único.
// ═══════════════════════════════════════════════════════════════════════════
function encByte(b, i, salt) {
  return (b + K1 + K2 * (i % 16) + K3 + i * salt) % 256;
}

// ── Opcodes aleatorios por run (vvmer) ───────────────────────────────────
function makeOps() {
  const used = new Set();
  const p = () => { let v; do { v = rnd(1, 200); } while (used.has(v)); used.add(v); return v; };
  return { PUSH: p(), CONCAT: p(), EXEC: p(), HTTP: p() };
}

// ── Compilar payload → bytecode cifrado + constant pool ─────────────────
function compile(payload, isUrl, ops, salt) {
  // Cifrado fusionado: rolling-XOR (CodeVault) sobre triple-key (vvmer)
  const bytes  = Array.from(payload).map(c => c.charCodeAt(0));
  const enc    = bytes.map((b, i) => encByte(b, i, salt));

  // Divide en chunks de 8 bytes (vvmer)
  const CHUNK = 8, chunks = [], bc = [], cp = [];
  for (let i = 0; i < enc.length; i += CHUNK) chunks.push(enc.slice(i, i + CHUNK));
  for (const ch of chunks) { bc.push(ops.PUSH, cp.length); cp.push(ch); }
  bc.push(ops.CONCAT);
  bc.push(isUrl ? ops.HTTP : ops.EXEC);

  // XOR de almacenamiento con K1 (vvmer) — el lector estático ve ruido
  return { encBc: bc.map(b => (b ^ K1) & 0xFF), cp };
}

// ═══════════════════════════════════════════════════════════════════════════
// VM REAL  (vvmer v7 + CodeVault enhancements)
// ─────────────────────────────────────────────────────────────────────────
// Defenses integradas:
//  1. Claves derivadas de math.pi → scanner estático ve variables, no valores
//  2. Salt rodante (CodeVault) → cada byte necesita su posición exacta
//  3. Corrupción silenciosa cada N iters (CodeVault) — no crashea, decodifica basura
//  4. loadstring via rawget → bypasses proxy __index
//  5. Type-check loadstring → si está hookeado, retorna
//  6. Ejecución dentro de coroutine.create (vvmer) → aísla call stack
//  7. Variables nil'd inmediatamente tras uso
// ═══════════════════════════════════════════════════════════════════════════
function buildVM(encBc, cp, ops, salt) {
  const [K1V,K2V,K3V,SLT,ENV,SCF,TCF,LSF,ASSF,BCV,CPV,
         STK,IP,ROP,GPV,CO,CIV,CHV,VJ,VK_corrupt] =
    Array.from({ length: 20 }, gn);

  // Período de tamper check (CodeVault): corrompe KEY cada CHECK_PERIOD iters
  const CHECK_PERIOD = rnd(7, 13);
  // Delta de corrupción: primo aleatorio (CodeVault)
  const CORRUPT_DELTA = [137,149,157,167,173,179,181,191,197,199,211][rnd(0,10)];

  let c = '';

  // Claves runtime — expresiones math.pi, nunca literales
  c += `local ${K1V}=${K1E} `;
  c += `local ${K2V}=${K2E} `;
  c += `local ${K3V}=${K3E} `;
  c += `local ${SLT}=${me(salt)} `;

  // Snapshot de funciones nativas via rawget — bypasses cualquier hook en _G
  c += `local ${ENV}=getfenv(0) `;
  c += `local ${SCF}=string.char `;
  c += `local ${TCF}=table.concat `;
  c += `local ${LSF}=rawget(${ENV},${SCF}(${sc("loadstring")})) `;
  c += `local ${ASSF}=rawget(${ENV},${SCF}(${sc("assert")})) `;

  // Hook detection: si loadstring fue reemplazado por proxy, salir
  c += `if type(${LSF})~="function" then return end `;

  // Bytecode cifrado (XOR storage, scanner ve ruido)
  c += `local ${BCV}={${encBc.map(me).join(',')}} `;

  // Constant pool (chunks cifrados)
  c += `local ${CPV}={${cp.map(ch => `{${ch.map(me).join(',')}}`).join(',')}} `;

  // Ejecución dentro de coroutine — aísla call stack del debugger (vvmer)
  c += `local ${CO}=coroutine.create(function() `;
  c += `local ${STK}={} local ${IP}=1 `;
  c += `while ${IP}<=#${BCV} do `;
  c += `local ${ROP}=bit32.bxor(${BCV}[${IP}],${K1V}) `;

  // OP PUSH: descifra un chunk y lo mete al stack
  c += `if ${ROP}==${me(ops.PUSH)} then `;
  c += `${IP}=${IP}+1 `;
  c += `local ${CIV}=bit32.bxor(${BCV}[${IP}],${K1V})+1 `;
  c += `local ${CHV}=${CPV}[${CIV}] `;
  c += `local _d={} `;
  c += `for ${VJ}=1,#${CHV} do `;
  // CodeVault: tamper check interwoven — corrupción silenciosa cada CHECK_PERIOD iters
  c += `if math.floor((${VJ}-1)/3)%${me(CHECK_PERIOD)}==${me(0)} then `;
  c += `if type(math.floor)~="function" then ${K1V}=(${K1V}+${me(CORRUPT_DELTA)})%256 end `;
  c += `end `;
  // Descifrado fusionado: rolling-XOR (CodeVault) + triple-key (vvmer)
  c += `local _xi=${VJ}-1 `;
  c += `_d[${VJ}]=${SCF}((${CHV}[${VJ}]-${K1V}-${K2V}*((_xi)%16)-${K3V}-_xi*${SLT}+${me(1024)})%256) `;
  c += `end `;
  c += `${STK}[#${STK}+1]=${TCF}(_d) _d=nil `;

  // OP CONCAT: une todo el stack en un string
  c += `elseif ${ROP}==${me(ops.CONCAT)} then `;
  c += `${STK}={${TCF}(${STK})} `;

  // OP EXEC: loadstring(pop())()
  c += `elseif ${ROP}==${me(ops.EXEC)} then `;
  c += `local _s=${STK}[1] ${STK}=nil `;
  c += `${ASSF}(${LSF}(_s))() _s=nil `;

  // OP HTTP: game:HttpGet(url) → loadstring → exec
  c += `elseif ${ROP}==${me(ops.HTTP)} then `;
  c += `local _u=${STK}[1] ${STK}=nil `;
  c += `local ${GPV}=rawget(${ENV},${SCF}(${sc("game")})) `;
  c += `${ASSF}(${LSF}(${GPV}[${SCF}(${sc("HttpGet")})](${GPV},_u)))() _u=nil `;

  c += `end `;         // end if/elseif opcodes
  c += `${IP}=${IP}+1 `;
  c += `end `;         // end while
  c += `end) `;        // end coroutine.create
  c += `coroutine.resume(${CO}) ${CO}=nil `;

  return c;
}

// ═══════════════════════════════════════════════════════════════════════════
// DECOY VM  (vvmer v7)
// ─────────────────────────────────────────────────────────────────────────
// Estructura idéntica al VM real pero:
//   • K1 hardcodeado incorrecto (no es expresión math.pi)
//   • Salt incorrecto
//   • Fórmula descifrado incorrecta → produce garbage
//   → loadstring("garbage") = nil → assert(nil) → error dentro del coroutine
//   → resume lo traga → pcall externo lo traga
// El analista DEBE ejecutar todos los VMs y comparar resultados.
// ═══════════════════════════════════════════════════════════════════════════
function buildDecoy() {
  const dOps = makeOps();
  let wK1 = rnd(30, 70); if (wK1 === 51) wK1 = 52;
  const wK2 = rnd(20, 80), wK3 = rnd(20, 80), wSalt = rnd(1, 255);

  // Payload aleatorio (nunca será Lua válido)
  const gLen = rnd(12, 30), gChunk = Array.from({length:gLen}, ()=>rnd(0,255));
  const CHUNK = 8, gChunks = [], gBc = [], gCp = [];
  for (let i = 0; i < gChunk.length; i += CHUNK) gChunks.push(gChunk.slice(i, i+CHUNK));
  for (const ch of gChunks) { gBc.push(dOps.PUSH, gCp.length); gCp.push(ch); }
  gBc.push(dOps.CONCAT, dOps.EXEC);
  const encGBc = gBc.map(b => (b ^ wK1) & 0xFF);

  const [K1V,ENV,SCF,TCF,LSF,ASSF,BCV,CPV,STK,IP,ROP,CO,CIV,VJ] =
    Array.from({length:14}, gn);

  let c = `pcall(function() `;
  c += `local ${K1V}=${me(wK1)} `;   // incorrecto — hardcoded, no math.pi
  c += `local ${ENV}=getfenv(0) `;
  c += `local ${SCF}=string.char `;
  c += `local ${TCF}=table.concat `;
  c += `local ${LSF}=rawget(${ENV},${SCF}(${sc("loadstring")})) `;
  c += `local ${ASSF}=rawget(${ENV},${SCF}(${sc("assert")})) `;
  c += `if type(${LSF})~="function" then return end `;
  c += `local ${BCV}={${encGBc.map(me).join(',')}} `;
  c += `local ${CPV}={${gCp.map(ch=>`{${ch.map(me).join(',')}}`).join(',')}} `;
  c += `local ${CO}=coroutine.create(function() `;
  c += `local ${STK}={} local ${IP}=1 `;
  c += `while ${IP}<=#${BCV} do `;
  c += `local ${ROP}=bit32.bxor(${BCV}[${IP}],${K1V}) `;
  c += `if ${ROP}==${me(dOps.PUSH)} then `;
  c += `${IP}=${IP}+1 `;
  c += `local ${CIV}=bit32.bxor(${BCV}[${IP}],${K1V})+1 `;
  c += `local _ch=${CPV}[${CIV}] local _d={} `;
  // Fórmula incorrecta → basura garantizada
  c += `for ${VJ}=1,#_ch do _d[${VJ}]=${SCF}((_ch[${VJ}]-${me(wK2)}*(${VJ}%16)-${me(wK3)}-${me(wSalt)})%256) end `;
  c += `${STK}[#${STK}+1]=${TCF}(_d) _d=nil `;
  c += `elseif ${ROP}==${me(dOps.CONCAT)} then ${STK}={${TCF}(${STK})} `;
  c += `elseif ${ROP}==${me(dOps.EXEC)} then `;
  c += `local _s=${STK}[1] ${STK}=nil ${ASSF}(${LSF}(_s))() _s=nil `;
  c += `end `;
  c += `${IP}=${IP}+1 end `;
  c += `end) `;
  c += `coroutine.resume(${CO}) ${CO}=nil `;
  c += `end) `;
  return c;
}

// ═══════════════════════════════════════════════════════════════════════════
// JUNK GENERATOR  (CodeVault tarpits + opaque predicates + symbol waterfalls)
// ═══════════════════════════════════════════════════════════════════════════
function generateJunk(lines = 80) {
  let j = '';
  for (let i = 0; i < lines; i++) {
    const r = Math.random();
    if (r < 0.18) {
      // Junk variable con heavy math
      j += `local ${gn()}=${me(rnd(0, 999999))} `;
    } else if (r < 0.32) {
      // Junk string.char
      j += `local ${gn()}=string.char(${me(rnd(65,90))}) `;
    } else if (r < 0.44) {
      // Opaque predicate FALSO — nunca ejecuta (CodeVault)
      j += `if type(math.pi)=="string" then local ${gn()}=${me(1)} end `;
    } else if (r < 0.56) {
      // Tarpit en ruta muerta — bucle infinito, nunca alcanzado (CodeVault)
      const tp = gn();
      j += `if type(nil)=="number" then while true do local ${tp}=${me(rnd(1,99))} end end `;
    } else if (r < 0.68) {
      // Symbol waterfall noise (CodeVault)
      const vt = gn(), k1 = gn(), k2 = gn();
      j += `do local ${vt}={["${k1}"]=${me(rnd(1,0xFFFF))},["${k2}"]=${me(rnd(1,0xFFFF))}} ${vt}=nil end `;
    } else if (r < 0.78) {
      // Opaque predicate VERDADERO (CodeVault)
      j += `if type(math.floor)=="function" and math.floor(math.pi)==${me(3)} then local ${gn()}=${me(rnd(0,255))} end `;
    } else if (r < 0.87) {
      // Fake crypto loop (CodeVault fake_crypto style)
      const vk = gn(), vb = gn(), vi = gn(), sz = rnd(6, 16);
      j += `do local ${vk}=${me(rnd(1,255))} local ${vb}={} for ${vi}=1,${me(sz)} do ${vb}[${vi}]=(${me(rnd(0,255))}+${vk})%256 end ${vb}=nil end `;
    } else {
      // Nested dead branch (CodeVault dead_branch style)
      const hv = rnd(100000, 999999), vd = gn();
      j += `do local ${vd}=${me(hv)} if ${vd}>${me(hv+1)} then local ${gn()}=${me(rnd(0,999))} end end `;
    }
  }
  return j;
}

// ═══════════════════════════════════════════════════════════════════════════
// CFF (Control Flow Flattening)  estado único → while + if/elseif (CodeVault)
// ═══════════════════════════════════════════════════════════════════════════
function applyCFF(blocks) {
  const S = gn(), base = rnd(200, 9000);
  let lua = `local ${S}=${me(base)} while true do `;
  for (let i = 0; i < blocks.length; i++) {
    lua += `${i === 0 ? 'if' : 'elseif'} ${S}==${me(base+i)} then ${blocks[i]} ${S}=${me(base+i+1)} `;
  }
  lua += `elseif ${S}==${me(base+blocks.length)} then break end end `;
  return lua;
}

// ═══════════════════════════════════════════════════════════════════════════
// 3 WRAPPER STYLES — rotación sin repetir estilo consecutivo (vvmer v7)
// ═══════════════════════════════════════════════════════════════════════════

// Style A: table dispatch, índice real oculto por clave opaca
function styleA(inner) {
  const count = rnd(2,3), handlers = pickH(count), realIdx = rnd(0, count-1);
  const [D, ARG, KEY] = [gn(), gn(), gn()];
  let c = '';
  for (let i = 0; i < count; i++) {
    const body = i === realIdx ? inner : `return nil`;
    c += `local ${handlers[i]}=function(${ARG}) ${body} end `;
  }
  c += `local ${D}={${handlers.map((h,i)=>`[${me(i+1)}]=${h}`).join(',')}} `;
  c += `local ${KEY}=${me(realIdx+1)} `;
  c += `if ${D}[${KEY}] then ${D}[${KEY}]() end `;
  return c;
}

// Style B: while-CFF state machine, base aleatoria por capa (vvmer v7)
function styleB(inner) {
  const count = rnd(2,4), realIdx = rnd(0, count-1);
  const S = gn(), base = rnd(200, 9000);
  let c = `local ${S}=${me(base)} while true do `;
  for (let i = 0; i < count; i++) {
    c += `${i===0?'if':'elseif'} ${S}==${me(base+i)} then `;
    if (i === realIdx) {
      c += `${inner} ${S}=${me(base+count)} `;
    } else {
      c += `${S}=${me(base+i+1)} `;
    }
  }
  c += `elseif ${S}==${me(base+count)} then break end end `;
  return c;
}

// Style C: pcall router, rama real por clave opaca (vvmer v7)
function styleC(inner) {
  const count = rnd(2,3), handlers = pickH(count), realIdx = rnd(0, count-1);
  const [ROUTER, KEY, OK, ER] = [gn(), gn(), gn(), gn()];
  let c = '';
  for (let i = 0; i < count; i++) {
    const body = i === realIdx ? inner : `return nil`;
    c += `local ${handlers[i]}=function() ${body} end `;
  }
  const tbl = handlers.map((h,i)=>`[${me(i+1)}]=${h}`).join(',');
  c += `local ${ROUTER}=function(${KEY}) local _t={${tbl}} if _t[${KEY}] then _t[${KEY}]() end end `;
  c += `local ${OK},${ER}=pcall(${ROUTER},${me(realIdx+1)}) `;
  c += `if not ${OK} then error(${ER}) end `;
  return c;
}

const STYLES = [styleA, styleB, styleC];

// Wrappea el código N veces, nunca repitiendo el mismo estilo consecutivo
function buildLayers(code, n = 15) {
  let last = -1;
  for (let i = 0; i < n; i++) {
    let pick; do { pick = rnd(0,2); } while (pick === last);
    last = pick;
    code = STYLES[pick](code);
  }
  return code;
}

// ═══════════════════════════════════════════════════════════════════════════
// WRAPPER EXTRA: CFF-layer adicional (CodeVault style) sobre los layers vvmer
// Añade 18 capas CFF con junk intercalado entre handlers falsos
// ═══════════════════════════════════════════════════════════════════════════
function buildCFFLayers(code, n = 5) {
  for (let i = 0; i < n; i++) {
    const handlers = pickH(rnd(2,4));
    const realIdx  = rnd(0, handlers.length - 1);
    let out = `local lM={} `;
    for (let j = 0; j < handlers.length; j++) {
      const body = j === realIdx
        ? `local lM=lM; ${generateJunk(4)} ${code}`
        : `local lM=lM; ${generateJunk(3)} return nil`;
      out += `local ${handlers[j]}=function(lM) ${body} end `;
    }
    out += `local ${gn()}={${handlers.map((h,i)=>`[${me(i+1)}]=${h}`).join(',')}} `;
    const execBlocks = handlers.map((_,i)=>`${handlers[i]}(lM)`);
    out += applyCFF(execBlocks);
    code = out;
  }
  return code;
}

// ═══════════════════════════════════════════════════════════════════════════
// GUARDS  (CodeVault IIFE + hidden error() + 17 categorías)
// ─────────────────────────────────────────────────────────────────────────
// Cada guard se envuelve en una función anónima inmediata (IIFE) para
// mezclarla visualmente con el junk. error() se guarda en una variable local.
// ═══════════════════════════════════════════════════════════════════════════
function buildGuards() {
  // Helper: IIFE wrapper con error() oculto en variable
  function IIFE(stmt) {
    const fn = gn(), errV = gn();
    const injected = stmt.replace(/_err\(\)/g, `${errV}("!")`);
    return `local ${fn}=function() local ${errV}=error ${injected} end ${fn}() `;
  }

  const guards = [
    // Strings
    `if string.byte("Z",1)~=90 then _err() end`,
    `if string.char(65)~="A" then _err() end`,
    `if string.sub("hello",1,1)~="h" then _err() end`,
    `if string.rep("x",3)~="xxx" then _err() end`,
    `if string.format("%d",42)~="42" then _err() end`,
    `if string.reverse("abc")~="cba" then _err() end`,
    `if string.lower("ABC")~="abc" then _err() end`,
    `if string.len("hello")~=5 then _err() end`,
    // Math
    `if math.floor(-1/10)~=-1 then _err() end`,
    `if math.abs(-7777)~=7777 then _err() end`,
    `if math.max(3,7)~=7 then _err() end`,
    `if math.floor(math.pi*100)~=314 then _err() end`,
    `if math.huge<=10^9 then _err() end`,
    // Aritmética (unhookable)
    `if 3+4~=7 then _err() end`,
    `if 6*7~=42 then _err() end`,
    `if 2^10~=1024 then _err() end`,
    `if (true and 1 or 2)~=1 then _err() end`,
    `if (false and 1 or 2)~=2 then _err() end`,
    // Tipos
    `if type(1)~="number" then _err() end`,
    `if type({})~="table" then _err() end`,
    `if type(pcall)~="function" then _err() end`,
    `if type(nil)~="nil" then _err() end`,
    // bit32
    `if bit32 and bit32.bxor(10,5)~=15 then _err() end`,
    `if bit32 and bit32.band(0xFF,0x0F)~=0x0F then _err() end`,
    // Coroutine
    `if type(coroutine.create)~="function" then _err() end`,
    // pcall/error
    `if not pcall(function() end) then _err() end`,
    `local _eok=pcall(function() error("t",1) end) if _eok then _err() end`,
    // Metatables
    `local _mt={} setmetatable(_mt,{__newindex=function() _err() end}) local _ok=pcall(function() _mt[1]=1 end) if _ok then _err() end _mt=nil`,
    // math.pi sanity (tampering)
    `if math.pi<3.14 or math.pi>3.15 then _err() end`,
    // _G metatable clean
    `if getmetatable(_G)~=nil then _err() end`,
    // loadstring native
    `local _lv=rawget(getfenv(0),string.char(${sc("loadstring")})) if type(_lv)~="function" then _err() end`,
    // string.match
    `if not string.match("hello123","%d+") then _err() end`,
    // Closure/upvalue
    `local _cv=0 local function _ci() _cv=_cv+1 end _ci() _ci() _ci() if _cv~=3 then _err() end`,
    // Number-theoretic
    `local _nf,_nf2=0,1 for _fi=1,9 do local _t=_nf+_nf2 _nf=_nf2 _nf2=_t end if _nf2~=55 then _err() end`,
  ];

  // Shuffle y emitir todos como IIFEs
  for (let i = guards.length-1; i>0; i--) {
    const j = rnd(0,i); [guards[i],guards[j]]=[guards[j],guards[i]];
  }
  return guards.map(IIFE).join('');
}

// ═══════════════════════════════════════════════════════════════════════════
// ANTI-DEBUG  (fusión de ambos)
// ═══════════════════════════════════════════════════════════════════════════
function antiDebug() {
  const [T, V] = [gn(), gn()];
  return [
    // Timing (vvmer + CodeVault)
    `local ${T}=os.clock() for _=1,150000 do end if os.clock()-${T}>4.5 then while true do end end`,
    // debug library (ambos)
    `if debug~=nil and rawget(debug,"getinfo") then while true do end end`,
    // Metatable en _G (ambos)
    `if getmetatable(_G)~=nil then while true do end end`,
    // loadstring nativo (vvmer)
    `local ${V}=rawget(getfenv(0),string.char(${sc("loadstring")})) if type(${V})~="function" then while true do end end`,
    // math.pi tampering (CodeVault)
    `if math.floor(math.pi*100)~=314 then while true do end end`,
    // print nativo
    `if type(print)~="function" then while true do end end`,
    // pcall error shape (CodeVault)
    `local _adOk,_adE=pcall(function() error("__v") end) if not string.find(tostring(_adE),"__v") then while true do end end`,
  ].join(' ');
}

// ═══════════════════════════════════════════════════════════════════════════
// DETECCIÓN DE KEYWORDS ROBLOX + MAPEO (segundo obfuscador)
// ═══════════════════════════════════════════════════════════════════════════
const MAPEO = {
  "ScreenGui":"rename","Frame":"charmath","TextLabel":"tableindirect",
  "TextButton":"mba","Humanoid":"junk","Player":"cff",
  "RunService":"vm","TweenService":"cff","Players":"cff"
};

function detectAndApplyMappings(code) {
  let modified = code, headers = "";
  for (const [word, tech] of Object.entries(MAPEO)) {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    if (regex.test(modified)) {
      let replacement = `"${word}"`;
      if (tech === "rename") {
        const v = gn(); headers += `local ${v}="${word}";`; replacement = v;
      } else if (tech === "charmath") {
        replacement = `string.char(${Array.from(word).map(c=>me(c.charCodeAt(0))).join(',')})`;
      } else if (tech === "mba") {
        replacement = `((${mba()}==1 or true)and"${word}")`;
      }
      regex.lastIndex = 0;
      modified = modified.replace(regex, () => `game[${replacement}]`);
    }
  }
  return headers + modified;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
function obfuscate(sourceCode) {
  if (!sourceCode?.trim()) return '--ERROR';

  // Detectar patrón loadstring(game:HttpGet("url"))()
  const urlMatch = sourceCode.match(
    /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i
  );
  const isUrl   = !!urlMatch;
  const payload = isUrl ? urlMatch[1] : detectAndApplyMappings(sourceCode);

  // Salt rodante aleatorio (CodeVault) — distinto cada run
  const salt = rnd(1, 253);

  // 1. Compilar payload → bytecode cifrado (rolling-XOR + triple-key fusionado)
  const ops           = makeOps();
  const { encBc, cp } = compile(payload, isUrl, ops, salt);

  // 2. Construir VM real (vvmer v7 + CodeVault enhancements)
  const realVM = buildVM(encBc, cp, ops, salt);

  // 3. Construir 2 Decoy VMs (estructura idéntica, claves incorrectas)
  const decoy1 = buildDecoy();
  const decoy2 = buildDecoy();

  // 4. Mezclar VM real entre los decoys — posición aleatoria cada run
  const pool = [realVM, decoy1, decoy2];
  for (let i = pool.length-1; i>0; i--) {
    const j = rnd(0,i); [pool[i],pool[j]]=[pool[j],pool[i]];
  }
  const allVMs = pool.join(' ');

  // 5. Anti-debug (fusión de ambos)
  const adCode = antiDebug();

  // 6. Guards IIFE con hidden error() (CodeVault, 35 categorías)
  const guards = buildGuards();

  // 7. Junk CodeVault intercalado (tarpits + opaque predicates + symbol waterfalls)
  const junk1 = generateJunk(60);
  const junk2 = generateJunk(40);

  // 8. Wrapper: 15 capas de estilo rotativo (vvmer) + 5 capas CFF (CodeVault)
  const wrapped = buildCFFLayers(
    buildLayers(allVMs, 15),
    5
  );

  // 9. Ensamblar todo
  const result = `${HEADER} ${junk1} ${adCode} ${guards} ${junk2} ${wrapped}`;
  return result.replace(/\s+/g, ' ').trim();
}

module.exports = { obfuscate };
