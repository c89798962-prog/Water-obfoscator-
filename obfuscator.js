// ============================================================
// Vmmer Obfuscator – Robusto para cualquier tamaño
// ============================================================
const HEADER = `--[[ this code it's protected by vmmer obfoscator ]]`;

const IL_POOL  = ["Xa","Yb","Zc","P1","Q2","R3","S4","T5","U6","V7","W8","K9","L0","Mx","Ny","Oz"];
const HANDLER_POOL = ["Aa","Bb","Cc","Dd","Ee","Ff","Gg","Hh","Ii","Jj","Kk","Ll"];

function generateIlName() {
  return IL_POOL[Math.floor(Math.random() * IL_POOL.length)] + Math.floor(Math.random() * 999);
}

function lightMath(n) {
  if (Math.random() < 0.6) return n.toString();
  const mode = Math.floor(Math.random() * 3);
  if (mode === 0) return `(${n}+0)`;
  if (mode === 1) return `(${n}*1)`;
  return `((${n}*2)/2)`;
}

function runtimeString(str) {
  return `string.char(${str.split('').map(c => lightMath(c.charCodeAt(0))).join(',')})`;
}

// ==================== TRANSFORMACIONES SEGURAS ====================
function safeMangleStatements(code) {
  // Solo envuelve líneas que no contengan 'return', 'break' o 'goto' para evitar romper la sintaxis
  return code.replace(/([^;\n]+)/g, (stmt) => {
    const trimmed = stmt.trim();
    if (!trimmed || trimmed.match(/^\s*(return|break|goto|::)\b/)) return stmt;
    return `if true then ${stmt} end`;
  });
}

function liftConstants(code) {
  const map = {0:'_c0',25:'_c25',50:'_c50',75:'_c75',100:'_c100'};
  let pre = '';
  for (const [val, vname] of Object.entries(map)) {
    const regex = new RegExp(`\\b${val}\\b`, 'g');
    if (code.match(regex)) {
      pre += `local ${vname}=${val}; `;
      code = code.replace(regex, vname);
    }
  }
  return pre + code;
}

function buildTrueVMNormal(payloadStr) {
  if (payloadStr.length < 50) return payloadStr; // Si es muy corto, no usar VM

  const STACK = generateIlName();
  const KEY = generateIlName();
  const SALT = generateIlName();
  const seed = Math.floor(Math.random() * 200) + 50;
  const saltVal = Math.floor(Math.random() * 250) + 1;
  let vmCore = `local ${STACK}={} local ${KEY}=${lightMath(seed)} local ${SALT}=${lightMath(saltVal)} `;
  const chunkSize = 15;
  const realChunks = [];
  for (let i = 0; i < payloadStr.length; i += chunkSize) {
    realChunks.push(payloadStr.slice(i, i + chunkSize));
  }
  if (realChunks.length === 0) return payloadStr;

  const poolVars = [];
  const realOrder = [];
  const totalChunks = realChunks.length * 3;
  let currentReal = 0;
  let globalIndex = 0;

  for (let i = 0; i < totalChunks; i++) {
    const memName = generateIlName();
    poolVars.push(memName);
    if (currentReal < realChunks.length && Math.random() > 0.5) {
      realOrder.push(i + 1);
      const chunk = realChunks[currentReal];
      const encryptedBytes = chunk.split('').map((c, j) => {
        const enc = (c.charCodeAt(0) + seed + (globalIndex * saltVal)) % 256;
        globalIndex++;
        return lightMath(enc);
      });
      vmCore += `local ${memName}={${encryptedBytes.join(',')}} `;
      currentReal++;
    } else {
      const fakeBytes = Array.from({length: 10}, () => lightMath(Math.floor(Math.random() * 255)));
      vmCore += `local ${memName}={${fakeBytes.join(',')}} `;
    }
  }

  vmCore += `local _pool={${poolVars.join(',')}} local _order={${realOrder.map(n => lightMath(n)).join(',')}} `;
  vmCore += `local _gIdx=0 for _, idx in ipairs(_order) do for _, byte in ipairs(_pool[idx]) do `;
  vmCore += `table.insert(${STACK}, string.char(math.floor((byte - ${KEY} - _gIdx * ${SALT}) % 256))) _gIdx=_gIdx+1 end end `;
  vmCore += `local _e = table.concat(${STACK}) ${STACK}=nil `;
  vmCore += `getfenv()[${runtimeString("assert")}](getfenv()[${runtimeString("loadstring")}](_e))() `;
  return vmCore;
}

function obfuscateNormal(sourceCode) {
  if (!sourceCode) return '-- Error: No Source';

  let code = sourceCode;

  // 1. Mangle statements (seguro)
  code = safeMangleStatements(code);

  // 2. Mangle numbers
  code = code.replace(/\b(\d+)\b/g, (num) => lightMath(parseInt(num)));

  // 3. Lift constants solo si hay coincidencias
  code = liftConstants(code);

  // 4. Solo aplanar control si no contiene return/break/goto
  if (!code.match(/\b(return|break|goto)\b/)) {
    code = `while true do ${code} break end`;
  }

  // 5. Mangle strings
  code = code.replace(/"([^"]*)"/g, (_, str) => runtimeString(str));

  // 6. Mangle self-calls (si se usa 'self')
  if (code.includes('self')) {
    const selfVar = generateIlName();
    code = `local ${selfVar}=... ` + code.replace(/\bself\b/g, selfVar);
  }

  // 7. Mangle globals
  code = code.replace(/\b(game|workspace|script|Enum)\b/g, (word) => `_G[${runtimeString(word)}]`);

  // 8. Generar VM o pasar directamente
  const vmResult = buildTrueVMNormal(code);

  // Si vmResult es igual al code es porque era muy corto, añadir un loader directo seguro
  if (vmResult === code) {
    // Para scripts muy pequeños, un simple loadstring es suficiente (o devolver el código original)
    return `${HEADER} local _=${generateIlName()} ${runtimeString("loadstring")}(...)() ` + code;
  }

  const junk = generateJunkNormal(40);
  const protections = `local _adT=os.clock() for _=1,100000 do end if os.clock()-_adT>5 then while true do end end `;

  let finalCode = `${HEADER} ${junk} ${protections} ${vmResult}`;
  return finalCode.replace(/\s+/g, " ").trim();
}

module.exports = { obfuscateNormal };
