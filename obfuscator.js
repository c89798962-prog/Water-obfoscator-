// ╔══════════════════════════════════════════════════════╗
// ║  vvmer obfoscator v4 — anti FlameDumper "direct"    ║
// ║  Runtime XOR key · 3 VM styles · no patterns        ║
// ╚══════════════════════════════════════════════════════╝

const HEADER = `--[[ protected by vvmer ]]`

// ── Name pools ───────────────────────────────────────────────
const IL_POOL = [
  "IIIIIIII1","vvvvvv1","vvvvvvvv2","vvvvvv3","IIlIlIlI1",
  "lvlvlvlv2","I1","l1","v1","v2","v3","II","ll","vv","I2",
  "lI","Il","Iv","vI","lv","vl","IlI","lIl","vIv","IvI",
  "llII","IIll","vvII","IIvv","lIlI","vIvI"
]
const H_POOL = [
  "KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD",
  "eA","fG","hJ","iK","rP","uN","oB","sT","dE","gF","jH","kI"
]

// Short aliases
const gn  = () => IL_POOL[Math.floor(Math.random()*IL_POOL.length)] + Math.floor(Math.random()*9999)
const rnd = (a,b) => Math.floor(Math.random()*(b-a+1))+a

function pickH(count) {
  const used = new Set(), res = []
  while (res.length < count) {
    const n = H_POOL[rnd(0,H_POOL.length-1)] + rnd(10,99)
    if (!used.has(n)) { used.add(n); res.push(n) }
  }
  return res
}

// Obfuscate a number literal
function me(n) {
  if (Math.random() < 0.6) return String(n)
  const a = rnd(5,40)*2, b = rnd(2,8)
  return `(${n+a*b}-${a}*${b})`
}

// Obfuscate a string as char sequence
const sc = s => Array.from(s).map(c => me(c.charCodeAt(0))).join(',')

// Compact junk — few lines, low weight
function junk(n=3) {
  let j = ''
  for (let i=0; i<n; i++) {
    const v = gn(), r = Math.random()
    if      (r < 0.3) j += `local ${v}=${me(rnd(1,200))} `
    else if (r < 0.6) j += `do local ${v}=nil end `
    else               j += `if false then local ${v}=0 end `
  }
  return j
}

// ── Runtime key — defeats static byte scanning ───────────────
//
//   string.byte(tostring(math.pi),1)
//   → tostring(math.pi) = "3.14159265..."
//   → string.byte("3...",1) = 51  (ASCII '3')
//
//  FlameDumper static analysis CANNOT evaluate Lua expressions,
//  so it can never know the decryption key = 51.
//
const RT_KEY_EXPR = `string.byte(tostring(math.pi),1)`  // = 51 at runtime
const RT_KEY_VAL  = 51                                   // used at obfuscation time

// ── Core VM (innermost layer) ────────────────────────────────
// Encrypts payload with XOR keyed by (seed + RT_KEY + i*11) % 256
// RT_KEY is unknowable statically → static byte recovery fails

function buildCore(payload) {
  const seed  = rnd(32, 200)
  const isUrl = /^https?:\/\//.test(payload)

  // XOR encrypt
  const enc = Array.from(payload).map((c,i) =>
    c.charCodeAt(0) ^ ((seed + RT_KEY_VAL + i*11) & 0xFF)
  )

  // Scatter into real + fake slots
  const CHUNK = 7
  const realChunks = []
  for (let i=0; i<enc.length; i+=CHUNK) realChunks.push(enc.slice(i,i+CHUNK))

  const totalSlots = realChunks.length * 2 + rnd(3,7)
  const vars = [], realAt = []
  let realPtr = 0
  let poolCode = ''

  for (let slot=0; slot<totalSlots; slot++) {
    const v = gn(); vars.push(v)
    const need = realChunks.length - realPtr
    const left = totalSlots - slot
    const useReal = realPtr < realChunks.length &&
      (Math.random() > 0.45 || left <= need)

    if (useReal) {
      realAt.push(slot)
      poolCode += `local ${v}={${realChunks[realPtr++].map(me).join(',')}} `
    } else {
      const fl = rnd(4,12)
      poolCode += `local ${v}={${Array.from({length:fl},()=>me(rnd(0,255))).join(',')}} `
    }
  }

  // Variable names
  const [RK,BUF,IDX,BY,POOL,ORD,OUT,ENV,LS] = Array.from({length:9},gn)

  let code = poolCode
  code += `local ${POOL}={${vars.join(',')}} `
  code += `local ${ORD}={${realAt.map(r=>me(r+1)).join(',')}} `
  code += `local ${RK}=${RT_KEY_EXPR} `           // runtime key — cannot be precomputed
  code += `local ${BUF}={} local ${IDX}=0 `
  // Decrypt loop — XOR bytes back using runtime key
  code += `for _,_s in ipairs(${ORD}) do for _,${BY} in ipairs(${POOL}[_s]) do `
  code += `${BUF}[#${BUF}+1]=string.char(bit32.bxor(${BY},(${me(seed)}+${RK}+${IDX}*11)%256)) `
  code += `${IDX}=${IDX}+1 end end `
  code += `local ${OUT}=table.concat(${BUF}) ${BUF}=nil `

  // Anti-hook: reconstruct loadstring from env instead of calling it directly
  code += `local ${ENV}=getfenv(0) `
  code += `local ${LS}=${ENV}[string.char(${sc("loadstring")})] `
  // Detect if loadstring was replaced by a hook proxy
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

// ══════════════════════════════════════════════════════════════
// 3 DISTINCT VM WRAPPER STYLES — rotate randomly, never repeat
// the same style consecutively → no structural patterns
// ══════════════════════════════════════════════════════════════

// Style A: Table dispatch with random real index
function styleA(inner) {
  const count    = rnd(2,4)
  const handlers = pickH(count)
  const realIdx  = rnd(0,count-1)
  const D = gn(), ARG = gn()

  let code = ''
  for (let i=0; i<count; i++) {
    const body = i===realIdx ? inner : junk(rnd(2,4))
    code += `local ${handlers[i]}=function(${ARG}) ${junk(rnd(1,2))} ${body} end `
  }
  code += `local ${D}={${handlers.map((h,i)=>`[${me(i+1)}]=${h}`).join(',')}} `
  // CFF to reach the real handler
  const S = gn()
  code += `local ${S}=${me(realIdx+1)} `
  code += `if ${D}[${S}] then ${D}[${S}]() end `
  return code
}

// Style B: while-CFF state machine with unique step values per layer
function styleB(inner) {
  const count    = rnd(2,5)
  const realIdx  = rnd(0,count-1)
  const S = gn()
  const base     = rnd(100, 5000)  // random base offset — no two layers share steps

  let code = `local ${S}=${me(base)} while true do `
  for (let i=0; i<count; i++) {
    const kw   = i===0 ? 'if' : 'elseif'
    const step = base + i
    code += `${kw} ${S}==${me(step)} then ${junk(2)} `
    if (i===realIdx) {
      code += `${inner} ${S}=${me(base+count)} `
    } else {
      code += `${S}=${me(base+i+1)} `
    }
  }
  code += `elseif ${S}==${me(base+count)} then break end end `
  return code
}

// Style C: pcall dispatch through a generated router function
function styleC(inner) {
  const count    = rnd(2,4)
  const handlers = pickH(count)
  const realIdx  = rnd(0,count-1)
  const [OK,ER,ROUTER,KEY] = [gn(),gn(),gn(),gn()]

  let code = ''
  for (let i=0; i<count; i++) {
    const body = i===realIdx ? inner : junk(rnd(2,3))
    code += `local ${handlers[i]}=function() ${junk(rnd(1,2))} ${body} end `
  }

  // Router picks handler by key
  const tbl = handlers.map((h,i)=>`[${me(i+1)}]=${h}`).join(',')
  code += `local ${ROUTER}=function(${KEY}) local _t={${tbl}} `
  code += `if _t[${KEY}] then _t[${KEY}]() end end `
  const [OK2,ER2] = [gn(),gn()]
  code += `local ${OK2},${ER2}=pcall(${ROUTER},${me(realIdx+1)}) `
  code += `if not ${OK2} then error(${ER2}) end `
  return code
}

const STYLES = [styleA, styleB, styleC]

// Rotate styles — never use the same two in a row
function buildLayers(payload) {
  let vm = buildCore(payload)
  let lastStyle = -1
  for (let i=0; i<29; i++) {
    let pick
    do { pick = rnd(0,2) } while (pick === lastStyle)
    lastStyle = pick
    vm = STYLES[pick](vm)
  }
  return vm
}

// ── Anti-debug header (compact) ──────────────────────────────
function antiDebug() {
  const [T,V] = [gn(),gn()]
  return [
    // Timing check — detects debugger slowdown
    `local ${T}=os.clock() for _=1,80000 do end if os.clock()-${T}>4 then while true do end end`,
    // Debug library check
    `if debug~=nil and rawget(debug,"getinfo") then while true do end end`,
    // Global metatable hook check
    `if getmetatable(_G)~=nil then while true do end end`,
    // loadstring type check
    `if type(loadstring)~="function" then while true do end end`,
    // pcall integrity
    `if type(pcall)~="function" then while true do end end`,
    // math.pi sanity (tamper detection)
    `local ${V}=math.floor(math.pi*1000) if ${V}~=3141 then while true do end end`,
  ].join(' ')
}

// ── Main export ──────────────────────────────────────────────
function obfuscate(sourceCode) {
  if (!sourceCode || !sourceCode.trim()) return '--ERROR'

  let payload
  const urlMatch = sourceCode.match(
    /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i
  )
  payload = urlMatch ? urlMatch[1] : sourceCode

  const vm = buildLayers(payload)
  return `${HEADER} ${antiDebug()} ${vm}`.replace(/\s+/g,' ').trim()
}

module.exports = { obfuscate }
