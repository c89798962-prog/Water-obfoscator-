// ╔══════════════════════════════════════════════════════════════════╗
// ║  vvmer obfuscator v5 — MoonSec/Luraph/IronBrew grade            ║
// ║  XOR waterfall(3 keys) · RC4 stream · 6 VM styles               ║
// ║  do-end scoping · no local overflow · clean Lua 5.1             ║
// ╚══════════════════════════════════════════════════════════════════╝

const HEADER = `--[[ vvmer ]]`

// ── Name pools — all look like visual garbage ─────────────────────────
const GLYPH_POOL = [
  "OOO0O","O0OO0","OO0OO","O00O0","0OO0O","00O0O","O0O0O","0O0OO",
  "OOOO0","0OOO0","O000O","0000O","OO00O","00OOO","O0000","0O000",
  "lIlII","IlIlI","lIIlI","IIlIl","lIlIl","IlIIl","lIIII","IIIlI",
  "llIlI","IlIll","lllIl","Illll","lIlll","IlIII","llllI","IIIll",
  "vVvVv","VvVvV","vVVvV","VVvVV","vvVvV","VvvVv","vVvvV","VvVVv",
  "WwWwW","wWwWw","WwWWw","wWWwW","WwwWw","wWwwW"
]
const SHORT_POOL = [
  "OP","BA","LA","BL","AL","OL","LO","AB","OA","BO","PO","PA",
  "LP","PL","BP","PB","AO","OB","AP","LB","OAB","BAL","LAB",
  "BLA","ALO","OBL","POA","APO","BOP","LAP","OAL","BPA","LOB"
]

const gn = () => {
  const pool = Math.random() < 0.5 ? GLYPH_POOL : SHORT_POOL
  const base = pool[Math.floor(Math.random() * pool.length)]
  const num  = (Math.floor(Math.random() * 99999) | 0).toString(36).toUpperCase()
  return base + num
}
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a

// ── Number obfuscation — ONLY arithmetic & bit32.bxor ────────────────
// NOTE: No anonymous functions here — those caused Lua parser failures
function me(n) {
  const r = Math.random()
  if (r < 0.35) return String(n)
  if (r < 0.68) {
    const a = rnd(3, 40) * 2, b = rnd(2, 9)
    return `(${n + a * b}-${a}*${b})`
  }
  const x = rnd(1, 0x7FFF)
  return `bit32.bxor(${n ^ x},${x})`
}

// String → individual char codes
const sc = s => Array.from(s).map(c => me(c.charCodeAt(0))).join(',')

// ── Junk code — wrapped in do-end so locals don't accumulate ─────────
function junk(n = 3) {
  let j = 'do '
  const OPS = [
    () => { const v = gn(); return `local ${v}=${me(rnd(1, 999))} ` },
    () => { const v = gn(); return `local ${v}=nil ` },
    () => `if false then end `,
    () => { const v = gn(), w = gn(); return `local ${v}=${me(rnd(1,50))} local ${w}=${v}+${me(rnd(1,10))} ` },
    () => { const v = gn(); return `local ${v}=not false ` },
    () => { const v = gn(); return `local ${v}="" ` },
    () => `if nil then end `,
    () => { const v = gn(), a = rnd(1,20), b = rnd(1,20); return `local ${v}=bit32.bxor(${me(a)},${me(b)}) ` },
  ]
  for (let i = 0; i < n; i++) j += OPS[rnd(0, OPS.length - 1)]()
  j += 'end '
  return j
}

// ── Runtime keys (3 independent, all unknown statically) ─────────────
// K1 = string.byte(tostring(math.pi),1)      = 51
// K2 = string.byte(tostring(math.huge),2)    = 110
// K3 = string.len(tostring(math.pi))         = 16
const RT_K1_EXPR = `string.byte(tostring(math.pi),1)`
const RT_K2_EXPR = `string.byte(tostring(math.huge),2)`
const RT_K3_EXPR = `string.len(tostring(math.pi))`
const RT_K1_VAL  = 51
const RT_K2_VAL  = 110
const RT_K3_VAL  = 16

// ── JS-side encryption ────────────────────────────────────────────────
function xorEncrypt(bytes, seed) {
  return bytes.map((b, i) =>
    b ^ ((seed + RT_K1_VAL + RT_K2_VAL * i + RT_K3_VAL * (i >> 2)) & 0xFF)
  )
}

function rc4Key(len) {
  return Array.from({ length: len }, () => rnd(1, 255))
}

function rc4Encrypt(bytes, key) {
  const S = Array.from({ length: 256 }, (_, i) => i)
  let j = 0
  for (let i = 0; i < 256; i++) {
    j = (j + S[i] + key[i % key.length]) & 0xFF
    ;[S[i], S[j]] = [S[j], S[i]]
  }
  let a = 0, b = 0
  return bytes.map(byte => {
    a = (a + 1) & 0xFF
    b = (b + S[a]) & 0xFF
    ;[S[a], S[b]] = [S[b], S[a]]
    return byte ^ S[(S[a] + S[b]) & 0xFF]
  })
}

// ════════════════════════════════════════════════════════════════════
// BUILD CORE — dual encrypted, scattered across fake slots
// Entire core wrapped in do-end → zero local leakage to outer scope
// ════════════════════════════════════════════════════════════════════
function buildCore(payload) {
  const seed   = rnd(32, 200)
  const rc4key = rc4Key(16)
  const seed2  = rnd(1, 200)
  const isUrl  = /^https?:\/\//.test(payload)

  // JS-side: encrypt in 3 passes
  let bytes = Array.from(payload).map(c => c.charCodeAt(0))
  bytes = xorEncrypt(bytes, seed)        // pass 1
  bytes = rc4Encrypt(bytes, rc4key)      // pass 2
  bytes = bytes.map((b, i) => b ^ ((seed2 + i * 7) & 0xFF))  // pass 3

  // Scatter real chunks among fake ones
  const CHUNK = rnd(5, 9)
  const realChunks = []
  for (let i = 0; i < bytes.length; i += CHUNK)
    realChunks.push(bytes.slice(i, i + CHUNK))

  const totalSlots = realChunks.length * 2 + rnd(4, 8)
  const vars = [], realAt = []
  let realPtr = 0, poolCode = ''

  for (let slot = 0; slot < totalSlots; slot++) {
    const v = gn(); vars.push(v)
    const need = realChunks.length - realPtr
    const left = totalSlots - slot
    const useReal = realPtr < realChunks.length &&
      (Math.random() > 0.45 || left <= need)
    if (useReal) {
      realAt.push(slot)
      poolCode += `local ${v}={${realChunks[realPtr++].map(me).join(',')}} `
    } else {
      const fl = rnd(4, 12)
      poolCode += `local ${v}={${Array.from({ length: fl }, () => me(rnd(0, 255))).join(',')}} `
    }
  }

  // Unique variable names for this core
  const [RK, K1, K2, K3, SD, SD2, POOL, ORD, BUF,
         SS, SJ, SA, SB, TOUT, OUT, ENV, LS, CHK, HS] =
    Array.from({ length: 19 }, gn)

  let code = `do `  // <-- wrap entire core: no local overflow

  code += poolCode
  code += `local ${RK}={${rc4key.map(me).join(',')}} `
  code += `local ${POOL}={${vars.join(',')}} `
  code += `local ${ORD}={${realAt.map(r => me(r + 1)).join(',')}} `
  code += `local ${K1}=${RT_K1_EXPR} `
  code += `local ${K2}=${RT_K2_EXPR} `
  code += `local ${K3}=${RT_K3_EXPR} `
  code += `local ${SD}=${me(seed)} `
  code += `local ${SD2}=${me(seed2)} `

  // Collect real bytes
  code += `local ${BUF}={} `
  code += `for _a=1,#${ORD} do for _b=1,#${POOL}[${ORD}[_a]] do `
  code += `${BUF}[#${BUF}+1]=${POOL}[${ORD}[_a]][_b] end end `

  // Decrypt pass 3: undo final XOR fold
  code += `for _a=1,#${BUF} do `
  code += `${BUF}[_a]=bit32.bxor(${BUF}[_a],(${SD2}+(_a-1)*7)%256) end `

  // Decrypt pass 2: RC4
  // _vrt = temp swap variable, unique per loop, won't collide with outer
  code += `local ${SS}={} for _a=0,255 do ${SS}[_a]=_a end `
  code += `local ${SJ}=0 `
  code += `for _a=0,255 do `
  code += `${SJ}=(${SJ}+${SS}[_a]+${RK}[(_a%16)+1])%256 `
  code += `local _c=${SS}[_a] ${SS}[_a]=${SS}[${SJ}] ${SS}[${SJ}]=_c `
  code += `end `
  code += `local ${SA}=0 local ${SB}=0 `
  code += `for _a=1,#${BUF} do `
  code += `${SA}=(${SA}+1)%256 `
  code += `${SB}=(${SB}+${SS}[${SA}])%256 `
  code += `local _c=${SS}[${SA}] ${SS}[${SA}]=${SS}[${SB}] ${SS}[${SB}]=_c `
  code += `${BUF}[_a]=bit32.bxor(${BUF}[_a],${SS}[(${SS}[${SA}]+${SS}[${SB}])%256]) end `

  // Decrypt pass 1: XOR waterfall with 3 runtime keys
  code += `for _a=1,#${BUF} do `
  code += `${BUF}[_a]=bit32.bxor(${BUF}[_a],(${SD}+${K1}+${K2}*(_a-1)+${K3}*math.floor((_a-1)/4))%256) end `

  // Assemble output string
  code += `local ${TOUT}={} for _a=1,#${BUF} do ${TOUT}[_a]=string.char(${BUF}[_a]) end `
  code += `local ${OUT}=table.concat(${TOUT}) ${BUF}=nil ${TOUT}=nil `

  // Get loadstring via char codes (anti-hook)
  code += `local ${ENV}=getfenv(0) `
  code += `local ${LS}=${ENV}[string.char(${sc("loadstring")})] `

  // loadstring integrity: hash tostring(loadstring), must be nonzero
  code += `local ${CHK}=tostring(${LS}) local ${HS}=0 `
  code += `for _a=1,#${CHK} do ${HS}=(${HS}*31+string.byte(${CHK},_a))%1073741824 end `
  code += `if ${HS}==0 then while true do end end `

  if (isUrl) {
    const G = gn()
    code += `local ${G}=${ENV}[string.char(${sc("game")})] `
    code += `${ENV}[string.char(${sc("assert")})](${LS}(${G}[string.char(${sc("HttpGet")})](${G},${OUT})))() `
  } else {
    code += `${ENV}[string.char(${sc("assert")})](${LS}(${OUT}))() `
  }

  code += `end ` // close do-end wrapper
  return code
}

// ════════════════════════════════════════════════════════════════════
// 6 VM WRAPPER STYLES
// CRITICAL: every style wraps its entire body in do-end
// This prevents Lua's 200 local limit from being hit across layers
// ════════════════════════════════════════════════════════════════════

// Style A: Table dispatch — real fn hidden among dummies
function styleA(inner) {
  const count   = rnd(3, 5)
  const hnames  = Array.from({ length: count }, gn)
  const realIdx = rnd(0, count - 1)
  const D = gn(), S = gn(), ARG = gn()
  let code = `do `
  for (let i = 0; i < count; i++) {
    const body = i === realIdx ? inner : junk(rnd(2, 4))
    code += `local ${hnames[i]}=function(${ARG}) ${body} end `
  }
  code += `local ${D}={${hnames.map((h, i) => `[${me(i + 1)}]=${h}`).join(',')}} `
  code += `local ${S}=${me(realIdx + 1)} `
  code += `if ${D}[${S}] then ${D}[${S}]() end `
  code += `end `
  return code
}

// Style B: while-CFF state machine with random step base
function styleB(inner) {
  const count   = rnd(3, 6)
  const realIdx = rnd(0, count - 1)
  const S       = gn()
  const base    = rnd(1000, 99999)
  let code = `do local ${S}=${me(base)} while true do `
  for (let i = 0; i < count; i++) {
    const kw   = i === 0 ? 'if' : 'elseif'
    const step = base + i
    code += `${kw} ${S}==${me(step)} then `
    if (i === realIdx) {
      code += `${inner} ${S}=${me(base + count)} `
    } else {
      code += `${junk(2)} ${S}=${me(base + i + 1)} `
    }
  }
  code += `elseif ${S}==${me(base + count)} then break end end end `
  return code
}

// Style C: pcall router through function table
function styleC(inner) {
  const count   = rnd(3, 5)
  const hnames  = Array.from({ length: count }, gn)
  const realIdx = rnd(0, count - 1)
  const [ROUTER, KEY, OK, ER] = Array.from({ length: 4 }, gn)
  let code = `do `
  for (let i = 0; i < count; i++) {
    const body = i === realIdx ? inner : junk(rnd(2, 4))
    code += `local ${hnames[i]}=function() ${body} end `
  }
  const tbl = hnames.map((h, i) => `[${me(i + 1)}]=${h}`).join(',')
  code += `local ${ROUTER}=function(${KEY}) local _rt={${tbl}} if _rt[${KEY}] then _rt[${KEY}]() end end `
  code += `local ${OK},${ER}=pcall(${ROUTER},${me(realIdx + 1)}) `
  code += `if not ${OK} then error(${ER}) end `
  code += `end `
  return code
}

// Style D: if-else waterfall with large random sentinel values (IronBrew style)
function styleD(inner) {
  const branches = rnd(4, 7)
  const realIdx  = rnd(0, branches - 1)
  const GATE     = gn()
  const used     = new Set()
  const vals     = []
  while (vals.length < branches) {
    const v = rnd(10000, 99999)
    if (!used.has(v)) { used.add(v); vals.push(v) }
  }
  let code = `do local ${GATE}=${me(vals[realIdx])} ` // FIX: was missing `let`
  for (let i = 0; i < branches; i++) {
    const kw = i === 0 ? 'if' : 'elseif'
    code += `${kw} ${GATE}==${me(vals[i])} then `
    if (i === realIdx) code += `${inner} `
    else               code += `${junk(2)} `
  }
  code += `end end `
  return code
}

// Style E: repeat-until CFF — indirect jumps (Luraph style)
function styleE(inner) {
  const steps   = rnd(3, 5)
  const realIdx = rnd(0, steps - 1)
  const [PC, DONE] = [gn(), gn()]
  const base = rnd(200, 9999)
  let code = `do local ${PC}=${me(base)} local ${DONE}=false repeat `
  for (let i = 0; i < steps; i++) {
    const kw   = i === 0 ? 'if' : 'elseif'
    const step = base + i
    code += `${kw} ${PC}==${me(step)} then `
    if (i === realIdx) {
      code += `${inner} ${PC}=${me(base + steps)} `
    } else {
      code += `${junk(2)} ${PC}=${me(base + i + 1)} `
    }
  }
  code += `elseif ${PC}==${me(base + steps)} then ${DONE}=true end until ${DONE} end `
  return code
}

// Style F: coroutine isolation wrapper (MoonSec style)
function styleF(inner) {
  const [FN, CO, OK, ER] = Array.from({ length: 4 }, gn)
  let code = `do `
  code += `local ${FN}=function() ${inner} end `
  code += `local ${CO}=coroutine.create(${FN}) `
  code += `local ${OK},${ER}=coroutine.resume(${CO}) `
  code += `if not ${OK} then error(${ER}) end `
  code += `end `
  return code
}

const STYLES = [styleA, styleB, styleC, styleD, styleE, styleF]

// Rotate — never same style twice in a row
function buildLayers(payload, layerCount = 29) {
  let vm = buildCore(payload)
  let lastStyle = -1
  for (let i = 0; i < layerCount; i++) {
    let pick
    do { pick = rnd(0, STYLES.length - 1) } while (pick === lastStyle)
    lastStyle = pick
    vm = STYLES[pick](vm)
  }
  return vm
}

// ── Anti-debug header ─────────────────────────────────────────────────
function antiDebug() {
  const [T, V, W, X] = Array.from({ length: 4 }, gn)
  return [
    `do local ${T}=os.clock() for _=1,100000 do end if os.clock()-${T}>4 then while true do end end end`,
    `if debug~=nil and rawget(debug,"getinfo")~=nil then while true do end end`,
    `if getmetatable(_G)~=nil then while true do end end`,
    `if type(loadstring)~="function" then while true do end end`,
    `if type(pcall)~="function" then while true do end end`,
    `do local ${V}=math.floor(math.pi*1000) if ${V}~=3141 then while true do end end end`,
    `do local ${W}=tostring(math.huge) if #${W}<3 then while true do end end end`,
    `if type(bit32)~="table" then while true do end end`,
    `if type(coroutine)~="table" then while true do end end`,
    `if type(rawget)~="function" or type(rawset)~="function" then while true do end end`,
    `do local ${X}=os.clock() for _=1,50000 do end if os.clock()-${X}>3 then while true do end end end`,
  ].join(' ')
}

// ── Main export ───────────────────────────────────────────────────────
function obfuscate(sourceCode, layerCount = 29) {
  if (!sourceCode || !sourceCode.trim()) return '--ERROR'

  let payload
  const urlMatch = sourceCode.match(
    /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i
  )
  payload = urlMatch ? urlMatch[1] : sourceCode

  const vm = buildLayers(payload, layerCount)
  return `${HEADER} ${antiDebug()} ${vm}`.replace(/\s+/g, ' ').trim()
}

module.exports = { obfuscate }
