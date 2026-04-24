const HEADER = `--[[ this code it's protected by vmmer obfoscator ]]`;

// ==================== NAMING (sin IL_POOL) ====================
// Nombres aleatorios con letras mixtas — nada parecido a MoonVeil
const _usedVars = new Set();
const ALPHA = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function generateVarName(len = 7) {
  let name;
  do {
    // Primera letra siempre es letra (válido en Lua)
    name = ALPHA[Math.floor(Math.random() * ALPHA.length)] +
      Array.from({ length: len - 1 }, () => {
        const pick = Math.random();
        if (pick < 0.7) return ALPHA[Math.floor(Math.random() * ALPHA.length)];
        return Math.floor(Math.random() * 10).toString();
      }).join('');
  } while (_usedVars.has(name));
  _usedVars.add(name);
  return name;
}

function resetVars() { _usedVars.clear(); }

// ==================== MATH REDUCIDO 70% ====================
// Solo 30% de las veces aplica math; el resto es directo
function lightMath(n) {
  if (Math.random() < 0.70) return n.toString(); // 70% directo, sin math
  // Operaciones simples únicamente
  const r = Math.random();
  if (r < 0.33) {
    const a = Math.floor(Math.random() * 10) + 1;
    return `(${n + a}-${a})`;
  } else if (r < 0.66) {
    const b = Math.floor(Math.random() * 4) + 2;
    return `(${n * b}/${b})`;
  } else {
    return `(${n}+0)`;
  }
}

// ==================== MANGLE NUMBERS ====================
function mangleNumber(n) {
  return lightMath(n);
}

// ==================== MANGLE STRINGS ====================
function mangleString(str) {
  if (Math.random() < 0.45) return `"${str}"`; // a veces literal
  return `string.char(${[...str].map(c => lightMath(c.charCodeAt(0))).join(',')})`;
}

// ==================== LIFT CONSTANTS ====================
// Sube strings repetidas a variables locales al inicio
function liftConstants(code) {
  const freq = {};
  const strRe = /"([^"\\]{4,})"/g;
  let m;
  while ((m = strRe.exec(code)) !== null) {
    freq[m[1]] = (freq[m[1]] || 0) + 1;
  }

  let header = '';
  const map = {};
  for (const [val, count] of Object.entries(freq)) {
    if (count >= 1) {
      const v = generateVarName();
      map[val] = v;
      header += `local ${v}="${val}" `;
    }
  }

  let result = code;
  for (const [val, v] of Object.entries(map)) {
    const escaped = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(`"${escaped}"`, 'g'), v);
  }

  return header + result;
}

// ==================== MANGLE GLOBALS ====================
// Captura globals de Lua/Roblox en locales para que no sean visibles
function mangleGlobals(code) {
  const globals = [
    'print', 'math', 'string', 'table', 'os', 'type',
    'pairs', 'ipairs', 'next', 'tostring', 'tonumber',
    'game', 'workspace', 'script', 'pcall', 'error',
    'setmetatable', 'getmetatable', 'rawget', 'rawset'
  ];

  let header = '';
  let result = code;

  for (const g of globals) {
    if (new RegExp(`\\b${g}\\b`).test(result)) {
      const v = generateVarName();
      header += `local ${v}=${g} `;
      result = result.replace(new RegExp(`\\b${g}\\b`, 'g'), v);
    }
  }

  return header + result;
}

// ==================== MANGLE NAMED INDEXES ====================
// Reemplaza .propiedad con [string.char(...)] aleatoriamente
function mangleNamedIndexes(code) {
  return code.replace(/\.([a-zA-Z_][a-zA-Z0-9_]*)\b/g, (match, prop) => {
    if (Math.random() < 0.5) {
      return `[${mangleString(prop)}]`;
    }
    return match;
  });
}

// ==================== MANGLE SELF-CALLS ====================
// obj:Method(args) → (function(s,...) return s.Method(s,...) end)(obj, args)
function mangleSelfCalls(code) {
  return code.replace(/(\b\w+\b):(\b\w+\b)\(([^)]*)\)/g, (match, obj, method, args) => {
    if (Math.random() < 0.45) {
      const s = generateVarName();
      const argStr = args.trim() ? `, ${args}` : '';
      return `(function(${s}${args.trim() ? ',...' : ''}) return ${s}.${method}(${s}${args.trim() ? ',...' : ''}) end)(${obj}${argStr})`;
    }
    return match;
  });
}

// ==================== MANGLE STATEMENTS ====================
// Envuelve bloques de asignación en do...end
function mangleStatements(code) {
  return code.replace(/(local \w+ = [^\n]+)/g, (match) => {
    if (Math.random() < 0.4) return `do ${match} end`;
    return match;
  });
}

// ==================== FLATTEN CONTROL FLOW ====================
// Inserta variables de control redundantes en ifs
function flattenControlFlow(code) {
  const cond = generateVarName();
  const prefix = `local ${cond}=true `;
  // Agrega condiciones tautológicas a algunos if
  const modified = code.replace(/\bif\b/g, () =>
    Math.random() < 0.35 ? `if ${cond} and` : 'if'
  );
  return prefix + modified;
}

// ==================== DECOMPOSE EXPRESSIONS ====================
// Divide llamadas encadenadas en variables temporales
function decomposeExpressions(code) {
  // Extrae sub-expresiones de operaciones aritméticas largas
  return code.replace(/\(([^()]{20,})\)/g, (match, inner) => {
    if (Math.random() < 0.4) {
      const tmp = generateVarName();
      // No podemos hacer declaraciones inline aquí de forma segura,
      // así que devolvemos el match original pero reducido
      return match;
    }
    return match;
  });
}

// ==================== HOIST LOCALS ====================
// Declara locales al inicio del bloque con valor nil
function hoistLocals(code) {
  const found = [];
  const cleaned = code.replace(/\blocal (\w+)\b(?=\s*=)/g, (match, name) => {
    if (!found.includes(name)) found.push(name);
    return `local ${name}`;
  });

  if (found.length === 0) return code;
  const hoistLine = `local ${found.join(', ')} `;
  return hoistLine + cleaned;
}

// ==================== EMBED RUNTIME ====================
// Inyecta un entorno de ejecución propio
function embedRuntime() {
  const env = generateVarName();
  const G   = generateVarName();
  return (
    `local ${G}=_G or _ENV ` +
    `local ${env}=setmetatable({},{__index=${G},__newindex=${G}}) `
  );
}

// ==================== ENVIRONMENT CHECK ====================
// Detecta entornos de debug/ejecución sospechosos
function environmentCheck() {
  const t = generateVarName();
  const i = generateVarName();
  const limit = Math.floor(Math.random() * 30000) + 20000;
  return (
    `local ${t}=os.clock() ` +
    `for ${i}=1,${limit} do end ` +
    `if os.clock()-${t}>4 then ` +
    `  while true do end ` +
    `end `
  );
}

// ==================== VIRTUALIZE SCRIPT ====================
// Cifra el payload real, lo descifra y lo ejecuta en runtime
function virtualizeScript(payloadStr) {
  const seed   = Math.floor(Math.random() * 200) + 50;
  const salt   = Math.floor(Math.random() * 100) + 1;
  const stack  = generateVarName();
  const key    = generateVarName();
  const saltV  = generateVarName();
  const dec    = generateVarName();
  const ls     = generateVarName();

  let vmCode = `local ${key}=${seed} local ${saltV}=${salt} local ${stack}={} `;

  const chunkSize = 14;
  let chunks = [];
  for (let i = 0; i < payloadStr.length; i += chunkSize) {
    chunks.push(payloadStr.slice(i, i + chunkSize));
  }

  // Mezclamos chunks reales con falsos (1 falso por cada 2 reales)
  let gi = 0;
  const realVars = [];
  const allVars  = [];

  for (let ci = 0; ci < chunks.length; ci++) {
    // Chunk real
    const rv = generateVarName();
    realVars.push(rv);
    allVars.push({ v: rv, real: true });

    const bytes = [];
    for (let j = 0; j < chunks[ci].length; j++) {
      const enc = (chunks[ci].charCodeAt(j) + seed + gi * salt) % 256;
      bytes.push(lightMath(enc));
      gi++;
    }
    vmCode += `local ${rv}={${bytes.join(',')}} `;

    // Un chunk falso cada 2 reales
    if (ci % 2 === 0) {
      const fv = generateVarName();
      allVars.push({ v: fv, real: false });
      const fakeBytes = Array.from({ length: 8 }, () => lightMath(Math.floor(Math.random() * 255)));
      vmCode += `local ${fv}={${fakeBytes.join(',')}} `;
    }
  }

  // Decodificación usando solo los vars reales (en orden)
  vmCode += `local ${dec}="" local _gi=0 `;
  for (const rv of realVars) {
    vmCode += `for _,_b in next,${rv} do ${dec}=${dec}..string.char(((_b-${key}-_gi*${saltV})%256+256)%256) _gi=_gi+1 end `;
  }

  vmCode += `local ${ls}=loadstring or load assert(${ls}(${dec}))() `;
  return vmCode;
}

// ==================== JUNK REDUCIDO ====================
function generateJunk(lines = 15) {
  let j = '';
  const ops = [
    () => `local ${generateVarName()}=${lightMath(Math.floor(Math.random() * 100))} `,
    () => `do local ${generateVarName()}=nil end `,
    () => `if type(nil)=="number" then local _=1 end `,
    () => `if false then local ${generateVarName()}=1 end `,
  ];
  for (let i = 0; i < lines; i++) {
    j += ops[Math.floor(Math.random() * ops.length)]();
  }
  return j;
}

// ==================== MAIN ====================
function obfuscateNormal(sourceCode) {
  if (!sourceCode) return '-- Error: No Source';

  resetVars();

  // Pipeline de técnicas (orden importa)
  let code = sourceCode;

  code = mangleGlobals(code);        // Mangle Globals
  code = mangleNamedIndexes(code);   // Mangle Named Indexes
  code = mangleSelfCalls(code);      // Mangle Self-Calls
  code = flattenControlFlow(code);   // Flatten Control Flow
  code = mangleStatements(code);     // Mangle Statements

  // Embed runtime + environment check
  const runtime = embedRuntime();
  const envCheck = environmentCheck();

  // Virtualize (cifra el código procesado)
  const vm = virtualizeScript(code);

  // Lift constants del VM output
  const lifted = liftConstants(vm);

  // Junk reducido
  const junk = generateJunk(15);

  return `${HEADER} ${junk}${runtime}${envCheck}${lifted}`
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = { obfuscateNormal };
    
