const HEADER = `--[[ this code it's protected by vmmer obfoscator ]]`;

const IL_POOL = ["IIIIIIII1","vvvvvv1","vvvvvvvv2","vvvvvv3","IIlIlIlI1","lvlvlvlv2","I1","l1","v1","v2","v3","II","ll","vv","I2"];
const HANDLER_POOL = ["KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD"];

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

function heavyMathNormal(n) {
  if (Math.random() < 0.3) return n.toString();
  let a = Math.floor(Math.random() * 5000) + 1000;
  let b = Math.floor(Math.random() * 100) + 2;
  let c = Math.floor(Math.random() * 800) + 10;
  let d = Math.floor(Math.random() * 20) + 2;
  return `(((((${n}+${a})*${b})/${b})-${a})+((${c}*${d})/${d})-${c})`;
}

function mbaNormal() {
  let n = Math.random() > 0.5 ? 1 : 2;
  let a = Math.floor(Math.random() * 70) + 15;
  let b = Math.floor(Math.random() * 40) + 8;
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

function runtimeString(str) {
  return `string.char(${str.split('').map(c => heavyMathNormal(c.charCodeAt(0))).join(',')})`;
}

function detectAndApplyMappingsNormal(code) {
  const MAPEO = {
    "ScreenGui":"Aggressive Renaming",
    "Frame":"String to Math",
    "TextLabel":"Table Indirection",
    "TextButton":"Mixed Boolean Arithmetic",
    "Humanoid":"Dynamic Junk",
    "Player":"Fake Flow"
  };

  let modified = code, headers = "";

  for (const [word, tech] of Object.entries(MAPEO)) {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    if (regex.test(modified)) {
      let replacement = `"${word}"`;

      if (tech.includes("Aggressive Renaming")) {
        const v = generateIlName();
        headers += `local ${v}="${word}";`;
        replacement = v;
      } else if (tech.includes("String to Math")) {
        replacement = `string.char(${word.split('').map(c => heavyMathNormal(c.charCodeAt(0))).join(',')})`;
      } else if (tech.includes("Mixed Boolean Arithmetic")) {
        replacement = `((${mbaNormal()}==1 or true)and"${word}")`;
      }

      regex.lastIndex = 0;
      modified = modified.replace(regex, () => `game[${replacement}]`);
    }
  }

  return headers + modified;
}

function buildTrueVMNormal(payloadStr) {
  const STACK = generateIlName();
  const KEY = generateIlName();
  const SALT = generateIlName();

  const seed = Math.floor(Math.random() * 200) + 50;
  const saltVal = Math.floor(Math.random() * 250) + 1;

  let vmCore = `local ${STACK}={} local ${KEY}=${heavyMathNormal(seed)} local ${SALT}=${heavyMathNormal(saltVal)} `;

  const chunkSize = 15;
  let realChunks = [];

  for (let i = 0; i < payloadStr.length; i += chunkSize) {
    realChunks.push(payloadStr.slice(i, i + chunkSize));
  }

  let poolVars = [];
  let realOrder = [];
  let totalChunks = realChunks.length * 3;
  let currentReal = 0;
  let globalIndex = 0;

  for (let i = 0; i < totalChunks; i++) {
    let memName = generateIlName();
    poolVars.push(memName);

    if (currentReal < realChunks.length && Math.random() > 0.5) {
      realOrder.push(i + 1);

      let chunk = realChunks[currentReal];
      let encryptedBytes = [];

      for (let j = 0; j < chunk.length; j++) {
        let enc = (chunk.charCodeAt(j) + seed + (globalIndex * saltVal)) % 256;
        encryptedBytes.push(heavyMathNormal(enc));
        globalIndex++;
      }

      vmCore += `local ${memName}={${encryptedBytes.join(',')}} `;
      currentReal++;
    } else {
      let fakeBytes = [];
      for (let j = 0; j < 10; j++) {
        fakeBytes.push(heavyMathNormal(Math.floor(Math.random() * 255)));
      }
      vmCore += `local ${memName}={${fakeBytes.join(',')}} `;
    }
  }

  vmCore += `local _pool={${poolVars.join(',')}} local _order={${realOrder.map(n => heavyMathNormal(n)).join(',')}} `;
  vmCore += `local _gIdx=0 for _, idx in ipairs(_order) do for _, byte in ipairs(_pool[idx]) do `;
  vmCore += `table.insert(${STACK}, string.char(math.floor((byte - ${KEY} - _gIdx * ${SALT}) % 256))) _gIdx=_gIdx+1 end end `;
  vmCore += `local _e = table.concat(${STACK}) ${STACK}=nil `;

  const ASSERT = `getfenv()[${runtimeString("assert")}]`;
  const LOADSTRING = `getfenv()[${runtimeString("loadstring")}]`;

  vmCore += `${ASSERT}(${LOADSTRING}(_e))() `;

  return vmCore;
}

function getNormalProtections() {
  return `local _adT=os.clock() for _=1,100000 do end if os.clock()-_adT>5 then while true do end end `;
}

function obfuscateNormal(sourceCode) {
  if (!sourceCode) return '-- Error: No Source';

  const protections = getNormalProtections();
  const payload = detectAndApplyMappingsNormal(sourceCode);

  let vm = buildTrueVMNormal(payload);

  return `${HEADER} ${generateJunkNormal(40)} ${protections} ${vm}`
    .replace(/\s+/g, " ")
    .trim();
}

module.exports = { obfuscateNormal };
