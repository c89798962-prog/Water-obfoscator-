// ╔══════════════════════════════════════════════════════╗
// ║  vvmer obfoscator v4 — anti FlameDumper "direct"    ║
// ║  Runtime XOR key · 3 VM styles · Shadow-Sticker     ║
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

function me(n) {
  if (Math.random() < 0.6) return String(n)
  const a = rnd(5,40)*2, b = rnd(2,8)
  return `(${n+a*b}-${a}*${b})`
}

const sc = s => Array.from(s).map(c => me(c.charCodeAt(0))).join(',')

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

// ── Runtime key ──────────────────────────────────────────────
const RT_KEY_EXPR = `string.byte(tostring(math.pi),1)`
const RT_KEY_VAL  = 51

// ── Core VM ──────────────────────────────────────────────────
function buildCore(payload) {
  const seed  = rnd(32, 200)
  const isUrl = /^https?:\/\//.test(payload)

  const enc = Array.from(payload).map((c,i) =>
    c.charCodeAt(0) ^ ((seed + RT_KEY_VAL + i*11) & 0xFF)
  )

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

  const [RK,BUF,IDX,BY,POOL,ORD,OUT,ENV,LS] = Array.from({length:9},gn)

  let code = poolCode
  code += `local ${POOL}={${vars.join(',')}} `
  code += `local ${ORD}={${realAt.map(r=>me(r+1)).join(',')}} `
  code += `local ${RK}=${RT_KEY_EXPR} `
  code += `local ${BUF}={} local ${IDX}=0 `
  code += `for _,_s in ipairs(${ORD}) do for _,${BY} in ipairs(${POOL}[_s]) do `
  code += `${BUF}[#${BUF}+1]=string.char(bit32.bxor(${BY},(${me(seed)}+${RK}+${IDX}*11)%256)) `
  code += `${IDX}=${IDX}+1 end end `
  code += `local ${OUT}=table.concat(${BUF}) ${BUF}=nil `

  code += `local ${ENV}=getfenv(0) `
  code += `local ${LS}=${ENV}[string.char(${sc("loadstring")})] `
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

// ── VM Style A ───────────────────────────────────────────────
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
  const S = gn()
  code += `local ${S}=${me(realIdx+1)} `
  code += `if ${D}[${S}] then ${D}[${S}]() end `
  return code
}

// ── VM Style B ───────────────────────────────────────────────
function styleB(inner) {
  const count    = rnd(2,5)
  const realIdx  = rnd(0,count-1)
  const S = gn()
  const base     = rnd(100, 5000)

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

// ── VM Style C ───────────────────────────────────────────────
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

  const tbl = handlers.map((h,i)=>`[${me(i+1)}]=${h}`).join(',')
  code += `local ${ROUTER}=function(${KEY}) local _t={${tbl}} `
  code += `if _t[${KEY}] then _t[${KEY}]() end end `
  const [OK2,ER2] = [gn(),gn()]
  code += `local ${OK2},${ER2}=pcall(${ROUTER},${me(realIdx+1)}) `
  code += `if not ${OK2} then error(${ER2}) end `
  return code
}

const STYLES = [styleA, styleB, styleC]

// ── Shadow-Sticker — Volatile Execution + Decoy Bait ─────────
//
//  1. Coroutine creado con closure del payload real
//  2. Referencia nominal → sobreescrita con decoy ANTES del resume
//  3. Timer paralelo destruye el CO a los 3s
//  4. Dump post-ejecución solo encuentra el decoy
//
function shadowSticker(inner) {
  const [REAL, DECOY, CO, OK2, ER2, LAUNCH, TIMER_CO] = Array.from({length: 7}, gn)
  const decoyMsg = "nah bro this print is not the real code"

  let code = ''

  // Función real (contiene todo el payload)
  code += `local ${REAL}=function() ${inner} end `

  // Función cebo — válida pero sin lógica real
  code += `local ${DECOY}=function() `
  code += `print(string.char(${sc(decoyMsg)})) `
  code += `end `

  // Timestamp de lanzamiento
  code += `local ${LAUNCH}=os.clock() `

  // Crear coroutine ANTES de destruir la referencia (captura el closure)
  code += `local ${CO}=coroutine.create(${REAL}) `

  // DESTRUIR referencia — a partir de aquí cualquier hook ve solo decoy
  code += `${REAL}=${DECOY} `

  // Timer paralelo: destruye el coroutine a los 3 segundos
  code += `local ${TIMER_CO}=coroutine.create(function() `
  code += `  while os.clock()-${LAUNCH}<3 do coroutine.yield() end `
  code += `  ${CO}=nil `
  code += `end) `
  code += `coroutine.resume(${TIMER_CO}) `

  // Ejecutar payload real por su coroutine (el closure sobrevive al nil del nombre)
  code += `local ${OK2},${ER2}=coroutine.resume(${CO}) `
  // Destruir inmediatamente tras ejecución
  code += `${CO}=nil `
  code += `if not ${OK2} then error(${ER2}) end `

  return code
}

// ── Build layers ─────────────────────────────────────────────
function buildLayers(payload, options = {}) {
  let vm = buildCore(payload)
  let lastStyle = -1
  for (let i = 0; i < 29; i++) {
    let pick
    do { pick = rnd(0, 2) } while (pick === lastStyle)
    lastStyle = pick
    vm = STYLES[pick](vm)
  }

  // Shadow-Sticker como capa envolvente final
  if (options.shadowSticker !== false) {
    vm = shadowSticker(vm)
  }

  return vm
}

// ── Anti-debug header ────────────────────────────────────────
function antiDebug() {
  const [T,V] = [gn(),gn()]
  return [
    `local ${T}=os.clock() for _=1,80000 do end if os.clock()-${T}>4 then while true do end end`,
    `if debug~=nil and rawget(debug,"getinfo") then while true do end end`,
    `if getmetatable(_G)~=nil then while true do end end`,
    `if type(loadstring)~="function" then while true do end end`,
    `if type(pcall)~="function" then while true do end end`,
    `local ${V}=math.floor(math.pi*1000) if ${V}~=3141 then while true do end end`,
  ].join(' ')
}

// ── Main export ──────────────────────────────────────────────
function obfuscate(sourceCode, options = { shadowSticker: true }) {
  if (!sourceCode || !sourceCode.trim()) return '--ERROR'

  let payload
  const urlMatch = sourceCode.match(
    /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i
  )
  payload = urlMatch ? urlMatch[1] : sourceCode

  const vm = buildLayers(payload, options)
  return `${HEADER} ${antiDebug()} ${vm}`.replace(/\s+/g, ' ').trim()
}

module.exports = { obfuscate }
