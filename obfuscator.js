// ================================================================
// VMMER — Obfuscador Lua completo
// Técnicas: todas las de MoonVeil implementadas desde cero
// ================================================================

const IL_POOL = ["IIlIlI","lvlvlv","vvIIvv","IlIlIl","llIIll","vIvIvI","IvIvIv","llvvll","vvllvv","IIvvII"];
const HANDLER_POOL = ["KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD","fG","hJ","kN"];

function uid() {
  return IL_POOL[Math.floor(Math.random() * IL_POOL.length)] + Math.floor(Math.random() * 9999999);
}

function pickHandler() {
  return HANDLER_POOL[Math.floor(Math.random() * HANDLER_POOL.length)] + Math.floor(Math.random() * 999);
}

// ================================================================
// 1. MANGLE NUMBERS — reemplaza literales numéricos con expresiones
// ================================================================
function mangleNumbers(code) {
  // Evitar reemplazar dentro de strings
  return code.replace(/(?<!["\w])(\d+)(?![\w"])/g, (match, n) => {
    const num = parseInt(n);
    if (num === 0) return '(1-1)';
    if (num === 1) return '(2-1)';
    const a = Math.floor(Math.random() * 500) + 100;
    return `(${num + a}-${a})`;
  });
}

// ================================================================
// 2. MANGLE STRINGS — cifra string literals con string.char
// ================================================================
function mangleStrings(code) {
  // Reemplaza "texto" y 'texto' con string.char(...)
  return code.replace(/"([^"\\]*(\\.[^"\\]*)*)"|'([^'\\]*(\\.[^'\\]*)*)'/g, (match) => {
    const inner = match.slice(1, -1)
      .replace(/\\n/g, '\n').replace(/\\t/g, '\t')
      .replace(/\\"/g, '"').replace(/\\'/g, "'");
    const bytes = [];
    for (let i = 0; i < inner.length; i++) {
      bytes.push(inner.charCodeAt(i));
    }
    if (bytes.length === 0) return '("")';
    return `string.char(${bytes.join(',')})`;
  });
}

// ================================================================
// 3. MANGLE NAMED INDEXES — obj.field → obj["field"]
// ================================================================
function mangleNamedIndexes(code) {
  // Reemplaza accesos a campos: foo.bar → foo["bar"]
  // Cuidado: no reemplazar en comentarios ni strings
  return code.replace(/([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, obj, field) => {
    // No tocar require, module, etc. en ciertas posiciones
    const SKIP = ['string', 'table', 'math', 'io', 'os', 'bit32', 'utf8', 'debug'];
    if (SKIP.includes(obj)) return match; // conservar math.floor, etc.
    return `${obj}["${field}"]`;
  });
}

// ================================================================
// 4. MANGLE SELF-CALLS — obj:method() → obj["method"](obj)
// ================================================================
function mangleSelfCalls(code) {
  return code.replace(/([a-zA-Z_][a-zA-Z0-9_]*):([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, (match, obj, method) => {
    return `${obj}["${method}"](${obj},`;
  });
}

// ================================================================
// 5. MANGLE GLOBALS — reemplaza globals con getfenv()["name"]
// ================================================================
function mangleGlobals(code) {
  const GLOBALS = ['print','warn','error','pairs','ipairs','next','select',
    'tonumber','tostring','type','rawget','rawset','rawequal','rawlen',
    'setmetatable','getmetatable','pcall','xpcall','coroutine',
    'loadstring','load','dofile','loadfile','require',
    'game','workspace','script','Instance','Enum','wait',
    'task','tick','time','delay','spawn'];

  let result = code;
  for (const g of GLOBALS) {
    const regex = new RegExp(`\\b${g}\\b(?!\\s*=)(?![\\w])`, 'g');
    const envVar = uid();
    const occurrences = (result.match(regex) || []).length;
    if (occurrences > 0) {
      // Solo si aparece, crear variable al inicio del bloque donde se use
      result = result.replace(regex, `(getfenv()["${g}"])`);
    }
  }
  return result;
}

// ================================================================
// 6. LIFT CONSTANTS — extrae strings/números a vars locales arriba
// ================================================================
function liftConstants(code, percentage = 25) {
  const lifted = [];
  const threshold = percentage / 100;

  // Levantar strings frecuentes
  const stringMatches = {};
  const strRegex = /"([^"\\]*(\\.[^"\\]*)*)"|'([^'\\]*(\\.[^'\\]*)*)'/g;
  let m;
  while ((m = strRegex.exec(code)) !== null) {
    const key = m[0];
    stringMatches[key] = (stringMatches[key] || 0) + 1;
  }

  let header = '';
  const replacements = {};
  for (const [str, count] of Object.entries(stringMatches)) {
    if (count >= 2 && Math.random() < threshold + 0.3) {
      const varName = uid();
      header += `local ${varName}=${str} `;
      replacements[str] = varName;
    }
  }

  let result = code;
  for (const [orig, varName] of Object.entries(replacements)) {
    result = result.split(orig).join(varName);
  }

  return header + result;
}

// ================================================================
// 7. MANGLE STATEMENTS — renombra variables locales
// ================================================================
function mangleStatements(code) {
  // Encuentra declaraciones local y las renombra
  const varMap = {};
  
  // Primero, recolectar todas las variables locales
  const localRegex = /\blocal\s+([a-zA-Z_][a-zA-Z0-9_,\s]*?)(?=\s*[=\n])/g;
  let match;
  while ((match = localRegex.exec(code)) !== null) {
    const vars = match[1].split(',').map(v => v.trim());
    for (const v of vars) {
      if (v && !varMap[v] && v !== '_') {
        varMap[v] = uid();
      }
    }
  }

  // Reemplazar en el código (cuidado con no tocar strings)
  let result = code;
  for (const [orig, mangled] of Object.entries(varMap)) {
    // Solo reemplazar palabras completas que no estén entre comillas
    const regex = new RegExp(`\\b${orig}\\b`, 'g');
    result = result.replace(regex, mangled);
  }

  return result;
}

// ================================================================
// 8. HOIST LOCALS — mueve locals al inicio de cada función
// ================================================================
function hoistLocals(code) {
  // Mueve todas las declaraciones local al principio del script
  const localDecls = [];
  const localRegex = /^(\s*)(local\s+[a-zA-Z_][a-zA-Z0-9_]*\s*(?:,\s*[a-zA-Z_][a-zA-Z0-9_]*)*)\s*$/gm;
  
  let result = code;
  const hoisted = [];
  
  result = result.replace(/\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\n|;|$)/gm, (match, name) => {
    hoisted.push(`local ${name}`);
    return `${name}`; // quitar el local del lugar original
  });

  if (hoisted.length > 0) {
    result = hoisted.join(' ') + ' ' + result;
  }

  return result;
}

// ================================================================
// 9. DECOMPOSE EXPRESSIONS — rompe expresiones complejas
// ================================================================
function decomposeExpressions(code) {
  // Convierte: a = b + c + d → local _t1=b+c a=_t1+d
  // Simplificado: inserta variables temporales para operaciones
  let result = code;
  const tempCount = [0];
  
  // Descomponer asignaciones con operaciones largas
  result = result.replace(/\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.{40,}?)(?=\n|;)/g, (match, name, expr) => {
    if (expr.includes('function') || expr.includes('if')) return match;
    const tmp = uid();
    return `local ${tmp}=${expr} local ${name}=${tmp}`;
  });

  return result;
}

// ================================================================
// 10. FLATTEN CONTROL FLOW — envuelve en máquina de estados
// ================================================================
function flattenControlFlow(blocks) {
  const sv = uid();
  let lua = `local ${sv}=1 while true do `;
  for (let i = 0; i < blocks.length; i++) {
    if (i === 0) lua += `if ${sv}==1 then ${blocks[i]} ${sv}=${i + 2} `;
    else         lua += `elseif ${sv}==${i + 1} then ${blocks[i]} ${sv}=${i + 2} `;
  }
  lua += `elseif ${sv}==${blocks.length + 1} then break end end `;
  return lua;
}

function applyCFF(code) {
  // Dividir el código en bloques y aplicar CFF
  const lines = code.split('\n').filter(l => l.trim());
  
  // Agrupar en bloques de ~5 líneas
  const blocks = [];
  for (let i = 0; i < lines.length; i += 5) {
    blocks.push(lines.slice(i, i + 5).join(' '));
  }
  
  if (blocks.length <= 1) {
    return flattenControlFlow([code]);
  }
  
  return flattenControlFlow(blocks);
}

// ================================================================
// 11. ENVIRONMENT CHECK — anti-tamper
// ================================================================
function environmentCheck() {
  const errVar = uid();
  return `
local ${errVar}=function() while true do end end
if math.pi<3.14 or math.pi>3.15 then ${errVar}() end
if type(tostring)~="function" then ${errVar}() end
if math.abs(-1)~=1 then ${errVar}() end
if string.char(65)~="A" then ${errVar}() end
if type(game)~="userdata" then ${errVar}() end
if type(workspace)~="userdata" then ${errVar}() end
if type(Instance)~="function" then ${errVar}() end
if type(getfenv)~="function" then ${errVar}() end
`.trim().replace(/\n/g, ' ');
}

// ================================================================
// 12. VIRTUALIZE SCRIPT — VM real con XOR encrypt + loadstring
// ================================================================
function xorEncrypt(str, key) {
  const out = [];
  for (let i = 0; i < str.length; i++) {
    out.push((str.charCodeAt(i) ^ key[i % key.length]) & 0xFF);
  }
  return out;
}

function virtualizeScript(sourceCode) {
  const keyLen = 24;
  const key = Array.from({length: keyLen}, () => Math.floor(Math.random() * 200) + 30);
  const encrypted = xorEncrypt(sourceCode, key);

  const PAYLOAD = uid();
  const KEY     = uid();
  const OUT     = uid();
  const IDX     = uid();
  const BYTE    = uid();
  const KV      = uid();
  const A       = uid();
  const B       = uid();
  const R       = uid();
  const P       = uid();
  const GENV    = uid();
  const LSTR    = uid();
  const ASRT    = uid();

  // Dividir clave en 4 partes de 6 bytes c/u
  const k1 = uid(), k2 = uid(), k3 = uid(), k4 = uid();
  const part = (start, end) => key.slice(start, end).join(',');

  let code = `
local ${k1}={${part(0,6)}}
local ${k2}={${part(6,12)}}
local ${k3}={${part(12,18)}}
local ${k4}={${part(18,24)}}
local ${KEY}={}
for _,v in ipairs(${k1}) do table.insert(${KEY},v) end
for _,v in ipairs(${k2}) do table.insert(${KEY},v) end
for _,v in ipairs(${k3}) do table.insert(${KEY},v) end
for _,v in ipairs(${k4}) do table.insert(${KEY},v) end
local ${PAYLOAD}={${encrypted.join(',')}}
local ${OUT}={}
local ${IDX}=0
for _,${BYTE} in ipairs(${PAYLOAD}) do
  ${IDX}=${IDX}+1
  local ${KV}=${KEY}[(${IDX}-1)%${keyLen}+1]
  local ${R}
  if bit32 then
    ${R}=bit32.bxor(${BYTE},${KV})
  else
    local ${A},${B},${P}=${BYTE},${KV},1
    ${R}=0
    for _i=1,8 do
      local _ab,_bb=${A}%2,${B}%2
      if _ab~=_bb then ${R}=${R}+${P} end
      ${A}=(${A}-_ab)/2
      ${B}=(${B}-_bb)/2
      ${P}=${P}*2
    end
  end
  table.insert(${OUT},string.char(${R}))
end
local ${GENV}=getfenv()
local ${LSTR}=${GENV}[table.concat({"load","string"})]
local ${ASRT}=${GENV}[table.concat({"ass","ert"})]
${ASRT}(${LSTR}(table.concat(${OUT})))()
`.trim().replace(/\n/g, ' ');

  return code;
}

// ================================================================
// 13. EMBED RUNTIME — envuelve la VM en una función runtime
// ================================================================
function embedRuntime(vmCode) {
  const RT    = uid();
  const EXEC  = uid();
  const handlers = Array.from({length: 4}, () => pickHandler());
  const realIdx = Math.floor(Math.random() * 4);
  const DISP  = uid();

  let out = `local ${RT}={} `;
  for (let i = 0; i < 4; i++) {
    if (i === realIdx) {
      out += `local ${handlers[i]}=function() ${vmCode} end `;
    } else {
      out += `local ${handlers[i]}=function() return nil end `;
    }
  }
  out += `local ${DISP}={} `;
  for (let i = 0; i < 4; i++) {
    out += `${DISP}[${i + 1}]=${handlers[i]} `;
  }

  const sv = uid();
  out += `local ${sv}=1 while true do `;
  for (let i = 0; i < 4; i++) {
    if (i === 0) out += `if ${sv}==1 then ${DISP}[${i + 1}]() ${sv}=${i + 2} `;
    else         out += `elseif ${sv}==${i + 1} then ${DISP}[${i + 1}]() ${sv}=${i + 2} `;
  }
  out += `elseif ${sv}==5 then break end end `;

  return out;
}

// ================================================================
// OBFUSCATE NORMAL — técnicas imagen 1
// Mangle statements + named indexes + self calls + globals
// + Lift constants 25% + CFF + Virtualize
// ================================================================
function obfuscateNormal(sourceCode) {
  let code = sourceCode;

  // Paso 1: lift constants (25%)
  code = liftConstants(code, 25);

  // Paso 2: mangle named indexes
  code = mangleNamedIndexes(code);

  // Paso 3: mangle self-calls
  code = mangleSelfCalls(code);

  // Paso 4: mangle globals
  code = mangleGlobals(code);

  // Paso 5: mangle statements (rename vars)
  code = mangleStatements(code);

  // Paso 6: flatten control flow
  code = applyCFF(code);

  // Paso 7: virtualize (XOR + loadstring VM)
  code = virtualizeScript(code);

  return code.replace(/\s+/g, ' ').trim();
}

// ================================================================
// OBFUSCATE DIABOLICAL — técnicas imagen 2 (todo + más)
// Todo lo anterior + embed runtime + mangle numbers + mangle strings
// + decompose expressions + hoist locals + environment check
// + lift constants 50%
// ================================================================
function obfuscateDiabolical(sourceCode) {
  let code = sourceCode;

  // Paso 1: hoist locals
  // code = hoistLocals(code); // puede romper código, omitir en primera versión

  // Paso 2: lift constants (50%)
  code = liftConstants(code, 50);

  // Paso 3: mangle strings
  code = mangleStrings(code);

  // Paso 4: mangle numbers
  code = mangleNumbers(code);

  // Paso 5: mangle named indexes
  code = mangleNamedIndexes(code);

  // Paso 6: mangle self-calls
  code = mangleSelfCalls(code);

  // Paso 7: mangle globals
  code = mangleGlobals(code);

  // Paso 8: mangle statements
  code = mangleStatements(code);

  // Paso 9: decompose expressions
  code = decomposeExpressions(code);

  // Paso 10: flatten control flow
  code = applyCFF(code);

  // Paso 11: environment check (al principio del output final)
  const envCheck = environmentCheck();

  // Paso 12: virtualize
  code = virtualizeScript(code);

  // Paso 13: embed runtime (envuelve todo en dispatch VM)
  code = embedRuntime(code);

  return (envCheck + ' ' + code).replace(/\s+/g, ' ').trim();
}

// ================================================================
// EXPORT
// ================================================================
function obfuscate(sourceCode, mode = 'normal') {
  if (!sourceCode || sourceCode.trim() === '') return '-- Error: codigo vacio';
  return mode === 'diabolical'
    ? obfuscateDiabolical(sourceCode)
    : obfuscateNormal(sourceCode);
}

module.exports = { obfuscate };
  
