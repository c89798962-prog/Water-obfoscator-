// vvmer obfuscator v6 — Roblox‑ready · sin errores · watermark intacta
// ╔══════════════════════════════════════════════════════╗
// ║  vvmer obfuscator v6 — anti FlameDumper "direct"    ║
// ║  Runtime XOR key · 3 VM styles · sin dependencias   ║
// ╚══════════════════════════════════════════════════════╝

const HEADER = `--[[ this code its proyected by vmmer discord server:https://discord.gg/AAVKHtbxS ]]`

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

const gn = () => IL_POOL[Math.floor(Math.random()*IL_POOL.length)] + Math.floor(Math.random()*9999)
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

// Runtime key (solo depende de math.pi, funciona en Roblox)
const RT_KEY_EXPR = `string.byte(tostring(math.pi),1)`  // = 51
const RT_KEY_VAL  = 51

// ── Core VM (corregida, sin errores de sintaxis) ─────────────
function buildCore(payload) {
  const seed  = rnd(32, 200)
  const isUrl = /^https?:\/\//.test(payload)

  // XOR encrypt
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

  const [RK,BUF,IDX,BY,POOL,ORD,OUT,LS] = Array.from({length:8}, gn)

  let code = poolCode
  code += `local ${POOL}={${vars.join(',')}} `
  code += `local ${ORD}={${realAt.map(r=>me(r+1)).join(',')}} `
  code += `local ${RK}=${RT_KEY_EXPR} `
  code += `local ${BUF}={} local ${IDX}=0 `
  code += `for _,_s in ipairs(${ORD}) do for _,${BY} in ipairs(${POOL}[_s]) do `
  code += `${BUF}[#${BUF}+1]=string.char(bit32.bxor(${BY},(${me(seed)}+${RK}+${IDX}*11)%256)) `
  code += `${IDX}=${IDX}+1 end end `
  code += `local ${OUT}=table.concat(${BUF}) ${BUF}=nil `

  // Anti-hook simple pero efectivo (sin debug)
  code += `local ${LS}=loadstring or load `
  code += `if type(${LS})~="function" then error() end `

  if (isUrl) {
    const [G] = [gn()]
    code += `local ${G}=game `
    code += `${LS}(${G}:HttpGet(${OUT}))() `
  } else {
    code += `${LS}(${OUT})() `
  }

  return code
}

// ── 3 estilos (corregidos, sin errores de sintaxis) ─────────
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
  code += `local _idx=${me(realIdx+1)} `
  code += `if ${D}[_idx] then ${D}[_idx]() end `
  return code
}

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

function styleC(inner) {
  const count    = rnd(2,4)
  const handlers = pickH(count)
  const realIdx  = rnd(0,count-1)
  const [ROUTER,KEY] = [gn(),gn()]

  let code = ''
  for (let i=0; i<count; i++) {
    const body = i===realIdx ? inner : junk(rnd(2,3))
    code += `local ${handlers[i]}=function() ${junk(rnd(1,2))} ${body} end `
  }

  const tbl = handlers.map((h,i)=>`[${me(i+1)}]=${h}`).join(',')
  code += `local ${ROUTER}=function(${KEY}) local _t={${tbl}} if _t[${KEY}] then _t[${KEY}]() end end `
  code += `pcall(${ROUTER},${me(realIdx+1)}) `
  return code
}

const STYLES = [styleA, styleB, styleC]

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

// Anti‑debug ligero (solo checks que no rompen Roblox)
function antiDebug() {
  const [T] = [gn()]
  return [
    `local ${T}=os.clock() for _=1,50000 do end if os.clock()-${T}>0.5 then while true do end end`,
    `if type(loadstring)~="function" and type(load)~="function" then while true do end end`,
    `if pcall and type(pcall)~="function" then while true do end end`,
  ].join(' ')
}

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
