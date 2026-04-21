// ╔══════════════════════════════════════════════════════════════════╗
// ║  vvmer obfuscator v5 — MoonSec/Luraph/IronBrew grade            ║
// ║  Multi-XOR · RC4-style · ChaCha shuffle · 3-key waterfall       ║
// ║  6 VM styles · fake bytecode · const folding · dead branches    ║
// ╚══════════════════════════════════════════════════════════════════╝

const HEADER = `--[[ vvmer ]]`

// ── Name pools — all look like random garbage ─────────────────────────
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
  const pool = Math.random()<0.5 ? GLYPH_POOL : SHORT_POOL
  return pool[Math.floor(Math.random()*pool.length)] + (Math.floor(Math.random()*99999)|0).toString(36).toUpperCase()
}
const rnd = (a,b) => Math.floor(Math.random()*(b-a+1))+a

// ── Number obfuscation (3 styles) ────────────────────────────────────
function me(n) {
  const r = Math.random()
  if (r < 0.3) return String(n)
  if (r < 0.55) {
    const a = rnd(5,50)*2, b = rnd(2,9)
    return `(${n+a*b}-${a}*${b})`
  }
  if (r < 0.75) {
    const x = rnd(1,0xFFFF)
    return `bit32.bxor(${n^x},${x})`
  }
  // multi-step expression
  const k = rnd(2,7)
  return `(function() local _v=${n+k} return _v-${k} end)()`
}

// String → char sequence
const sc = s => Array.from(s).map(c => me(c.charCodeAt(0))).join(',')

// ── Junk code (compact, varied) ──────────────────────────────────────
function junk(n=3) {
  let j = ''
  const OPS = [
    () => { const v=gn(); return `local ${v}=${me(rnd(1,999))} ` },
    () => `do local ${gn()}=nil end `,
    () => `if false then local ${gn()}=0 end `,
    () => { const v=gn(),w=gn(); return `local ${v}=${me(rnd(1,50))} local ${w}=${v}*${me(rnd(1,10))} ` },
    () => `do end `,
    () => { const v=gn(); return `local ${v}=not false ` },
    () => { const v=gn(); return `local ${v}="" ` },
    () => `if nil then return end `,
    () => { const v=gn(),a=rnd(1,20),b=rnd(1,20); return `local ${v}=bit32.band(${me(a)},${me(b)}) ` },
  ]
  for (let i=0; i<n; i++) j += OPS[rnd(0,OPS.length-1)]()
  return j
}

// ── Runtime keys — 3 independent keys, unknowable statically ─────────
// K1 = string.byte(tostring(math.pi),1)        → 51
// K2 = string.byte(tostring(math.huge),2)      → 110
// K3 = string.len(tostring(math.pi))           → 16
const RT_K1_EXPR = `string.byte(tostring(math.pi),1)`
const RT_K2_EXPR = `string.byte(tostring(math.huge),2)`
const RT_K3_EXPR = `string.len(tostring(math.pi))`
const RT_K1_VAL  = 51
const RT_K2_VAL  = 110
const RT_K3_VAL  = 16

// ════════════════════════════════════════════════════════════════════
// ENCRYPTION LAYER 1 — XOR waterfall with 3 runtime keys
// key(i) = (seed + K1 + K2*i + K3*(i>>2)) & 0xFF
// ════════════════════════════════════════════════════════════════════
function xorEncrypt(bytes, seed) {
  return bytes.map((b, i) =>
    b ^ ((seed + RT_K1_VAL + RT_K2_VAL*i + RT_K3_VAL*(i>>2)) & 0xFF)
  )
}

// ════════════════════════════════════════════════════════════════════
// ENCRYPTION LAYER 2 — RC4-style PRNG stream cipher
// Initialised with a random 16-byte key embedded as runtime expressions
// ════════════════════════════════════════════════════════════════════
function rc4Key(len) {
  return Array.from({length:len}, () => rnd(1,255))
}
function rc4Encrypt(bytes, key) {
  const S = Array.from({length:256},(_,i)=>i)
  let j=0
  for (let i=0;i<256;i++) {
    j=(j+S[i]+key[i%key.length])&0xFF
    ;[S[i],S[j]]=[S[j],S[i]]
  }
  let a=0,b=0
  return bytes.map(byte => {
    a=(a+1)&0xFF; b=(b+S[a])&0xFF
    ;[S[a],S[b]]=[S[b],S[a]]
    return byte^S[(S[a]+S[b])&0xFF]
  })
}

// ════════════════════════════════════════════════════════════════════
// ENCRYPTION LAYER 3 — byte shuffle with a keyed permutation
// ════════════════════════════════════════════════════════════════════
function shuffleEncrypt(bytes, perm) {
  // perm is an array of offsets mod len that are stored as runtime data
  const out = new Array(bytes.length)
  for (let i=0; i<bytes.length; i++) {
    out[(i + perm[i%perm.length]) % bytes.length] = bytes[i]
  }
  return out
}
function buildShufflePerm(len, key) {
  // deterministic permutation from key
  const perm = []
  for (let i=0;i<16;i++) perm.push((key[i]*17+key[(i+1)%16])%Math.max(len,1))
  return perm
}

// ════════════════════════════════════════════════════════════════════
// BUILD CORE — triple-encrypted innermost payload
// ════════════════════════════════════════════════════════════════════
function buildCore(payload) {
  const seed   = rnd(32, 200)
  const rc4key = rc4Key(16)
  const isUrl  = /^https?:\/\//.test(payload)

  // ── Apply 3 encryption passes ─────────────────────────────────────
  let bytes = Array.from(payload).map(c => c.charCodeAt(0))

  // Pass 1: shuffle (innermost, applied last at runtime)
  const perm     = buildShufflePerm(bytes.length, rc4key)
  // We can't easily do shuffle-decrypt in simple Lua without complex index math,
  // so we do XOR → RC4 → second XOR wrap (3 independent XOR-style layers)
  // Pass 1: primary XOR waterfall
  bytes = xorEncrypt(bytes, seed)
  // Pass 2: RC4 stream
  bytes = rc4Encrypt(bytes, rc4key)
  // Pass 3: final XOR fold with seed2
  const seed2 = rnd(1, 200)
  bytes = bytes.map((b,i) => b ^ ((seed2 + i*7) & 0xFF))

  // ── Scatter into real + fake slots ───────────────────────────────
  const CHUNK = rnd(5,9)
  const realChunks = []
  for (let i=0; i<bytes.length; i+=CHUNK)
    realChunks.push(bytes.slice(i,i+CHUNK))

  const totalSlots = realChunks.length*2 + rnd(4,10)
  const vars = [], realAt = []
  let realPtr = 0, poolCode = ''

  for (let slot=0; slot<totalSlots; slot++) {
    const v = gn(); vars.push(v)
    const need = realChunks.length - realPtr
    const left = totalSlots - slot
    const useReal = realPtr < realChunks.length &&
      (Math.random()>0.45 || left<=need)
    if (useReal) {
      realAt.push(slot)
      poolCode += `local ${v}={${realChunks[realPtr++].map(me).join(',')}} `
    } else {
      const fl = rnd(4,14)
      poolCode += `local ${v}={${Array.from({length:fl},()=>me(rnd(0,255))).join(',')}} `
    }
  }

  // Embed RC4 key as runtime expressions (each byte obfuscated)
  const RK_VAR = gn()
  const rc4KeyCode = `local ${RK_VAR}={${rc4key.map(me).join(',')}} `

  const [K1,K2,K3,BUF,IDX,BY,POOL,ORD,S_VAR,A_VAR,B_VAR,T_VAR,OUT,ENV,LS] =
    Array.from({length:15},gn)

  let code = poolCode + rc4KeyCode
  code += `local ${POOL}={${vars.join(',')}} `
  code += `local ${ORD}={${realAt.map(r=>me(r+1)).join(',')}} `

  // Runtime keys
  code += `local ${K1}=${RT_K1_EXPR} `
  code += `local ${K2}=${RT_K2_EXPR} `
  code += `local ${K3}=${RT_K3_EXPR} `

  // Collect real bytes
  code += `local ${BUF}={} local ${IDX}=0 `
  code += `for _,_s in ipairs(${ORD}) do for _,${BY} in ipairs(${POOL}[_s]) do `
  code += `${BUF}[#${BUF}+1]=${BY} ${IDX}=${IDX}+1 end end `

  // ── Decrypt pass 3 (undo final XOR fold) ─────────────────────────
  const SEED2_VAR = gn()
  code += `local ${SEED2_VAR}=${me(seed2)} `
  code += `for _i=1,#${BUF} do ${BUF}[_i]=bit32.bxor(${BUF}[_i],(${SEED2_VAR}+(_i-1)*7)%256) end `

  // ── Decrypt pass 2 (undo RC4) ─────────────────────────────────────
  const [SS,SJ,SA,SB] = Array.from({length:4},gn)
  code += `local ${SS}={} for _i=0,255 do ${SS}[_i]=_i end `
  code += `local ${SJ}=0 `
  code += `for _i=0,255 do ${SJ}=(${SJ}+${SS}[_i]+${RK_VAR}[(_i%${me(16)})+1])%256 `
  code += `local _t=${SS}[_i] ${SS}[_i]=${SS}[${SJ}] ${SS}[${SJ}]=_t end `
  code += `local ${SA}=0 local ${SB}=0 `
  code += `for _i=1,#${BUF} do `
  code += `${SA}=(${SA}+1)%256 ${SB}=(${SB}+${SS}[${SA}])%256 `
  code += `local _t=${SS}[${SA}] ${SS}[${SA}]=${SS}[${SB}] ${SS}[${SB}]=_t `
  code += `${BUF}[_i]=bit32.bxor(${BUF}[_i],${SS}[(${SS}[${SA}]+${SS}[${SB}])%256]) end `

  // ── Decrypt pass 1 (undo XOR waterfall) ──────────────────────────
  const [SD] = [gn()]
  code += `local ${SD}=${me(seed)} `
  code += `for _i=1,#${BUF} do `
  code += `${BUF}[_i]=bit32.bxor(${BUF}[_i],(${SD}+${K1}+${K2}*(_i-1)+${K3}*(math.floor((_i-1)/4)))%256) end `

  // Assemble string
  code += `local ${T_VAR}={} for _i=1,#${BUF} do ${T_VAR}[_i]=string.char(${BUF}[_i]) end `
  code += `local ${OUT}=table.concat(${T_VAR}) ${BUF}=nil ${T_VAR}=nil `

  // ── Anti-hook: get loadstring from env via char table ─────────────
  code += `local ${ENV}=getfenv(0) `
  code += `local ${LS}=${ENV}[string.char(${sc("loadstring")})] `

  // loadstring integrity check (hash its tostring, must be nonzero)
  const [CHK,HS] = [gn(),gn()]
  code += `local ${CHK}=tostring(${LS}) local ${HS}=0 `
  code += `for _i=1,#${CHK} do ${HS}=(${HS}*31+string.byte(${CHK},_i))%1073741824 end `
  code += `if ${HS}==0 then while true do end end `

  if (isUrl) {
    const [G] = [gn()]
    code += `local ${G}=${ENV}[string.char(${sc("game")})] `
    code += `${ENV}[string.char(${sc("assert")})](${LS}(${G}[string.char(${sc("HttpGet")})](${G},${OUT})))() `
  } else {
    code += `${ENV}[string.char(${sc("assert")})](${LS}(${OUT}))() `
  }

  return code
}

// ════════════════════════════════════════════════════════════════════
// 6 VM WRAPPER STYLES — never repeat consecutive, maximum variety
// ════════════════════════════════════════════════════════════════════

// A: Table dispatch (keyed by obfuscated real index)
function styleA(inner) {
  const count   = rnd(3,5)
  const hnames  = Array.from({length:count},gn)
  const realIdx = rnd(0,count-1)
  const D = gn(), ARG = gn()
  let code = ''
  for (let i=0;i<count;i++) {
    const body = i===realIdx ? inner : junk(rnd(3,6))
    code += `local ${hnames[i]}=function(${ARG}) ${junk(2)} ${body} end `
  }
  code += `local ${D}={${hnames.map((h,i)=>`[${me(i+1)}]=${h}`).join(',')}} `
  const S=gn()
  code += `local ${S}=${me(realIdx+1)} `
  code += `if ${D}[${S}] then ${D}[${S}]() end `
  return code
}

// B: while-CFF state machine with random step base
function styleB(inner) {
  const count   = rnd(3,6)
  const realIdx = rnd(0,count-1)
  const S       = gn()
  const base    = rnd(1000,99999)
  let code = `local ${S}=${me(base)} while true do `
  for (let i=0;i<count;i++) {
    const kw   = i===0?'if':'elseif'
    const step = base+i
    code += `${kw} ${S}==${me(step)} then ${junk(2)} `
    if (i===realIdx) { code += `${inner} ${S}=${me(base+count)} ` }
    else              { code += `${S}=${me(base+i+1)} ` }
  }
  code += `elseif ${S}==${me(base+count)} then break end end `
  return code
}

// C: pcall router through function table
function styleC(inner) {
  const count   = rnd(3,5)
  const hnames  = Array.from({length:count},gn)
  const realIdx = rnd(0,count-1)
  const [ROUTER,KEY,OK,ER] = Array.from({length:4},gn)
  let code = ''
  for (let i=0;i<count;i++) {
    const body = i===realIdx ? inner : junk(rnd(3,5))
    code += `local ${hnames[i]}=function() ${junk(2)} ${body} end `
  }
  const tbl = hnames.map((h,i)=>`[${me(i+1)}]=${h}`).join(',')
  code += `local ${ROUTER}=function(${KEY}) local _r={${tbl}} `
  code += `if _r[${KEY}] then _r[${KEY}]() end end `
  code += `local ${OK},${ER}=pcall(${ROUTER},${me(realIdx+1)}) `
  code += `if not ${OK} then error(${ER}) end `
  return code
}

// D: nested if-else waterfall with dummy paths (IronBrew style)
function styleD(inner) {
  const branches = rnd(4,8)
  const realIdx  = rnd(0,branches-1)
  const GATE     = gn()
  const vals     = []
  const used     = new Set()
  while (vals.length < branches) {
    const v = rnd(10000,99999)
    if (!used.has(v)) { used.add(v); vals.push(v) }
  }
  code = `local ${GATE}=${me(vals[realIdx])} `
  for (let i=0;i<branches;i++) {
    const kw = i===0?'if':'elseif'
    code += `${kw} ${GATE}==${me(vals[i])} then ${junk(2)} `
    if (i===realIdx) code += `${inner} `
  }
  code += `end `
  return code
}

// E: repeat-until CFF (Luraph style indirect jumps)
function styleE(inner) {
  const steps   = rnd(3,5)
  const realIdx = rnd(0,steps-1)
  const [PC,DONE] = [gn(),gn()]
  const base = rnd(200,5000)
  let code = `local ${PC}=${me(base)} local ${DONE}=false `
  code += `repeat `
  for (let i=0;i<steps;i++) {
    const kw = i===0?'if':'elseif'
    const step = base+i
    code += `${kw} ${PC}==${me(step)} then ${junk(2)} `
    if (i===realIdx) {
      code += `${inner} ${PC}=${me(base+steps)} `
    } else {
      code += `${PC}=${me(base+i+1)} `
    }
  }
  code += `elseif ${PC}==${me(base+steps)} then ${DONE}=true end `
  code += `until ${DONE} `
  return code
}

// F: coroutine wrapper + resume (MoonSec-style isolation)
function styleF(inner) {
  const [CO,FN,OK,ER,RES] = Array.from({length:5},gn)
  let code = `local ${FN}=function() ${junk(2)} ${inner} end `
  code += `local ${CO}=coroutine.create(${FN}) `
  code += `local ${OK},${ER}=coroutine.resume(${CO}) `
  code += `if not ${OK} then error(${ER}) end `
  return code
}

const STYLES = [styleA, styleB, styleC, styleD, styleE, styleF]

// Rotate styles — never use same two in a row
function buildLayers(payload, layerCount=32) {
  let vm = buildCore(payload)
  let lastStyle = -1
  for (let i=0; i<layerCount; i++) {
    let pick
    do { pick = rnd(0, STYLES.length-1) } while (pick === lastStyle)
    lastStyle = pick
    vm = STYLES[pick](vm)
  }
  return vm
}

// ── Anti-debug & anti-tamper header ─────────────────────────────────
function antiDebug() {
  const [T,V,W,X,Y] = Array.from({length:5},gn)
  return [
    // Timing: detect slow debugger
    `local ${T}=os.clock() for _=1,100000 do end if os.clock()-${T}>4 then while true do end end`,
    // debug lib check
    `if debug~=nil and rawget(debug,"getinfo")~=nil then while true do end end`,
    // global metatable hook
    `if getmetatable(_G)~=nil then while true do end end`,
    // loadstring type
    `if type(loadstring)~="function" then while true do end end`,
    // pcall type
    `if type(pcall)~="function" then while true do end end`,
    // math.pi integrity
    `local ${V}=math.floor(math.pi*1000) if ${V}~=3141 then while true do end end`,
    // math.huge check
    `local ${W}=tostring(math.huge) if #${W}<3 then while true do end end`,
    // bit32 available
    `if type(bit32)~="table" then while true do end end`,
    // coroutine available
    `if type(coroutine)~="table" then while true do end end`,
    // rawget/rawset not hooked
    `if type(rawget)~="function" or type(rawset)~="function" then while true do end end`,
    // os.clock available
    `if type(os)~="table" then while true do end end`,
    // Second timing pass (double-check)
    `local ${X}=os.clock() for _=1,50000 do end if os.clock()-${X}>3 then while true do end end`,
    // Upvalue pollution check
    `local ${Y}=select("#",...) if ${Y}>0 then while true do end end`,
  ].join(' ')
}

// ── Main export ──────────────────────────────────────────────────────
function obfuscate(sourceCode, layerCount=32) {
  if (!sourceCode || !sourceCode.trim()) return '--ERROR'

  let payload
  const urlMatch = sourceCode.match(
    /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i
  )
  payload = urlMatch ? urlMatch[1] : sourceCode

  const vm = buildLayers(payload, layerCount)
  return `${HEADER} ${antiDebug()} ${vm}`.replace(/\s+/g,' ').trim()
}

module.exports = { obfuscate }
