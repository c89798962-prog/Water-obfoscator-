// ═══════════════════════════════════════════════════════════════════════════
//  Advanced Lua Obfuscator - Hybrid VM + CFF + Rolling XOR + Decoys
//  Combina lo mejor de vvmer v7 y Code Vault
// ═══════════════════════════════════════════════════════════════════════════

const HEADER = `--[[ protected by HybridObf v1 | discord:https://discord.gg/AAVKHtbxS ]]`

// ──────────────────────────────────────────────────────────────────────────
//  Pools y utilidades
// ──────────────────────────────────────────────────────────────────────────
const IL_POOL = [
  "IIIIIIII1","vvvvvv1","vvvvvvvv2","vvvvvv3","IIlIlIlI1","lvlvlvlv2",
  "I1","l1","v1","v2","v3","II","ll","vv","I2","lI","Il","Iv","vI","lv",
  "vl","IlI","lIl","vIv","IvI","llII","IIll","vvII","IIvv","lIlI"
]
const H_POOL = ["KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD","eA","fG","hJ","iK"]

const gn  = () => IL_POOL[Math.floor(Math.random() * IL_POOL.length)] + Math.floor(Math.random() * 9999)
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a

function pickH(count) {
  const used = new Set(), res = []
  while (res.length < count) {
    const n = H_POOL[rnd(0, H_POOL.length - 1)] + rnd(10, 99)
    if (!used.has(n)) { used.add(n); res.push(n) }
  }
  return res
}

// Ofuscación numérica: a veces expresión redundante
function me(n) {
  if (Math.random() < 0.55) return String(n)
  const a = rnd(4, 28) * 2, b = rnd(2, 7)
  return `(${n + a * b}-${a}*${b})`
}

// String → string.char con códigos ofuscados
const sc = s => Array.from(s).map(c => me(c.charCodeAt(0))).join(',')

// ──────────────────────────────────────────────────────────────────────────
//  Claves runtime derivadas de math.pi (igual que vvmer)
// ──────────────────────────────────────────────────────────────────────────
const K1 = 51   // '3'
const K2 = 46   // '.'
const K3 = 49   // '1'
const K1E = `string.byte(tostring(math.pi),1)`
const K2E = `string.byte(tostring(math.pi),2)`
const K3E = `string.byte(tostring(math.pi),3)`

// ──────────────────────────────────────────────────────────────────────────
//  Cifrado Rolling-XOR Affine (del segundo ofuscador) combinado con K1,K2,K3
//  Enc[ i ] = (plainByte + K1 + K2*(i%16) + K3 + salt*(i%8)) % 256
//  donde salt es un valor aleatorio que se pasa como constante en el VM.
//  Esto añade variabilidad por chunk.
// ──────────────────────────────────────────────────────────────────────────
function rollingEncrypt(plainBytes, salt) {
  return plainBytes.map((b, i) => (b + K1 + K2 * (i % 16) + K3 + salt * (i % 8)) % 256)
}

// Genera opcodes únicos por ejecución
function makeOps() {
  const used = new Set()
  const p = () => { let v; do { v = rnd(1, 200) } while (used.has(v)); used.add(v); return v }
  return { PUSH: p(), CONCAT: p(), EXEC: p(), HTTP: p() }
}

// Compila payload a bytecode cifrado (rolling + XOR con K1 para almacenar)
function compile(payload, isUrl, ops) {
  const salt = rnd(7, 63)   // salt aleatorio para rolling
  const bytes = Array.from(payload).map(c => c.charCodeAt(0))
  const enc = rollingEncrypt(bytes, salt)

  const CHUNK = 8
  const chunks = []
  for (let i = 0; i < enc.length; i += CHUNK) chunks.push(enc.slice(i, i + CHUNK))

  const bc = [], cp = []
  for (const ch of chunks) { bc.push(ops.PUSH, cp.length); cp.push(ch) }
  bc.push(ops.CONCAT)
  bc.push(isUrl ? ops.HTTP : ops.EXEC)

  // XOR de todo el bytecode con K1 para ocultarlo estáticamente
  const encBc = bc.map(b => (b ^ K1) & 0xFF)
  return { encBc, cp, salt }
}

// ──────────────────────────────────────────────────────────────────────────
//  Constructor de la VM REAL (con rolling decrypt y math.pi)
// ──────────────────────────────────────────────────────────────────────────
function buildRealVM(encBc, cp, ops, salt) {
  const [K1V,K2V,K3V,ENV,SCF,TCF,LSF,ASSF,BCV,CPV,STK,IP,ROP,GPV,CO,CIV,CHV,SLTV] =
    Array.from({ length: 18 }, gn)

  let c = ''
  c += `local ${K1V}=${K1E} `
  c += `local ${K2V}=${K2E} `
  c += `local ${K3V}=${K3E} `
  c += `local ${SLTV}=${me(salt)} `   // salt para rolling

  c += `local ${ENV}=getfenv(0) `
  c += `local ${SCF}=string.char `
  c += `local ${TCF}=table.concat `
  c += `local ${LSF}=rawget(${ENV},${SCF}(${sc("loadstring")})) `
  c += `local ${ASSF}=rawget(${ENV},${SCF}(${sc("assert")})) `
  c += `if type(${LSF})~="function" then return end `

  c += `local ${BCV}={${encBc.map(me).join(',')}} `
  c += `local ${CPV}={${cp.map(ch => `{${ch.map(me).join(',')}}`).join(',')}} `

  c += `local ${CO}=coroutine.create(function() `
  c += `local ${STK}={} local ${IP}=1 `
  c += `local _gIdx=0 `   // índice global para rolling
  c += `while ${IP}<=#${BCV} do `
  c += `local ${ROP}=bit32.bxor(${BCV}[${IP}],${K1V}) `

  // OP PUSH: descifra un chunk con rolling + K1,K2,K3
  c += `if ${ROP}==${me(ops.PUSH)} then `
  c += `${IP}=${IP}+1 `
  c += `local ${CIV}=bit32.bxor(${BCV}[${IP}],${K1V})+1 `
  c += `local ${CHV}=${CPV}[${CIV}] `
  c += `local _d={} `
  c += `for _j=1,#${CHV} do `
  c += `  local _b=(${CHV}[_j]-${K1V}-${K2V}*((_gIdx)%16)-${K3V}-${SLTV}*((_gIdx)%8))%256 `
  c += `  _d[_j]=${SCF}(_b) `
  c += `  _gIdx=_gIdx+1 `
  c += `end `
  c += `${STK}[#${STK}+1]=${TCF}(_d) _d=nil `

  // OP CONCAT
  c += `elseif ${ROP}==${me(ops.CONCAT)} then `
  c += `${STK}={${TCF}(${STK})} `

  // OP EXEC
  c += `elseif ${ROP}==${me(ops.EXEC)} then `
  c += `local _s=${STK}[1] ${STK}=nil `
  c += `${ASSF}(${LSF}(_s))() _s=nil `

  // OP HTTP
  c += `elseif ${ROP}==${me(ops.HTTP)} then `
  c += `local _u=${STK}[1] ${STK}=nil `
  c += `local ${GPV}=rawget(${ENV},${SCF}(${sc("game")})) `
  c += `${ASSF}(${LSF}(${GPV}[${SCF}(${sc("HttpGet")})](${GPV},_u)))() _u=nil `

  c += `end `
  c += `${IP}=${IP}+1 `
  c += `end `
  c += `end) `
  c += `coroutine.resume(${CO}) ${CO}=nil `
  return c
}

// ──────────────────────────────────────────────────────────────────────────
//  DECOY VM (claves incorrectas, estructura idéntica)
// ──────────────────────────────────────────────────────────────────────────
function buildDecoyVM() {
  const dOps = makeOps()
  let wK1 = rnd(30, 70); if (wK1 === 51) wK1 = 52
  const wK2 = rnd(20, 80), wK3 = rnd(20, 80), wSalt = rnd(7, 63)

  const gLen = rnd(12, 30)
  const gChunk = Array.from({ length: gLen }, () => rnd(0, 255))
  const CHUNK = 8
  const gChunks = []
  for (let i = 0; i < gChunk.length; i += CHUNK) gChunks.push(gChunk.slice(i, i + CHUNK))
  const gBc = [], gCp = []
  for (const ch of gChunks) { gBc.push(dOps.PUSH, gCp.length); gCp.push(ch) }
  gBc.push(dOps.CONCAT, dOps.EXEC)
  const encGBc = gBc.map(b => (b ^ wK1) & 0xFF)

  const [K1V,ENV,SCF,TCF,LSF,ASSF,BCV,CPV,STK,IP,ROP,CO,CIV,SLTV] =
    Array.from({ length: 14 }, gn)

  let c = `pcall(function() `
  c += `local ${K1V}=${me(wK1)} `
  c += `local ${SLTV}=${me(wSalt)} `
  c += `local ${ENV}=getfenv(0) `
  c += `local ${SCF}=string.char `
  c += `local ${TCF}=table.concat `
  c += `local ${LSF}=rawget(${ENV},${SCF}(${sc("loadstring")})) `
  c += `local ${ASSF}=rawget(${ENV},${SCF}(${sc("assert")})) `
  c += `if type(${LSF})~="function" then return end `
  c += `local ${BCV}={${encGBc.map(me).join(',')}} `
  c += `local ${CPV}={${gCp.map(ch => `{${ch.map(me).join(',')}}`).join(',')}} `
  c += `local ${CO}=coroutine.create(function() `
  c += `local ${STK}={} local ${IP}=1 local _gIdx=0 `
  c += `while ${IP}<=#${BCV} do `
  c += `local ${ROP}=bit32.bxor(${BCV}[${IP}],${K1V}) `
  c += `if ${ROP}==${me(dOps.PUSH)} then `
  c += `${IP}=${IP}+1 `
  c += `local ${CIV}=bit32.bxor(${BCV}[${IP}],${K1V})+1 `
  c += `local _ch=${CPV}[${CIV}] local _d={} `
  // Fórmula errónea a propósito (usa wK2, wK3, wSalt pero sin K1 correcto)
  c += `for _j=1,#_ch do `
  c += `  _d[_j]=${SCF}((_ch[_j]-${me(wK2)}-${me(wK3)}*((_gIdx)%16)-${me(wSalt)}*((_gIdx)%8))%256) `
  c += `  _gIdx=_gIdx+1 `
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

// ──────────────────────────────────────────────────────────────────────────
//  WRAPPERS: 3 estilos rotativos (CFF, Table Dispatch, pcall router)
// ──────────────────────────────────────────────────────────────────────────
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

// ──────────────────────────────────────────────────────────────────────────
//  Anti-debug y tamper checks (combinado)
// ──────────────────────────────────────────────────────────────────────────
function antiDebug() {
  const [T, V] = [gn(), gn()]
  const guards = [
    `local ${T}=os.clock() for _=1,60000 do end if os.clock()-${T}>3 then while true do end end`,
    `if debug~=nil and rawget(debug,"getinfo") then while true do end end`,
    `if getmetatable(_G)~=nil then while true do end end`,
    `local ${V}=rawget(getfenv(0),string.char(${sc("loadstring")})) if type(${V})~="function" then while true do end end`,
    `if math.floor(math.pi*100)~=314 then while true do end end`,
    // Tamper checks extra (IIFE style)
    `(function() local _err=error if string.byte("Z",1)~=90 then _err("!") end end)()`,
    `(function() local _err=error if math.floor(-1/10)~=-1 then _err("!") end end)()`,
    `(function() local _err=error if (true and 1 or 2)~=1 then _err("!") end end)()`,
    `(function() local _err=error if type(pcall)~="function" then _err("!") end end)()`
  ]
  return guards.join(' ')
}

// Junk code ligero
function junk(lines = 30) {
  let j = ''
  for (let i = 0; i < lines; i++) {
    const r = Math.random()
    if (r < 0.3) j += `local ${gn()}=${me(rnd(1,999))} `
    else if (r < 0.6) j += `local ${gn()}=string.char(${me(rnd(65,90))}) `
    else j += `if type(nil)=="number" then local _=1 end `  // tarpit muerto
  }
  return j
}

// ──────────────────────────────────────────────────────────────────────────
//  Función principal de ofuscación
// ──────────────────────────────────────────────────────────────────────────
function obfuscate(sourceCode) {
  if (!sourceCode || !sourceCode.trim()) return '--ERROR'

  // Detectar si es HttpGet
  const urlMatch = sourceCode.match(
    /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i
  )
  const payload = urlMatch ? urlMatch[1] : sourceCode
  const isUrl = !!urlMatch

  const ops = makeOps()
  const { encBc, cp, salt } = compile(payload, isUrl, ops)
  const realVM = buildRealVM(encBc, cp, ops, salt)

  const decoy1 = buildDecoyVM()
  const decoy2 = buildDecoyVM()

  // Mezclar real con decoys
  let pool = [realVM, decoy1, decoy2]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = rnd(0, i);
    [pool[i], pool[j]] = [pool[j], pool[i]]
  }

  let finalCode = pool.join(' ')
  finalCode = buildLayers(finalCode, 15)
  finalCode = junk(40) + antiDebug() + finalCode

  return `${HEADER} ${finalCode}`.replace(/\s+/g, ' ').trim()
}

module.exports = { obfuscate }
