"use strict";

const HEADER = `--[[ this code it's protected by vvmer obfoscator (Stable Version) ]]`;

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

const gn  = () =>
  IL_POOL[Math.floor(Math.random() * IL_POOL.length)] +
  Math.floor(Math.random() * 99999);

const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

function pickH(count) {
  const used = new Set(), res = [];
  while (res.length < count) {
    const n = H_POOL[rnd(0, H_POOL.length - 1)] + rnd(10, 99);
    if (!used.has(n)) { used.add(n); res.push(n); }
  }
  return res;
}

function me(n) {
  const r = Math.random();
  if (r < 0.30) return String(n);
  if (r < 0.55) {
    const a = rnd(4, 28) * 2, b = rnd(2, 7);
    return `(${n + a * b}-${a}*${b})`;
  }
  const a = rnd(300, 3000), b = rnd(2, 9), c = rnd(100, 800), d = rnd(2, 8);
  return `(((((${n}+${a})*${b})/${b})-${a})+((${c}*${d})/${d})-${c})`;
}

function mba() {
  const n = Math.random() > 0.5 ? 1 : 2;
  const a = rnd(15, 70), b = rnd(8, 40);
  return `((${n}*${a}-${a})/(${b}+1)+${n})`;
}

const sc = s => Array.from(s).map(c => me(c.charCodeAt(0))).join(',');

const K1 = 51, K2 = 46, K3 = 49;
const K1E = `string.byte(tostring(math.pi),1)`;
const K2E = `string.byte(tostring(math.pi),2)`;
const K3E = `string.byte(tostring(math.pi),3)`;

function encByte(b, i, salt) {
  return (b + K1 + K2 * (i % 16) + K3 + i * salt) % 256;
}

function makeOps() {
  const used = new Set();
  const p = () => { let v; do { v = rnd(1, 200); } while (used.has(v)); used.add(v); return v; };
  return { PUSH: p(), CONCAT: p(), EXEC: p(), HTTP: p() };
}

function compile(payload, isUrl, ops, salt) {
  const bytes  = Array.from(payload).map(c => c.charCodeAt(0));
  const enc    = bytes.map((b, i) => encByte(b, i, salt));
  const CHUNK = 8, chunks = [], bc = [], cp = [];
  for (let i = 0; i < enc.length; i += CHUNK) chunks.push(enc.slice(i, i + CHUNK));
  for (const ch of chunks) { bc.push(ops.PUSH, cp.length); cp.push(ch); }
  bc.push(ops.CONCAT);
  bc.push(isUrl ? ops.HTTP : ops.EXEC);
  return { encBc: bc.map(b => (b ^ K1) & 0xFF), cp };
}

function buildVM(encBc, cp, ops, salt) {
  const [K1V,K2V,K3V,SLT,ENV,SCF,TCF,LSF,ASSF,BCV,CPV,
         STK,IP,ROP,GPV,CO,CIV,CHV,VJ] =
    Array.from({ length: 19 }, gn);

  let c = '';
  c += `local ${K1V}=${K1E} `;
  c += `local ${K2V}=${K2E} `;
  c += `local ${K3V}=${K3E} `;
  c += `local ${SLT}=${me(salt)} `;
  c += `local ${ENV}=getfenv(0) `;
  c += `local ${SCF}=string.char `;
  c += `local ${TCF}=table.concat `;
  c += `local ${LSF}=rawget(${ENV},${SCF}(${sc("loadstring")})) `;
  c += `local ${ASSF}=rawget(${ENV},${SCF}(${sc("assert")})) `;
  c += `local ${BCV}={${encBc.map(me).join(',')}} `;
  c += `local ${CPV}={${cp.map(ch => `{${ch.map(me).join(',')}}`).join(',')}} `;
  c += `local ${CO}=coroutine.create(function() `;
  c += `local ${STK}={} local ${IP}=1 `;
  c += `while ${IP}<=#${BCV} do `;
  c += `local ${ROP}=bit32.bxor(${BCV}[${IP}],${K1V}) `;
  c += `if ${ROP}==${me(ops.PUSH)} then `;
  c += `${IP}=${IP}+1 `;
  c += `local ${CIV}=bit32.bxor(${BCV}[${IP}],${K1V})+1 `;
  c += `local ${CHV}=${CPV}[${CIV}] `;
  c += `local _d={} `;
  c += `for ${VJ}=1,#${CHV} do `;
  c += `local _xi=${VJ}-1 `;
  c += `_d[${VJ}]=${SCF}((${CHV}[${VJ}]-${K1V}-${K2V}*((_xi)%16)-${K3V}-_xi*${SLT}+${me(1024)})%256) `;
  c += `end `;
  c += `${STK}[#${STK}+1]=${TCF}(_d) _d=nil `;
  c += `elseif ${ROP}==${me(ops.CONCAT)} then `;
  c += `${STK}={${TCF}(${STK})} `;
  c += `elseif ${ROP}==${me(ops.EXEC)} then `;
  c += `local _s=${STK}[1] ${STK}=nil `;
  c += `${ASSF}(${LSF}(_s))() _s=nil `;
  c += `elseif ${ROP}==${me(ops.HTTP)} then `;
  c += `local _u=${STK}[1] ${STK}=nil `;
  c += `local ${GPV}=rawget(${ENV},${SCF}(${sc("game")})) `;
  c += `${ASSF}(${LSF}(${GPV}[${SCF}(${sc("HttpGet")})](${GPV},_u)))() _u=nil `;
  c += `end `;
  c += `${IP}=${IP}+1 `;
  c += `end `;
  c += `end) `;
  c += `coroutine.resume(${CO}) ${CO}=nil `;
  return c;
}

// Eliminado: buildDecoy() ya no se usa para evitar crasheos por basura

function generateJunk(lines = 40) {
  let j = '';
  for (let i = 0; i < lines; i++) {
    const r = Math.random();
    if (r < 0.2) j += `local ${gn()}=${me(rnd(0, 999))} `;
    else if (r < 0.4) j += `local ${gn()}=string.char(${me(rnd(65,90))}) `;
  }
  return j;
}

function applyCFF(blocks) {
  const S = gn(), base = rnd(200, 9000);
  let lua = `local ${S}=${me(base)} while true do `;
  for (let i = 0; i < blocks.length; i++) {
    lua += `${i === 0 ? 'if' : 'elseif'} ${S}==${me(base+i)} then ${blocks[i]} ${S}=${me(base+i+1)} `;
  }
  lua += `elseif ${S}==${me(base+blocks.length)} then break end end `;
  return lua;
}

function styleA(inner) {
  const count = rnd(2,3), handlers = pickH(count), realIdx = rnd(0, count-1);
  const [D, ARG, KEY] = [gn(), gn(), gn()];
  let c = '';
  for (let i = 0; i < count; i++) {
    const body = i === realIdx ? inner : ` `;
    c += `local ${handlers[i]}=function(${ARG}) ${body} end `;
  }
  c += `local ${D}={${handlers.map((h,i)=>`[${me(i+1)}]=${h}`).join(',')}} `;
  c += `local ${KEY}=${me(realIdx+1)} `;
  c += `if ${D}[${KEY}] then ${D}[${KEY}]() end `;
  return c;
}

function styleB(inner) {
  const count = rnd(2,4), realIdx = rnd(0, count-1);
  const S = gn(), base = rnd(200, 9000);
  let c = `local ${S}=${me(base)} while true do `;
  for (let i = 0; i < count; i++) {
    c += `${i===0?'if':'elseif'} ${S}==${me(base+i)} then `;
    if (i === realIdx) { c += `${inner} ${S}=${me(base+count)} `; } 
    else { c += `${S}=${me(base+i+1)} `; }
  }
  c += `elseif ${S}==${me(base+count)} then break end end `;
  return c;
}

function styleC(inner) {
  const count = rnd(2,3), handlers = pickH(count), realIdx = rnd(0, count-1);
  const [ROUTER, KEY, OK, ER] = [gn(), gn(), gn(), gn()];
  let c = '';
  for (let i = 0; i < count; i++) {
    const body = i === realIdx ? inner : ` `;
    c += `local ${handlers[i]}=function() ${body} end `;
  }
  c += `local ${ROUTER}=function(${KEY}) local _t={${handlers.map((h,i)=>`[${me(i+1)}]=${h}`).join(',')}} if _t[${KEY}] then _t[${KEY}]() end end `;
  c += `pcall(${ROUTER},${me(realIdx+1)}) `;
  return c;
}

const STYLES = [styleA, styleB, styleC];

function buildLayers(code, n = 8) { // Reducido n para mayor estabilidad
  let last = -1;
  for (let i = 0; i < n; i++) {
    let pick; do { pick = rnd(0,2); } while (pick === last);
    last = pick;
    code = STYLES[pick](code);
  }
  return code;
}

// Anti-debug desactivado para evitar crasheos
function antiDebug() { return ""; }

// Guards desactivados para evitar cierres falsos positivos
function buildGuards() { return ""; }

function obfuscate(sourceCode) {
  if (!sourceCode?.trim()) return '--ERROR';

  const urlMatch = sourceCode.match(/loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i);
  const isUrl   = !!urlMatch;
  const payload = isUrl ? urlMatch[1] : sourceCode;

  const salt = rnd(1, 253);
  const ops = makeOps();
  const { encBc, cp } = compile(payload, isUrl, ops, salt);

  const realVM = buildVM(encBc, cp, ops, salt);
  
  // Se usa solo el VM real para asegurar que el script siempre funcione
  const wrapped = buildLayers(realVM, 5); 

  const junk1 = generateJunk(20);
  const result = `${HEADER} ${junk1} ${wrapped}`;
  return result.replace(/\s+/g, ' ').trim();
}

module.exports = { obfuscate };
