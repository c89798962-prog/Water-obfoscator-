const DISCORD = "https://discord.gg/UttE8VYAY"
const HEADER = `--[[ this code it's protected by water obfoscator:${DISCORD} ]]`

const IL_POOL = ["IIIIIIII1", "vvvvvv1", "vvvvvvvv2", "vvvvvv3", "IIlIlIlI1", "lvlvlvlv2", "I1","l1","v1","v2","v3","II","ll","vv", "I2"]
const HANDLER_POOL = ["KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD"]

function generateIlName() {
  return IL_POOL[Math.floor(Math.random() * IL_POOL.length)] + Math.floor(Math.random() * 99999)
}

function pickHandlers(count) {
  const used = new Set()
  const result = []
  while (result.length < count) {
    const base = HANDLER_POOL[Math.floor(Math.random() * HANDLER_POOL.length)]
    const name = base + Math.floor(Math.random() * 99)
    if (!used.has(name)) { used.add(name); result.push(name) }
  }
  return result
}

function heavyMath(n) {
  let a = Math.floor(Math.random() * 3000) + 500
  let b = Math.floor(Math.random() * 50) + 2
  let c = Math.floor(Math.random() * 800) + 10
  let d = Math.floor(Math.random() * 20) + 2
  return `(((((${n}+${a})*${b})/${b})-${a})+((${c}*${d})/${d})-${c})`
}

function mba() {
  let n = Math.random() > 0.5 ? 1 : 2, a = Math.floor(Math.random() * 70) + 15, b = Math.floor(Math.random() * 40) + 8;
  return `((${n}*${a}-${a})/(${b}+1)+${n})`;
}

// MAPEO AMPLIADO: Ahora incluye la eliminación de loadstring y HttpGet
const MAPEO = {
  "ScreenGui":"Aggressive Renaming","Frame":"String to Math","TextLabel":"Table Indirection",
  "TextButton":"Mixed Boolean Arithmetic","Humanoid":"Dynamic Junk","Player":"Fake Flow",
  "RunService":"Virtual Machine","TweenService":"Fake Flow","Players":"Fake Flow",
  "loadstring":"VM_EXEC_INTERNAL", // Sin rastro de la palabra
  "HttpGet":"NET_FETCH_INTERNAL"   // Sin rastro de la palabra
};

function detectAndApplyMappings(code) {
  let modified = code, headers = "";
  for (const [word, tech] of Object.entries(MAPEO)) {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    if (regex.test(modified)) {
      let replacement = `"${word}"`;
      if (tech === "VM_EXEC_INTERNAL" || tech === "NET_FETCH_INTERNAL") {
        // Ofuscación total de la función de carga
        const bytes = word.split('').map(c => heavyMath(c.charCodeAt(0))).join(',');
        replacement = `string.char(${bytes})`;
        modified = modified.replace(regex, (match) => `getfenv()[${replacement}]`);
      } else if (tech === "Aggressive Renaming") {
        const v = generateIlName(); headers += `local ${v}="${word}";`; replacement = v;
        modified = modified.replace(regex, (match) => `game[${replacement}]`);
      } else {
        modified = modified.replace(regex, (match) => `game["${match}"]`);
      }
    }
  }
  return headers + modified;
}

function generateJunk(lines = 100) {
  let j = ''
  for (let i = 0; i < lines; i++) {
    const r = Math.random()
    if (r < 0.3) j += `local ${generateIlName()}=${heavyMath(Math.floor(Math.random() * 999))} `
    else if (r < 0.6) j += `local ${generateIlName()}=string.char(${heavyMath(Math.floor(Math.random()*255))}) `
    else j += `if not(${heavyMath(1)}==${heavyMath(1)}) then local x=1 end `
  }
  return j
}

function applyCFF(blocks) {
  const stateVar = generateIlName()
  let lua = `local ${stateVar}=${heavyMath(1)} while true do `
  for (let i = 0; i < blocks.length; i++) {
    lua += `if ${stateVar}==${heavyMath(i + 1)} then ${blocks[i]} ${stateVar}=${heavyMath(i + 2)} `
  }
  lua += `elseif ${stateVar}==${heavyMath(blocks.length + 1)} then break end end `
  return lua
}

// TRUE VM: Reconstrucción de URL/Código con Cifrado XOR y Ejecución mediante Máquina Virtual
function buildTrueVM(payloadStr) {
  const STACK = generateIlName(); const PTR = generateIlName();
  const CHUNK_IDX = generateIlName(); const KEY = generateIlName();
  
  const p = Math.ceil(payloadStr.length / 4);
  const chunks = [payloadStr.slice(0, p), payloadStr.slice(p, p*2), payloadStr.slice(p*2, p*3), payloadStr.slice(p*3)].filter(s => s.length > 0);
  const seed = Math.floor(Math.random() * 150) + 50;

  let vmCore = `local ${STACK}={} local ${KEY}=${heavyMath(seed)} `;
  let memVars = []; let globalPos = 0;

  chunks.forEach((chunk) => {
    const memName = generateIlName(); memVars.push(memName);
    const enc = chunk.split('').map(c => {
      let b = c.charCodeAt(0) ^ (seed + globalPos * 2);
      globalPos++; return b;
    });
    vmCore += `local ${memName}={${enc.map(b => heavyMath(b)).join(',')}} `;
  });

  vmCore += `local _pool={${memVars.join(',')}} local _pos=0 `;
  vmCore += `for i=1,#_pool do local _m=_pool[i] for ${PTR}=1,#_m do `;
  vmCore += `table.insert(${STACK}, string.char(bit32.bxor(_m[${PTR}], ${KEY}+(_pos*2)))) _pos=_pos+1 end end `;
  
  vmCore += `local _res = table.concat(${STACK}) ${STACK}=nil `;
  
  // ELIMINACIÓN DE LOADSTRING: Usamos un "Virtual Executor" dinámico
  const loadBytes = "loadstring".split('').map(c => heavyMath(c.charCodeAt(0))).join(',');
  const httpBytes = "HttpGet".split('').map(c => heavyMath(c.charCodeAt(0))).join(',');
  
  vmCore += `local _VE = getfenv()[string.char(${loadBytes})] `;
  if (payloadStr.includes("http")) {
    vmCore += `local _NF = game[string.char(${httpBytes})] `;
    vmCore += `assert(_VE(_NF(game, _res)))() `;
  } else {
    vmCore += `assert(_VE(_res))() `;
  }
  
  return vmCore;
}

function buildDoubleVM(payloadStr) {
  const innerVM = buildTrueVM(payloadStr);
  return buildSingleVM(innerVM, 7);
}

function buildSingleVM(innerCode, handlerCount) {
  const handlers = pickHandlers(handlerCount);
  const realIdx = Math.floor(Math.random() * handlerCount);
  const DISPATCH = generateIlName();
  let out = `local lM={} `;
  for (let i = 0; i < handlers.length; i++) {
    const shadow = `local lM=lM;`;
    if (i === realIdx) out += `local ${handlers[i]}=function(lM) ${shadow} ${generateJunk(10)} ${innerCode} end `;
    else out += `local ${handlers[i]}=function(lM) ${shadow} ${generateJunk(5)} end `;
  }
  out += `local ${DISPATCH}={`
  for (let i = 0; i < handlers.length; i++) out += `[${heavyMath(i + 1)}]=${handlers[i]},`
  out += `} `
  let exec = handlers.map((_, i) => `${DISPATCH}[${heavyMath(i + 1)}](lM)`);
  out += applyCFF(exec);
  return out;
}

// TRIPLE VM: La Máquina Virtual Maestra que orquesta todo el flujo
function buildTripleVM(payloadStr) {
  const innerVM = buildDoubleVM(payloadStr);
  const handlers = pickHandlers(8);
  const realH = handlers[Math.floor(Math.random() * handlers.length)];
  
  let vm = `local lM = { r = {}, i = {}, p = 1 }; local lM=lM; `;
  vm += `lM.i = { `;
  for (let i = 0; i < 12; i++) {
    vm += `{ OP = "${handlers[Math.floor(Math.random()*handlers.length)]}", A = ${heavyMath(i)} }, `;
  }
  vm += `{ OP = "${realH}", A = "EXEC" }, `;
  vm += `}; `;

  handlers.forEach(h => {
    if (h === realH) {
      vm += `local ${h} = function(lM) local lM=lM; if lM.i[lM.p].A == "EXEC" then ${innerVM} end lM.p = lM.p + 1; return lM; end `;
    } else {
      vm += `local ${h} = function(lM) local lM=lM; lM.p = lM.p + 1; return lM; end `;
    }
  });

  vm += `while lM.p <= #lM.i do local _op = lM.i[lM.p].OP `;
  handlers.forEach((h, idx) => {
    if (idx === 0) vm += `if _op == "${h}" then lM = ${h}(lM) `;
    else vm += `elseif _op == "${h}" then lM = ${h}(lM) `;
  });
  vm += `end end `;
  return vm;
}

function getExtraProtections() {
  return `local _t1=os.clock() for _=1,10000 do local _x=math.sin(_) end if os.clock()-_t1>2 then while true do end end if getmetatable(_G) then while true do end end `;
}

function obfuscate(sourceCode) {
  if (!sourceCode) return '--ERROR';
  const antiDebug = `local _clk=os.clock local _t=_clk() for _=1,150000 do end if os.clock()-_t>5.5 then while true do end end `;
  const extra = getExtraProtections();
  
  let payload = "";
  const isLoadstringRegex = /loadstring\s*\(\s*game\s*:\s*HttpGet\s*\(\s*["']([^"']+)["']\s*\)\s*\)\s*\(\s*\)/i;
  const match = sourceCode.match(isLoadstringRegex);

  if (match) {
    payload = match[1];
  } else {
    payload = detectAndApplyMappings(sourceCode);
  }

  const finalVM = buildTripleVM(payload);
  const result = `${HEADER} ${generateJunk(50)} ${antiDebug} ${extra} ${finalVM}`;
  return result.replace(/\s+/g, " ").trim();
}

module.exports = { obfuscate };
  
