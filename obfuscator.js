const HEADER = `--[[ vmmer obfoscator normal++ ]]`;

const IL_POOL = ["IIIIIIII1","vvvvvv1","IIlIlIlI1","lvlvlvlv2","I1","l1","v1","II","ll","vv"];

function generateIlName() {
  return IL_POOL[Math.floor(Math.random() * IL_POOL.length)] + Math.floor(Math.random() * 99999);
}

function heavyMathNormal(n) {
  if (Math.random() < 0.55) return n.toString();
  let a = Math.floor(Math.random() * 3000) + 500;
  let b = Math.floor(Math.random() * 50) + 2;
  return `(((${n}+${a})*${b}/${b})-${a})`;
}

// ==================== STRING BUILDER SIN ASCII ====================

function buildHiddenString(str) {
  const parts = str.split('').map(c => {
    const v = generateIlName();
    return `local ${v}="${c}" ${v}`;
  });

  return `(function() ${parts.join(';')} return table.concat({${parts.map((_,i)=>parts[i].split(' ')[1]).join(',')}}) end)()`;
}

// ==================== MANGLE ====================

function mangleGlobals(code) {
  const globals = ["game","workspace","script","Instance","getfenv"];
  for (let g of globals) {
    const rep = buildHiddenString(g);
    code = code.replace(new RegExp(`\\b${g}\\b`, "g"), `_G[${rep}]`);
  }
  return code;
}

function mangleSelfCalls(code) {
  return code.replace(/(\w+):(\w+)\(/g, (_, obj, method) => {
    return `${obj}[${buildHiddenString(method)}](${obj},`;
  });
}

// ==================== ENCODE ====================

function encodeString(str) {
  const key = Math.floor(Math.random() * 200) + 30;
  return {
    key,
    data: str.split('').map((c, i) => (c.charCodeAt(0) + key + i) % 256)
  };
}

// ==================== MINI DEBUG VM ====================

function buildMiniDebugVM(payload) {
  const enc = encodeString(payload);

  const DATA = generateIlName();
  const OUT = generateIlName();
  const STEP = generateIlName();

  const loadStr = buildHiddenString("loadstring");

  return `
  local ${DATA}={k=${heavyMathNormal(enc.key)},d={${enc.data.map(n=>heavyMathNormal(n)).join(',')}}}
  local ${OUT}={}
  local ${STEP}=0

  for i,v in ipairs(${DATA}.d) do
    ${STEP}=${STEP}+1

    if type(v)~="number" then error("corrupt") end

    local c = string.char((v-${DATA}.k-i)%256)
    ${OUT}[i]=c

    if ${STEP}%50==0 then
      if debug and debug.getinfo then
        local info = debug.getinfo(1)
        if not info then error("debug fail") end
      end
    end
  end

  local _code = table.concat(${OUT})

  local _f = getfenv()[${loadStr}]
  _f(_code)()
  `;
}

// ==================== FLOW ====================

function fakeFlow(code) {
  const state = generateIlName();

  return `
  local ${state}=${heavyMathNormal(1)}
  while true do
    if ${state}==${heavyMathNormal(1)} then
      ${state}=${heavyMathNormal(2)}
    elseif ${state}==${heavyMathNormal(2)} then
      ${code}
      ${state}=${heavyMathNormal(3)}
    elseif ${state}==${heavyMathNormal(3)} then
      break
    end
  end
  `;
}

// ==================== JUNK ====================

function generateJunk(n=20){
  let j="";
  for(let i=0;i<n;i++){
    j+=`local ${generateIlName()}=${heavyMathNormal(Math.floor(Math.random()*200))} `;
  }
  return j;
}

// ==================== MAIN ====================

function obfuscateNormal(source) {
  if (!source) return '-- error';

  let payload = source;

  payload = mangleSelfCalls(payload);
  payload = mangleGlobals(payload);

  let vm = buildMiniDebugVM(payload);
  vm = fakeFlow(vm);

  return `${HEADER} ${generateJunk(20)} ${vm}`
    .replace(/\s+/g," ")
    .trim();
}

module.exports = { obfuscateNormal };
