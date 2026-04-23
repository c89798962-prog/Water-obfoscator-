// ==================== CONSTANTES COMUNES ====================
const HEADER = `--[[ this code it's protected by vmmer obfoscator ]]`;

const IL_POOL = ["IIIIIIII1", "vvvvvv1", "vvvvvvvv2", "vvvvvv3", "IIlIlIlI1", "lvlvlvlv2", "I1","l1","v1","v2","v3","II","ll","vv", "I2"];
const HANDLER_POOL = ["KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD"];

// ==================== FUNCIONES AUXILIARES COMUNES ====================

function generateIlName() {
  return IL_POOL[Math.floor(Math.random() * IL_POOL.length)] + Math.floor(Math.random() * 999999);
}

function pickHandlers(count) {
  const used = new Set();
  const result = [];
  while (result.length < count) {
    const base = HANDLER_POOL[Math.floor(Math.random() * HANDLER_POOL.length)];
    const name = base + Math.floor(Math.random() * 99);
    if (!used.has(name)) { used.add(name); result.push(name); }
  }
  return result;
}

function runtimeString(str) {
  return `string.char(${str.split('').map(c => heavyMathNormal(c.charCodeAt(0))).join(',')})`;
}

function applyCFF(blocks) {
  const stateVar = generateIlName();
  let lua = `local ${stateVar}=${heavyMathNormal(1)} while true do `;
  for (let i = 0; i < blocks.length; i++) {
    if (i === 0) lua += `if ${stateVar}==${heavyMathNormal(1)} then ${blocks[i]} ${stateVar}=${heavyMathNormal(2)} `;
    else         lua += `elseif ${stateVar}==${heavyMathNormal(i + 1)} then ${blocks[i]} ${stateVar}=${heavyMathNormal(i + 2)} `;
  }
  lua += `elseif ${stateVar}==${heavyMathNormal(blocks.length + 1)} then break end end `;
  return lua;
}

// ==================== MODO NORMAL (SIN CAMBIOS) ====================

function heavyMathNormal(n) {
  if (Math.random() < 0.3) return n.toString();
  let a = Math.floor(Math.random() * 5000) + 1000;
  let b = Math.floor(Math.random() * 100) + 2;
  let c = Math.floor(Math.random() * 800) + 10;
  let d = Math.floor(Math.random() * 20) + 2;
  return `(((((${n}+${a})*${b})/${b})-${a})+((${c}*${d})/${d})-${c})`;
}

function mbaNormal() {
  let n = Math.random() > 0.5 ? 1 : 2, a = Math.floor(Math.random() * 70) + 15, b = Math.floor(Math.random() * 40) + 8;
  return `((${n}*${a}-${a})/(${b}+1)+${n})`;
}

function generateJunkNormal(lines = 100) {
  let j = '';
  for (let i = 0; i < lines; i++) {
    const r = Math.random();
    if (r < 0.2) j += `local ${generateIlName()}=${heavyMathNormal(Math.floor(Math.random() * 999))} `;
    else if (r < 0.4) j += `local ${generateIlName()}=string.char(${heavyMathNormal(Math.floor(Math.random()*255))}) `;
    else if (r < 0.5) j += `if not(${heavyMathNormal(1)}==${heavyMathNormal(1)}) then local x=1 end `;
    else if (r < 0.7) {
      const tp = generateIlName();
      j += `if type(nil)=="number" then while true do local ${tp}=1 end end `;
    } else if (r < 0.85) {
      const vt = generateIlName();
      j += `do local ${vt}={} ${vt}["_"]=1 ${vt}=nil end `;
    } else {
      j += `if type(math.pi)=="string" then local _=1 end `;
    }
  }
  return j;
}

function detectAndApplyMappingsNormal(code) {
  const MAPEO = {
    "ScreenGui":"Aggressive Renaming","Frame":"String to Math","TextLabel":"Table Indirection",
    "TextButton":"Mixed Boolean Arithmetic","Humanoid":"Dynamic Junk","Player":"Fake Flow",
    "RunService":"Virtual Machine","TweenService":"Fake Flow","Players":"Fake Flow"
  };
  let modified = code, headers = "";
  for (const [word, tech] of Object.entries(MAPEO)) {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    if (regex.test(modified)) {
      let replacement = `"${word}"`;
      if (tech.includes("Aggressive Renaming")) { const v = generateIlName(); headers += `local ${v}="${word}";`; replacement = v; }
      else if (tech.includes("String to Math")) replacement = `string.char(${word.split('').map(c => heavyMathNormal(c.charCodeAt(0))).join(',')})`;
      else if (tech.includes("Mixed Boolean Arithmetic")) replacement = `((${mbaNormal()}==1 or true)and"${word}")`;
      regex.lastIndex = 0;
      modified = modified.replace(regex, () => `game[${replacement}]`);
    }
  }
  return headers + modified;
}

function buildTrueVMNormal(payloadStr) {
  const STACK = generateIlName(); const KEY = generateIlName(); const SALT = generateIlName();
  const seed = Math.floor(Math.random() * 200) + 50;
  const saltVal = Math.floor(Math.random() * 250) + 1;
  let vmCore = `local ${STACK}={} local ${KEY}=${heavyMathNormal(seed)} local ${SALT}=${heavyMathNormal(saltVal)} `;
  const chunkSize = 15; let realChunks = [];
  for(let i = 0; i < payloadStr.length; i += chunkSize) { realChunks.push(payloadStr.slice(i, i + chunkSize)); }
  let poolVars = []; let realOrder = [];
  let totalChunks = realChunks.length * 3; let currentReal = 0; let globalIndex = 0;
  for(let i = 0; i < totalChunks; i++) {
    let memName = generateIlName(); poolVars.push(memName);
    if (currentReal < realChunks.length && (Math.random() > 0.5 || (totalChunks - i) === (realChunks.length - currentReal))) {
      realOrder.push(i + 1);
      let chunk = realChunks[currentReal]; let encryptedBytes = [];
      for(let j = 0; j < chunk.length; j++) { 
        let enc = (chunk.charCodeAt(j) + seed + (globalIndex * saltVal)) % 256;
        encryptedBytes.push(heavyMathNormal(enc)); 
        globalIndex++;
      }
      vmCore += `local ${memName}={${encryptedBytes.join(',')}} `;
      currentReal++;
    } else {
      let fakeBytes = []; let fakeLen = Math.floor(Math.random() * 20) + 5;
      for(let j = 0; j < fakeLen; j++) { fakeBytes.push(heavyMathNormal(Math.floor(Math.random() * 255))); }
      vmCore += `local ${memName}={${fakeBytes.join(',')}} `;
    }
  }
  vmCore += `local _pool={${poolVars.join(',')}} local _order={${realOrder.map(n => heavyMathNormal(n)).join(',')}} `;
  vmCore += `local _gIdx=0 for _, idx in ipairs(_order) do for _, byte in ipairs(_pool[idx]) do `;
  vmCore += `if type(math.pi)=="string" then ${KEY}=(${KEY}+137)%256 end `;
  vmCore += `table.insert(${STACK}, string.char(math.floor((byte - ${KEY} - _gIdx * ${SALT}) % 256))) _gIdx=_gIdx+1 end end `;
  vmCore += `local _e = table.concat(${STACK}) ${STACK}=nil `;
  const ASSERT  = `getfenv()[${runtimeString("assert")}]`;
  const LOADSTRING = `getfenv()[${runtimeString("loadstring")}]`;
  const GAME    = `getfenv()[${runtimeString("game")}]`;
  const HTTPGET = runtimeString("HttpGet");
  if (payloadStr.includes("http")) { vmCore += `${ASSERT}(${LOADSTRING}(${GAME}[${HTTPGET}](${GAME}, _e)))() ` } 
  else { vmCore += `${ASSERT}(${LOADSTRING}(_e))() ` }
  return vmCore;
}

function buildSingleVMNormalNormal(innerCode, handlerCount) {
  const handlers = pickHandlers(handlerCount); const realIdx = Math.floor(Math.random() * handlerCount);
  const DISPATCH = generateIlName(); let out = `local lM={} `;
  for (let i = 0; i < handlers.length; i++) {
    if (i === realIdx) { out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunkNormal(5)} ${innerCode} end `; } 
    else { out += `local ${handlers[i]}=function(lM) local lM=lM; ${generateJunkNormal(3)} return nil end `; }
  }
  out += `local ${DISPATCH}={`
  for (let i = 0; i < handlers.length; i++) { out += `[${heavyMathNormal(i + 1)}]=${handlers[i]},` }
  out += `} `
  let execBlocks = []; for (let i = 0; i < handlers.length; i++) { execBlocks.push(`${DISPATCH}[${heavyMathNormal(i + 1)}](lM)`) }
  out += applyCFF(execBlocks); return out;
}

function getNormalProtections() {
  const antiDebuggers = `local _adT=os.clock() for _=1,150000 do end if os.clock()-_adT>5.0 then while true do end end ` +
    `if debug~=nil and debug.getinfo then local _i=debug.getinfo(1) if _i.what~="main" and _i.what~="Lua" then while true do end end end `;
  const rawTampers = [
    `if math.pi<3.14 or math.pi>3.15 then _err() end`, `if bit32 and bit32.bxor(10,5)~=15 then _err() end`,
    `if type(tostring)~="function" then _err() end`, `if not string.match("chk","^c.*k$") then _err() end`,
    `local _tm1=os.time() local _tm2=os.time() if _tm2<_tm1 then _err() end`, `if math.abs(-10)~=10 then _err() end`
  ];
  let codeVaultGuards = "";
  for(let t of rawTampers) {
    const fnName = generateIlName(); const errName = generateIlName();
    const injectedError = t.replace("_err()", `${errName}("!")`);
    codeVaultGuards += `local ${fnName}=function() local ${errName}=error ${injectedError} end ${fnName}() `;
  }
  return antiDebuggers + codeVaultGuards;
}

function obfuscateNormal(sourceCode) {
  if (!sourceCode) return '-- Error: No Source';

  const extraProtections = getNormalProtections();
  let payloadToProtect = "";
  const isLoadstringRegex = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i;
  const match = sourceCode.match(isLoadstringRegex);
  if (match) { payloadToProtect = match[1]; } 
  else { payloadToProtect = detectAndApplyMappingsNormal(sourceCode); }

  let vm = buildTrueVMNormal(payloadToProtect);
  for (let i = 0; i < 17; i++) {
    vm = buildSingleVMNormalNormal(vm, Math.floor(Math.random() * 2) + 3); 
  }
  return `${HEADER} ${generateJunkNormal(50)} ${extraProtections} ${vm}`.replace(/\s+/g, " ").trim();
}

// ==================== NUEVO MODO DIABOLICAL = CODEVAULT ====================

// ── Minificador Lua básico (compatible con CodeVault) ──
function minifyLua(src) {
  let out = '', i = 0, n = src.length, inDq = false, inSq = false;
  while (i < n) {
    if (inDq) {
      if (src[i] === '\\' && i + 1 < n) { out += src[i] + src[i + 1]; i += 2; continue; }
      if (src[i] === '"') inDq = false;
      out += src[i]; i++; continue;
    }
    if (inSq) {
      if (src[i] === '\\' && i + 1 < n) { out += src[i] + src[i + 1]; i += 2; continue; }
      if (src[i] === "'") inSq = false;
      out += src[i]; i++; continue;
    }
    // long strings / comments
    if (src[i] === '[' && i + 1 < n && src[i + 1] === '[') {
      const e = src.indexOf(']]', i + 2);
      if (e !== -1) { out += src.slice(i, e + 2).replace(/[\n\r]+/g, ' '); i = e + 2; continue; }
    }
    if (src.slice(i, i + 2) === '--') {
      if (src.slice(i, i + 4) === '--[[') {
        const e = src.indexOf(']]', i + 4);
        i = (e !== -1) ? e + 2 : n; continue;
      }
      const nl = src.indexOf('\n', i);
      i = (nl !== -1) ? nl + 1 : n; continue;
    }
    if (src[i] === '"') inDq = true;
    else if (src[i] === "'") inSq = true;
    out += src[i]; i++;
  }
  return out.replace(/[\n\r\t]+/g, ' ').replace(/  +/g, ' ').trim();
}

// ── Generador de nombres (I, l, _) ──
const IL = ['I','l','_'];
function codeVaultName() {
  for (let attempt = 0; attempt < 1000000; attempt++) {
    const len = 12 + Math.floor(Math.random() * 9);
    let nm = IL[Math.floor(Math.random() * IL.length)];
    for (let i = 1; i < len; i++) nm += IL[Math.floor(Math.random() * IL.length)];
    if (!codeVaultName.used.has(nm) && !LUA_KW.has(nm)) {
      codeVaultName.used.add(nm);
      return nm;
    }
  }
  throw new Error("Name space exhausted");
}
codeVaultName.used = new Set();
const LUA_KW = new Set([
  'and','break','do','else','elseif','end','false','for','function',
  'goto','if','in','local','nil','not','or','repeat','return','then',
  'true','until','while'
]);

// ── Emisor de números (hex, padding y mayúsculas aleatorias) ──
function emitNumber(val) {
  val = parseInt(val);
  const neg = val < 0 ? '-' : '';
  const abs = Math.abs(val);
  let hex = abs.toString(16);
  hex = hex.padStart(Math.max(hex.length, [2,2,4,4,4,6,8][Math.floor(Math.random()*7)]), '0');
  hex = hex.split('').map(c => Math.random() < 0.5 ? c.toUpperCase() : c.toLowerCase()).join('');
  const prefix = Math.random() < 0.5 ? '0X' : '0x';
  return neg ? `(-${prefix}${hex})` : `${prefix}${hex}`;
}

// ── Pool de símbolos y alfabeto reducido ──
const CODEC_POOL = ">#_</$|^!@%?=+-*:.;,(){}[]".split('');
function pickCodec() {
  const pool = [...CODEC_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 10).join('');
}

// ── Predicados opacos (siempre verdaderos/falsos en runtime) ──
function opaqueTrue() {
  const x = Math.floor(Math.random() * 9999) + 2;
  const templates = [
    `type(math.pi)=="number" and math.pi>3 and math.pi<4`,
    `type(math.huge)=="number" and math.huge>10^9`,
    `type(table.insert)=="function"`,
    `string.format("%d",42)=="42"`,
    `tostring(true)=="true" and tostring(false)=="false"`,
    `type(pcall)=="function" and type(error)=="function"`,
    `type(math.floor)=="function" and type(math.abs)=="function"`,
    `string.sub("CodeVault",1,4)=="Code"`,
    `type(string.byte)=="function"`,
    `#"hello"==5`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}
function opaqueFalse() {
  const x = Math.floor(Math.random() * 9999) + 2;
  const templates = [
    `type(${x})=="table"`,
    `type(nil)=="number"`,
    `type(string.format("%d",1))=="number"`,
    `type(math.floor(1))=="string"`,
    `rawequal(${x},"${x}")`,
    `tostring(nil)==""`,
    `${x}==${x+1}`,
    `type(0)=="string"`,
    `#"x"==0`,
    `${x*2}==${x*2+1}`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

// ── Tarpit (bucle infinito en camino muerto) ──
function tarpit() {
  const x = Math.floor(Math.random() * 9999) + 2;
  const vtp = codeVaultName(), vtq = codeVaultName();
  return `while ${opaqueFalse()} do local ${vtp}=${x} if ${opaqueFalse()} then local ${vtq}=${x+1} while ${vtq}>0 do ${vtq}=${vtq}-1 end end end`;
}

// ── Junk style: genera una función basura con varios estilos ──
function buildJunkFunction(sv, jt, idx) {
  const params = [sv];
  for (let i = 0; i < Math.floor(Math.random()*4)+2; i++) params.push(codeVaultName());
  const lv = params.slice(1);
  for (let i = 0; i < Math.floor(Math.random()*3); i++) lv.push(codeVaultName());
  let body = '';
  if (lv.length > params.length-1) body += 'local ' + lv.slice(params.length-1).join(',') + ';';
  const style = Math.floor(Math.random() * 10);
  // simple
  if (style < 3) {
    for (let i=0; i<Math.floor(Math.random()*8)+5; i++) {
      body += `${lv[Math.floor(Math.random()*lv.length)]||sv}=${emitNumber(Math.floor(Math.random()*99999))}+${emitNumber(Math.floor(Math.random()*999))};`;
    }
  } else if (style < 5) { // for_disp
    const step = emitNumber(16+Math.floor(Math.random()*48));
    const start = emitNumber(1+Math.floor(Math.random()*200));
    const ni = 4+Math.floor(Math.random()*4);
    const limit = emitNumber(parseInt(start)+ (ni-1)*parseInt(step));
    const vr = codeVaultName();
    body += `for ${vr}=${start},${limit},${step} do `;
    for (let i=0; i<ni; i++) {
      body += (i===0?'if ':'elseif ')+`${vr}==${emitNumber(parseInt(start)+i*parseInt(step))} then `;
      for (let j=0; j<Math.floor(Math.random()*2)+1; j++) body += `${lv[Math.floor(Math.random()*lv.length)]||sv}=${emitNumber(Math.floor(Math.random()*999))};`;
    }
    body += 'end;end;';
  } else if (style < 7) { // repeat_st
    const sts = Array.from({length: 4+Math.floor(Math.random()*3)}, () => Math.floor(Math.random()*90000)+10000);
    const vst = codeVaultName();
    body += `local ${vst}=${emitNumber(sts[0])};repeat `;
    for (let i=0; i<sts.length; i++) {
      body += (i===0?'if ':'elseif ')+`${vst}==${emitNumber(sts[i])} then `;
      body += `${lv[Math.floor(Math.random()*lv.length)]||sv}=${emitNumber(Math.floor(Math.random()*999))};`;
      body += i+1<sts.length ? `${vst}=${emitNumber(sts[i+1])};` : 'break;';
    }
    body += 'else break;end;until false;';
  } else if (style < 8) { // dead_branch
    const hv = emitNumber(Math.floor(Math.random()*900000)+100000);
    const vd = codeVaultName();
    body += `local ${vd}=${hv};if ${vd}>${emitNumber(parseInt(hv)+1)} then `;
    for (let i=0; i<Math.floor(Math.random()*3)+1; i++) body += `${lv[Math.floor(Math.random()*lv.length)]||sv}=${emitNumber(Math.floor(Math.random()*999))};`;
    body += `elseif ${vd}<${emitNumber(parseInt(hv)-1)} then `;
    body += `${lv[Math.floor(Math.random()*lv.length)]||sv}=${emitNumber(Math.floor(Math.random()*999))};`;
    body += 'end;';
  } else { // symbol_tbl
    const symKeys = ["/_","!$","><","/$","_!",">_","#!","></"];
    const vt = codeVaultName();
    body += `local ${vt}={};`;
    for (let i=0; i<5; i++) body += `${vt}["${symKeys[i]||symKeys[0]}"]=${emitNumber(Math.floor(Math.random()*999))};`;
    body += `${vt}=nil;`;
  }
  // return random upvalues
  const retVals = lv.length ? lv.slice(0, Math.min(lv.length, Math.floor(Math.random()*2)+1)).join(',') : 'nil';
  body += `return ${retVals};`;
  return { head: params.join(','), body };
}

// ── Construye tabla de funciones basura ──
function buildJunkTable(sv, jt, count) {
  const funs = [];
  for (let i = 0; i < count; i++) {
    const {head, body} = buildJunkFunction(sv, jt, i);
    funs.push({ idx: i+1, head, body });
  }
  // shuffle
  for (let i = funs.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [funs[i], funs[j]] = [funs[j], funs[i]];
  }
  let lines = [`local ${jt}={}`];
  for (const f of funs) {
    lines.push(`${jt}[${f.idx}]=function(${f.head}) ${f.body} end`);
  }
  return lines;
}

// ── Guards (simplificado, 3 por categoría) ──
function buildGuards() {
  const guards = [];
  const n = emitNumber;
  function BLK(...stmts) {
    const vf = codeVaultName();
    return `local ${vf}=function() ${stmts.join(' ')} end ${vf}()`;
  }
  function err() {
    const ve = codeVaultName();
    return `do local ${ve}=error ${ve}("!") end`;
  }
  function EQ(v,e) { return `if ${v}~=${e} then ${err()} end`; }
  function EQS(v,e) { return `if ${v}~="${e}" then ${err()} end`; }
  // A - strings
  guards.push(BLK(`local _a=string.char(string.byte("Z",1))`, EQS('_a','Z')));
  guards.push(BLK(EQ('#"test"',4)));
  guards.push(BLK(`if string.format then`, EQS('string.format("%d",42)','42'),'end'));
  // B - math
  guards.push(BLK(`if math.sqrt then local _b=math.sqrt(4)`, EQ('math.floor(_b*1000)',2000),'end'));
  guards.push(BLK(EQ('math.abs(-7777)',7777)));
  guards.push(BLK(`if math.pi then`, `if math.pi<3.14 or math.pi>3.15 then ${err()} end`, 'end'));
  // C - arithmetic
  guards.push(BLK(EQ('3+4',7)));
  guards.push(BLK(EQ('6*7',42)));
  guards.push(BLK(EQ('2^10',1024)));
  // D - metatable
  guards.push(BLK(`local _d={} setmetatable(_d,{__newindex=function() ${err()} end}) local _ok=pcall(function() _d[999]=1 end) if _ok then ${err()} end`));
  guards.push(BLK(`local _d2={} local _d3=setmetatable(_d2,{}); if not rawequal(_d2,_d3) then ${err()} end`));
  // E - bit32
  guards.push(BLK(`if bit32 then`, EQ('bit32.bxor(0xAA,0x55)',0xFF),'end'));
  // F - table
  guards.push(BLK(`local _f={10,20,30} local _fc=0 for _,_ in ipairs(_f) do _fc=_fc+1 end`, EQ('_fc',3)));
  // G - closures
  guards.push(BLK(`local _g=10 local function _gf(x) return x*7-3 end`, EQ('_gf(_g)',67)));
  // H - types
  guards.push(BLK(EQS('type(1)','number'),EQS('type({})','table')));
  // I - opaque
  guards.push(BLK(EQ('((2*(2+1))%2)',0)));
  // J - pcall
  guards.push(BLK(`local function _jf() return 42 end local _ok2,_v2=pcall(_jf) if not _ok2 or _v2~=42 then ${err()} end`));
  // K - upvalue
  guards.push(BLK(`local _k=5 local function _kf() return _k*_k end`, EQ('_kf()',25)));
  // L - string byte
  guards.push(BLK(EQ('string.byte("A",1)',65)));
  // shuffle
  for (let i = guards.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [guards[i], guards[j]] = [guards[j], guards[i]];
  }
  return guards;
}

// ── Construye el decodificador principal (estilo CodeVault) ──
function buildCodeVaultVM(source) {
  const minified = minifyLua(source);
  // 1. Alfabeto 10 símbolos
  const sym10 = pickCodec();
  // 2. Clave y sal aleatorios
  const key  = 1 + Math.floor(Math.random() * 253);
  const salt = 1 + Math.floor(Math.random() * 252);
  const srcBytes = Buffer.from(minified, 'utf8');
  const encBytes = srcBytes.map((b,i) => (b + key + i * salt) % 256);
  const encode3 = (b) => sym10[Math.floor(b/100)] + sym10[Math.floor((b%100)/10)] + sym10[b%10];
  const encoded = encBytes.map(encode3).join('');

  // 3. Señuelos (5)
  const N_DECOYS = 5;
  const decoys = [];
  for (let d=0; d<N_DECOYS; d++) {
    const dk = 1+Math.floor(Math.random()*253);
    const ds = 1+Math.floor(Math.random()*252);
    const fakeBytes = srcBytes.map((_,i) => (Math.floor(Math.random()*256) + dk + i*ds) % 256);
    decoys.push({dk, ds, enc: fakeBytes.map(encode3).join('')});
  }

  // 4. Dividir en 4 chunks
  const cs = Math.floor(encoded.length/4);
  const chunks = [encoded.slice(0,cs), encoded.slice(cs,2*cs), encoded.slice(2*cs,3*cs), encoded.slice(3*cs)];

  // 5. Variables
  const vSYM = codeVaultName();
  const vCHK = Array.from({length:4}, () => codeVaultName());
  const vDCY = Array.from({length:N_DECOYS}, () => codeVaultName());
  const vDK  = Array.from({length:N_DECOYS}, () => codeVaultName());
  const vDS  = Array.from({length:N_DECOYS}, () => codeVaultName());
  const vK = codeVaultName(), vS = codeVaultName(), vD = codeVaultName();
  const vI = codeVaultName(), vB = codeVaultName();
  const vFN = codeVaultName(), vTC = codeVaultName(), vFULL = codeVaultName();
  const vMAP = codeVaultName();
  const sv2 = codeVaultName(); // junk sv
  const jt = codeVaultName();

  // ── Armar líneas Lua ──
  let lines = [];

  // tablas de simbolos aleatorias (ruido)
  for (let i=0; i<10; i++) {
    const vt = codeVaultName();
    lines.push(`do local ${vt}={['_']=${emitNumber(Math.floor(Math.random()*0xFFFF))}} ${vt}=nil end`);
  }

  lines.push(`local ${vSYM}="${sym10}"`);
  lines.push(`local ${vK}=${emitNumber(key)}`);
  lines.push(`local ${vS}=${emitNumber(salt)}`);

  // Tarpits en dead paths
  for (let i=0; i<4; i++) {
    lines.push(`if ${opaqueFalse()} then ${tarpit()} end`);
  }

  // Tabla de lookup O(1)
  const mapEntries = sym10.split('').map((c,i) => `["${c}"]=${i}`).join(',');
  lines.push(`local ${vMAP}={${mapEntries}}`);

  // Señuelos (bloques muertos)
  for (let di=0; di<N_DECOYS; di++) {
    const dv = vDCY[di], dkv = vDK[di], dsv = vDS[di];
    const {dk, ds, enc} = decoys[di];
    lines.push(`local ${dv}="${enc}" local ${dkv}=${emitNumber(dk)} local ${dsv}=${emitNumber(ds)}`);
    lines.push(`local _dpcall=pcall(function() local _dtab={}`);
    lines.push(`if rawequal(1,2) then`);
    lines.push(` for _di=1,#${dv},3 do`);
    lines.push(`  local _d0=(${vMAP}[string.sub(${dv},_di,_di)] or 0)`);
    lines.push(`  local _d1=(${vMAP}[string.sub(${dv},_di+1,_di+1)] or 0)`);
    lines.push(`  local _d2=(${vMAP}[string.sub(${dv},_di+2,_di+2)] or 0)`);
    lines.push(`  local _db=_d0*100+_d1*10+_d2`);
    lines.push(`  local _dx=math.floor((_di-1)/3)`);
    lines.push(`  _dtab[#_dtab+1]=string.char(math.floor((_db-(${dkv}+_dx*${dsv}))%256))`);
    lines.push(` end end end) ${dv}=nil`);
  }

  // Chunks
  for (let ci=0; ci<4; ci++) {
    const cv = vCHK[ci], chunk = chunks[ci];
    lines.push(`local ${cv}="${chunk}"`);
    lines.push(`if ${opaqueFalse()} then ${cv}=nil end`);
  }

  lines.push(`local ${vTC}=table.concat`);
  lines.push(`local ${vFULL}=${vTC}({${vCHK.join(',')}})`);
  for (const cv of vCHK) lines.push(`${cv}=nil`);

  // Decode loop
  lines.push(`local ${vD}={}`);
  lines.push(`if ${opaqueTrue()} then`);
  lines.push(`for ${vI}=1,#${vFULL},3 do`);
  // Interwoven check
  lines.push(`  if math.floor((${vI}-1)/3)%7==0 then if type(math.pi)=="string" then ${vK}=(${vK}+137)%256 end end`);
  lines.push(`  local _c0=(${vMAP}[string.sub(${vFULL},${vI},${vI})] or 0)`);
  lines.push(`  local _c1=(${vMAP}[string.sub(${vFULL},${vI}+1,${vI}+1)] or 0)`);
  lines.push(`  local _c2=(${vMAP}[string.sub(${vFULL},${vI}+2,${vI}+2)] or 0)`);
  lines.push(`  local ${vB}=_c0*100+_c1*10+_c2`);
  lines.push(`  local _xi=math.floor((${vI}-1)/3)`);
  lines.push(`  local _kv=(${vK}+0)%${emitNumber(256)}`);
  lines.push(`  ${vD}[#${vD}+1]=string.char(math.floor((${vB}-_kv-_xi*${vS})%256))`);
  lines.push(`  if math.floor((${vI}-1)/3)%7==0 then if rawequal(1,2) then ${vK}=(${vK}+97)%256 end end`);
  lines.push(`end`);
  lines.push(`end`);
  lines.push(`${vMAP}=nil`);
  lines.push(`${vSYM}=nil ${vFULL}=nil`);

  // tarpits post-loop
  for (let i=0; i<2; i++) {
    lines.push(`if ${opaqueFalse()} then ${tarpit()} end`);
  }

  // Ejecución
  lines.push(`local ${vFN}=loadstring(${vTC}(${vD})) or load(${vTC}(${vD}))`);
  lines.push(`${vD}=nil`);
  lines.push(`if ${vFN} then ${vFN}() end`);

  // Ruido final
  for (let i=0; i<10; i++) {
    const vt = codeVaultName();
    lines.push(`do local ${vt}={} ${vt}["_"]=1 ${vt}=nil end`);
  }

  const vmSrc = lines.join('\n');

  // ── Junk + guards intercalados ──
  const junkLines = buildJunkTable(sv2, jt, 60 + Math.floor(Math.random()*40));
  const guards = buildGuards();
  const ng = guards.length;
  const b1 = guards.slice(0, Math.floor(ng/3));
  const b2 = guards.slice(Math.floor(ng/3), Math.floor(2*ng/3));
  const b3 = guards.slice(Math.floor(2*ng/3));
  const p1 = Math.floor(junkLines.length/3);
  const p2 = Math.floor(2*junkLines.length/3);
  const allLines = [
    ...junkLines.slice(0,p1), ...b1,
    ...junkLines.slice(p1,p2), vmSrc, ...b2,
    ...junkLines.slice(p2), ...b3
  ];
  return minifyLua(allLines.join('\n')) + '\n';
}

// ── Reemplazo del modo "diabolical" por CodeVault ──
function obfuscateDiabolical(sourceCode) {
  if (!sourceCode) return '-- Error: No Source';
  return buildCodeVaultVM(sourceCode);
}

// ==================== FUNCIÓN PRINCIPAL EXPORTADA ====================

function obfuscate(sourceCode, mode = 'normal') {
  if (mode === 'diabolical') {
    return obfuscateDiabolical(sourceCode);
  } else {
    return obfuscateNormal(sourceCode);
  }
}

module.exports = { obfuscate };
