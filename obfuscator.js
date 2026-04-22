// ╔═══════════════════════════════════════════════════════════════╗
// ║  vvmer obfuscator v7 - CORREGIDO para Lua/Roblox             ║
// ║  • 18 VM machines (1 real + 17 decoys)                       ║
// ║  • +30% math obfuscation                                     ║
// ║  • Sin bit32, sin getfenv(0) problemático                    ║
// ╚═══════════════════════════════════════════════════════════════╝

const HEADER = `--[[ protected by vvmer v7 | discord:https://discord.gg/AAVKHtbxS ]]`

const IL_POOL = [
  "IIIIIIII1","vvvvvv1","vvvvvvvv2","vvvvvv3","IIlIlIlI1","lvlvlvlv2",
  "I1","l1","v1","v2","v3","II","ll","vv","I2","lI","Il","Iv","vI","lv",
  "vl","IlI","lIl","vIv","IvI","llII","IIll","vvII","IIvv","lIlI"
]
const H_POOL = [
  "KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD",
  "eA","fG","hJ","iK","rP","uN","oB","sT","dE","gF"
]

const gn  = () => IL_POOL[Math.floor(Math.random() * IL_POOL.length)] + Math.floor(Math.random() * 9999)
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a

// Ofuscación numérica mejorada (85% probabilidad, expresiones seguras)
function me(n) {
  if (Math.random() < 0.85) {
    const type = rnd(1, 3)
    if (type === 1) {
      const a = rnd(4, 28) * 2, b = rnd(2, 7)
      return `(${n + a * b}-${a}*${b})`
    } else if (type === 2) {
      const a = rnd(100, 500), b = rnd(3, 12)
      return `((${n}+${a})*${b}/${b}-${a})`
    } else {
      const a = rnd(10, 50), b = rnd(2, 9)
      return `(${n}*${a}/${a})`
    }
  }
  return String(n)
}

const sc = s => Array.from(s).map(c => me(c.charCodeAt(0))).join(',')

// Claves desde math.pi (válido en Lua)
const K1 = 51, K2 = 46, K3 = 49
const K1E = `string.byte(tostring(math.pi),1)`
const K2E = `string.byte(tostring(math.pi),2)`
const K3E = `string.byte(tostring(math.pi),3)`

function encB(b, i) {
  return (b + K1 + K2 * (i % 16) + K3) % 256
}

function makeOps() {
  const used = new Set()
  const p = () => { let v; do { v = rnd(1, 200) } while (used.has(v)); used.add(v); return v }
  return { PUSH: p(), CONCAT: p(), EXEC: p(), HTTP: p() }
}

function compile(payload, isUrl, ops) {
  const bytes = Array.from(payload).map(c => c.charCodeAt(0))
  const enc = bytes.map((b, i) => encB(b, i))
  const CHUNK = 8
  const chunks = []
  for (let i = 0; i < enc.length; i += CHUNK) chunks.push(enc.slice(i, i + CHUNK))
  const bc = [], cp = []
  for (const ch of chunks) { bc.push(ops.PUSH, cp.length); cp.push(ch) }
  bc.push(ops.CONCAT)
  bc.push(isUrl ? ops.HTTP : ops.EXEC)
  // Sin XOR con K1 para evitar bit32, solo guardamos así
  return { encBc: bc, cp }
}

// VM real (sin bit32, usando operadores aritméticos)
function buildRealVM(encBc, cp, ops) {
  const [K1V,K2V,K3V,ENV,SCF,TCF,LSF,ASSF,BCV,CPV,STK,IP,ROP,GPV,CO,CIV,CHV] =
    Array.from({ length: 17 }, gn)
  let c = `local ${K1V}=${K1E} local ${K2V}=${K2E} local ${K3V}=${K3E} `
  c += `local ${ENV}=_G `  // Usamos _G en lugar de getfenv(0)
  c += `local ${SCF}=string.char local ${TCF}=table.concat `
  c += `local ${LSF}=rawget(${ENV},${SCF}(${sc("loadstring")})) `
  c += `local ${ASSF}=rawget(${ENV},${SCF}(${sc("assert")})) `
  c += `if type(${LSF})~="function" then return end `
  c += `local ${BCV}={${encBc.map(me).join(',')}} `
  c += `local ${CPV}={${cp.map(ch => `{${ch.map(me).join(',')}}`).join(',')}} `
  c += `local ${CO}=coroutine.create(function() `
  c += `local ${STK}={} local ${IP}=1 `
  c += `while ${IP}<=#${BCV} do `
  c += `local ${ROP}=${BCV}[${IP}] `  // sin xor
  c += `if ${ROP}==${me(ops.PUSH)} then `
  c += `${IP}=${IP}+1 local ${CIV}=${BCV}[${IP}]+1 local ${CHV}=${CPV}[${CIV}] `
  c += `local _d={} `
  c += `for _j=1,#${CHV} do `
  c += `  local _b=(${CHV}[_j]-${K1V}-${K2V}*((_j-1)%16)-${K3V})%256 `
  c += `  _d[_j]=${SCF}(_b) `
  c += `end `
  c += `${STK}[#${STK}+1]=${TCF}(_d) _d=nil `
  c += `elseif ${ROP}==${me(ops.CONCAT)} then `
  c += `${STK}={${TCF}(${STK})} `
  c += `elseif ${ROP}==${me(ops.EXEC)} then `
  c += `local _s=${STK}[1] ${STK}=nil ${ASSF}(${LSF}(_s))() _s=nil `
  c += `elseif ${ROP}==${me(ops.HTTP)} then `
  c += `local _u=${STK}[1] ${STK}=nil local ${GPV}=rawget(${ENV},${SCF}(${sc("game")})) `
  c += `${ASSF}(${LSF}(${GPV}[${SCF}(${sc("HttpGet")})](${GPV},_u)))() _u=nil `
  c += `end `
  c += `${IP}=${IP}+1 `
  c += `end `
  c += `end) `
  c += `coroutine.resume(${CO}) ${CO}=nil `
  return c
}

// Decoy VM (sin bit32)
function buildDecoyVM() {
  const dOps = makeOps()
  let wK1 = rnd(30, 70); if (wK1 === 51) wK1 = 52
  const wK2 = rnd(20, 80), wK3 = rnd(20, 80)
  const gLen = rnd(12, 30)
  const gBc = [], gCp = []
  const gChunk = Array.from({ length: gLen }, () => rnd(0, 255))
  const CHUNK = 8
  const gChunks = []
  for (let i = 0; i < gChunk.length; i += CHUNK) gChunks.push(gChunk.slice(i, i + CHUNK))
  for (const ch of gChunks) { gBc.push(dOps.PUSH, gCp.length); gCp.push(ch) }
  gBc.push(dOps.CONCAT, dOps.EXEC)
  const encGBc = gBc  // sin xor
  const [K1V,ENV,SCF,TCF,LSF,ASSF,BCV,CPV,STK,IP,ROP,CO,CIV] =
    Array.from({ length: 13 }, gn)
  let c = `pcall(function() `
  c += `local ${K1V}=${me(wK1)} `
  c += `local ${ENV}=_G `
  c += `local ${SCF}=string.char local ${TCF}=table.concat `
  c += `local ${LSF}=rawget(${ENV},${SCF}(${sc("loadstring")})) `
  c += `local ${ASSF}=rawget(${ENV},${SCF}(${sc("assert")})) `
  c += `if type(${LSF})~="function" then return end `
  c += `local ${BCV}={${encGBc.map(me).join(',')}} `
  c += `local ${CPV}={${gCp.map(ch => `{${ch.map(me).join(',')}}`).join(',')}} `
  c += `local ${CO}=coroutine.create(function() `
  c += `local ${STK}={} local ${IP}=1 `
  c += `while ${IP}<=#${BCV} do `
  c += `local ${ROP}=${BCV}[${IP}] `
  c += `if ${ROP}==${me(dOps.PUSH)} then `
  c += `${IP}=${IP}+1 local ${CIV}=${BCV}[${IP}]+1 `
  c += `local _ch=${CPV}[${CIV}] local _d={} `
  c += `for _j=1,#_ch do `
  c += `  _d[_j]=${SCF}((_ch[_j]-${me(wK2)}*((_j-1)%16)-${me(wK3)})%256) `
  c += `end `
  c += `${STK}[#${STK}+1]=${TCF}(_d) _d=nil `
  c += `elseif ${ROP}==${me(dOps.CONCAT)} then `
  c += `${STK}={${TCF}(${STK})} `
  c += `elseif ${ROP}==${me(dOps.EXEC)} then `
  c += `local _s=${STK}[1] ${STK}=nil ${ASSF}(${LSF}(_s))() _s=nil `
  c += `end `
  c += `${IP}=${IP}+1 end `
  c += `end) `
  c += `coroutine.resume(${CO}) ${CO}=nil `
  c += `end) `
  return c
}

// Wrappers (sin cambios, funcionan)
function styleA(inner) {
  const count = rnd(2, 3), handlers = pickH(count), realIdx = rnd(0, count-1)
  const [D, ARG, KEY] = [gn(), gn(), gn()]
  let c = ''
  for (let i = 0; i < count; i++) {
    const body = i === realIdx ? inner : `return nil`
    c += `local ${handlers[i]}=function(${ARG}) ${body} end `
  }
  c += `local ${D}={${handlers.map((h,i)=>`[${me(i+1)}]=${h}`).join(',')}} `
  c += `local ${KEY}=${me(realIdx+1)} `
  c += `if ${D}[${KEY}] then ${D}[${KEY}]() end `
  return c
}
function styleB(inner) {
  const count = rnd(2, 4), realIdx = rnd(0, count-1)
  const S = gn(), base = rnd(200, 9000)
  let c = `local ${S}=${me(base)} while true do `
  for (let i = 0; i < count; i++) {
    c += `${i===0 ? 'if' : 'elseif'} ${S}==${me(base+i)} then `
    if (i === realIdx) { c += `${inner} ${S}=${me(base+count)} ` }
    else { c += `${S}=${me(base+i+1)} ` }
  }
  c += `elseif ${S}==${me(base+count)} then break end end `
  return c
}
function styleC(inner) {
  const count = rnd(2, 3), handlers = pickH(count), realIdx = rnd(0, count-1)
  const [ROUTER, KEY, OK, ER] = [gn(), gn(), gn(), gn()]
  let c = ''
  for (let i = 0; i < count; i++) {
    const body = i === realIdx ? inner : `return nil`
    c += `local ${handlers[i]}=function() ${body} end `
  }
  const tbl = handlers.map((h,i)=>`[${me(i+1)}]=${h}`).join(',')
  c += `local ${ROUTER}=function(${KEY}) local _t={${tbl}} if _t[${KEY}] then _t[${KEY}]() end end `
  c += `local ${OK},${ER}=pcall(${ROUTER},${me(realIdx+1)}) `
  c += `if not ${OK} then error(${ER}) end `
  return c
}
const STYLES = [styleA, styleB, styleC]
function buildLayers(code, n = 15) {
  let last = -1
  for (let i = 0; i < n; i++) {
    let pick; do { pick = rnd(0,2) } while (pick === last)
    last = pick
    code = STYLES[pick](code)
  }
  return code
}

function pickH(count) {
  const used = new Set(), res = []
  while (res.length < count) {
    const n = H_POOL[rnd(0, H_POOL.length - 1)] + rnd(10, 99)
    if (!used.has(n)) { used.add(n); res.push(n) }
  }
  return res
}

// EXPORT principal
function obfuscate(sourceCode) {
  if (!sourceCode?.trim()) return '--ERROR'
  const urlMatch = sourceCode.match(/loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i)
  const payload = urlMatch ? urlMatch[1] : sourceCode
  const isUrl = !!urlMatch
  const ops = makeOps()
  const { encBc, cp } = compile(payload, isUrl, ops)
  const realVM = buildRealVM(encBc, cp, ops)
  const decoys = []
  for (let i = 0; i < 17; i++) decoys.push(buildDecoyVM())
  let pool = [realVM, ...decoys]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = rnd(0, i);
    [pool[i], pool[j]] = [pool[j], pool[i]]
  }
  const layered = buildLayers(pool.join(' '), 15)
  return `${HEADER} ${layered}`.replace(/\s+/g, ' ').trim()
}

module.exports = { obfuscate }
