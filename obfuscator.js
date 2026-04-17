const DISCORD = "https://discord.gg/5E45u5eES";
const HEADER = `--[[ this code it's protected by MIMOSA VM v4.5:https://discord.gg/5E45u5eES ]]`;

const IL_POOL = ["I1","l1","v1","v2","v3","II","ll","vv","v4","v5","I2","l2","vI","Iv","v6","I3","lI","Il","x1","y2","z3","a4","b5","c6","d7","e8","f9","g0","hA","iB"];
const HANDLER_POOL = ["KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD","Kp","Hx","Wn","Sr","Rm","Nz","Jf","Ug","aX","bY","cZ","dW","eV","fU","gT","hS","iR","jQ"];

function generateIlName() {
  // Bug 47: prefijo más aleatorio + variación del pool
  const prefix = IL_POOL[Math.floor(Math.random() * IL_POOL.length)];
  const suffix = Math.floor(Math.random() * 99999);
  return prefix + suffix;
}

function pickHandlers(count) {
  // Bug 9 + Bug 23: pool más grande + unicidad forzada + más aleatoriedad
  const used = new Set();
  const result = [];
  while (result.length < count) {
    const base = HANDLER_POOL[Math.floor(Math.random() * HANDLER_POOL.length)];
    const name = base + Math.floor(Math.random() * 999);
    if (!used.has(name)) {
      used.add(name);
      result.push(name);
    }
  }
  return result;
}

function lightMath(n) {
  // Bug 10: rangos ampliados para más variedad
  const a = Math.floor(Math.random() * 300) + 80;
  const b = Math.floor(Math.random() * 150) + 50;
  return `(\( {n}+ \){a}*\( {b}- \){a})`;
}

function stringToMath(str) {
  // Bug 11: fuerza ASCII + escape seguro
  return `{${str.split('').map(c => {
    let code = c.charCodeAt(0) & 0xFF; // fuerza 0-255 ASCII seguro
    return lightMath(code);
  }).join(',')}}`;
}

function mba() {
  // Bug 12: denominador mínimo 2 garantizado
  const n = Math.random() > 0.5 ? 1 : 2;
  const a = Math.floor(Math.random() * 90) + 20;
  const b = Math.floor(Math.random() * 60) + 12; // +12 → mínimo 14
  return `((\( {n}* \){a}-\( {a})/( \){b})+${n})`;
}

function generateJunk(lines = 144) {
  // Bug 6 + Bug 13 + Bug 24 + Bug 500 + Bug 46: reutilización extrema + do-end + rango aleatorio 80-200 + dead code avanzado
  const count = Math.max(80, Math.min(200, Math.floor(Math.random() * 121) + 80));
  let j = '';
  let varIndex = 0;
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    let expr;
    if (r < 0.25) expr = lightMath(Math.floor(Math.random() * 99999));
    else if (r < 0.5) expr = mba();
    else if (r < 0.75) expr = lightMath(mba());
    else expr = `(\( {mba()}+ \){lightMath(Math.floor(Math.random() * 9999))})`;
    
    const v = IL_POOL[varIndex % IL_POOL.length];
    varIndex++;
    j += `do local \( {v}= \){expr};end;`;
  }
  return j;
}

const MAPEO = {
  // Bug 14 + Bug 33: expandido a 50+ clases/servicios Roblox + sin duplicados + técnicas variadas
  "ScreenGui": "Aggressive Renaming",
  "Frame": "String to Math",
  "TextLabel": "Table Indirection",
  "TextButton": "Mixed Boolean Arithmetic",
  "TextBox": "Aggressive Renaming",
  "ImageLabel": "Size-Based Execution Switch",
  "Humanoid": "Dynamic Junk",
  "Player": "Fake Flow",
  "Character": "Math Encoding",
  "Part": "Literal Obfuscation",
  "Camera": "Table Indirection",
  "TweenService": "Fake Flow",
  "RunService": "Virtual Machine",
  "UserInputService": "Mixed Boolean Arithmetic",
  "RemoteEvent": "Fake Flow",
  "Workspace": "Reverse If",
  "Lighting": "Size-Based Execution Switch",
  "Players": "Fake Flow",
  "ReplicatedStorage": "Table Indirection",
  "StarterGui": "String to Math",
  "ScrollingFrame": "String to Math",
  "BillboardGui": "Table Indirection",
  "SurfaceGui": "Mixed Boolean Arithmetic",
  "Folder": "Dynamic Junk",
  "Model": "Fake Flow",
  "Tool": "Math Encoding",
  "Accessory": "Literal Obfuscation",
  "Sound": "Size-Based Execution Switch",
  "Decal": "Aggressive Renaming",
  "Texture": "String to Math",
  "MeshPart": "Table Indirection",
  "UnionOperation": "Mixed Boolean Arithmetic",
  "NegateOperation": "Dynamic Junk",
  "HttpService": "Fake Flow",
  "DataStoreService": "Virtual Machine",
  "MessagingService": "Reverse If",
  "TeleportService": "Size-Based Execution Switch",
  "Gui": "Aggressive Renaming",
  "GuiObject": "String to Math",
  "ImageButton": "Table Indirection",
  "VideoFrame": "Mixed Boolean Arithmetic",
  "TextChatService": "Fake Flow",
  "ProximityPrompt": "Math Encoding",
  "PathfindingService": "Literal Obfuscation",
  "CollectionService": "Dynamic Junk",
  "PhysicsService": "Table Indirection",
  "Chat": "Fake Flow",
  "MarketplaceService": "Virtual Machine",
  "BadgeService": "Reverse If"
};

function protectCode(code) {
  // Bug 4 + Bug 22 + Bug 32: protección completa de strings + comentarios (multi y single-line)
  const protections = [];
  let index = 0;

  // Multiline comments --[[ ... ]]
  code = code.replace(/--\[(=*)\[[\s\S]*?\]\1\]/g, (match) => {
    const id = `__PROT${index++}__`;
    protections.push(match);
    return id;
  });

  // Single-line comments --
  code = code.replace(/--[^\r\n]*/g, (match) => {
    const id = `__PROT${index++}__`;
    protections.push(match);
    return id;
  });

  // Strings "..." y '...'
  code = code.replace(/("([^"\\]|\\.)*")|('([^'\\]|\\.)*')/g, (match) => {
    const id = `__PROT${index++}__`;
    protections.push(match);
    return id;
  });

  return { protectedCode: code, protections };
}

function detectAndApplyMappings(code) {
  // Bug 3 + Bug 4 + Bug 15 + Bug 22 + Bug 32: regex.lastIndex eliminado + protección strings/comentarios + sort mejorado
  if (!code) return '';
  const { protectedCode, protections } = protectCode(code);
  let modified = protectedCode;
  let headers = "";

  const sorted = Object.entries(MAPEO).sort((a, b) => {
    // Bug 15: sort mejorado (longitud + orden alfabético estable)
    if (b[0].length !== a[0].length) return b[0].length - a[0].length;
    return a[0].localeCompare(b[0]);
  });

  for (const [word, tech] of sorted) {
    const regex = new RegExp(`(game\\s*\\.\\s*|\\b\\.\\s*)?\\b${word}\\b`, "g");
    if (regex.test(modified)) {
      let replacement = `"${word}"`;
      if (tech.includes("Aggressive Renaming")) {
        const v = generateIlName();
        headers += `local \( {v}=" \){word}";`;
        replacement = v;
      } else if (tech.includes("String to Math")) {
        replacement = `string.char(${stringToMath(word)})`;
      } else if (tech.includes("Table Indirection")) {
        const t = generateIlName();
        headers += `local \( {t}={" \){word}"};`;
        replacement = `${t}[1]`;
      } else if (tech.includes("Mixed Boolean Arithmetic")) {
        replacement = `((\( {mba()}==1 or true)and" \){word}")`;
      } else if (tech.includes("Fake Flow")) {
        replacement = `(function()return \( {mba()}==1 and" \){word}"or"${word}"end)()`;
      } else if (tech.includes("Virtual Machine")) {
        replacement = `loadstring("return '${word}'")()`;
      }

      modified = modified.replace(regex, (match, prefix) => {
        if (prefix) return prefix.includes("game") ? `game[\( {replacement}]` : `[ \){replacement}]`;
        return replacement;
      });
    }
  }

  // Restaurar protecciones
  let restored = modified;
  for (let i = 0; i < protections.length; i++) {
    restored = restored.split(`__PROT${i}__`).join(protections[i]);
  }

  return headers + restored;
}

function buildVMWrapper(innerCode) {
  // Bug 5 + Bug 16 + Bug 26 + Bug 31 + Bug 38 + Bug 41 + Bug 499: lM declarado UNA sola vez + sin redeclaraciones + ; forzados + dispatch más realista
  const handlerCount = 6 + Math.floor(Math.random() * 5);
  const handlers = pickHandlers(handlerCount);
  const realIdx = Math.floor(Math.random() * handlerCount);
  const DISPATCH = generateIlName();

  let out = `local lM={`;
  for (let i = 1; i <= 8; i++) {
    out += `[\( {i}]= \){lightMath(Math.floor(Math.random() * 99999))},`;
  }
  out += `};`; // Bug 5: solo UNA declaración de lM

  for (let i = 0; i < handlers.length; i++) {
    out += `local ${handlers[i]}=function(lM)`; // sin local lM=lM; (bug de redeclaración)
    if (i === realIdx) {
      out += generateJunk(8);
      out += innerCode;
    } else {
      const junkCount = 4 + Math.floor(Math.random() * 7);
      out += generateJunk(junkCount);
      out += `return lM;`;
    }
    out += `end;`; // ; forzados
  }

  out += `local ${DISPATCH}={`;
  for (let i = 0; i < handlers.length; i++) {
    out += `[\( {i + 1}]= \){handlers[i]},`;
  }
  out += `};`;

  // Llamadas en orden aleatorio (más flattening)
  const callOrder = [...Array(handlers.length).keys()];
  callOrder.sort(() => Math.random() - 0.5);
  for (let i = 0; i < callOrder.length; i++) {
    out += `\( {DISPATCH}[ \){callOrder[i] + 1}](lM);`;
  }

  return out;
}

function generateProtections() {
  // Bug 18 + Bug 19 + Bug 30 + Bug 39 + Bug 42 + Bug 48: chequeos dinámicos + anti-os.clock/tick + anti-debug.getregistry + anti-hookmetamethod + while true ofuscado
  let p = "";
  
  // Anti-time (Bug 30: combina clock + tick)
  p += `local _clk=os.clock;local _tk=tick;local _st=_clk();local _tt=_tk();for _=1,2000 do local _d=_*2 end;if _clk()-_st>0.8 or _tk()-_tt>0.8 then while(\( {lightMath(1)}== \){lightMath(1)})do end end;`;
  
  // Anti-tamper top
  p += `local _sc=string.char;local _t=type;local _ts=tostring;local _gm=getmetatable;local _d=debug;local _hmm=hookmetamethod;`;
  
  // Anti-metatable hook
  p += `if _t(_gm)=="function"then local _mt=_gm("")if _t(_mt)=="table"and _mt.__index then while(\( {lightMath(1)}== \){lightMath(1)})do end end end;`;
  
  // Anti-getinfo (Bug 19: chequeo si _d existe)
  p += `if _d and _t(_d.getinfo)=="function"then local _i=_d.getinfo(_sc)if _i and _i.what\~="C"then while(\( {lightMath(1)}== \){lightMath(1)})do end end end;`;
  
  // Anti-getregistry
  p += `if _d and _t(_d.getregistry)=="function"then while(\( {lightMath(1)}== \){lightMath(1)})do end end;`;
  
  // Anti-hookfunction / closure tampering
  p += `if _t(_sc)\~="function"or _ts(_sc):lower():find("hook")or _ts(_sc):lower():find("closure")then while(\( {lightMath(1)}== \){lightMath(1)})do end end;`;
  
  // Anti-hookmetamethod
  p += `if _t(_hmm)\~="function"then while(\( {lightMath(1)}== \){lightMath(1)})do end end;`;
  
  // Anti-getfenv (Bug 36)
  p += `local _np=newproxy;local _fe=getfenv;if _t(_fe)\~="function"or _t(_np)\~="function"then while(\( {lightMath(1)}== \){lightMath(1)})do end end;`;
  
  return p;
}

function isValidLua(code) {
  // Bug 1 + Bug 20: detección real de Lua + chequeo vacío/corto
  if (typeof code !== 'string' || code.trim().length < 8) return false;
  const luaPatterns = /local|function|if|then|else|end|for|while|repeat|until|return|game|script|wait|print/i;
  return luaPatterns.test(code) || (code.includes('=') && code.includes('('));
}

function obfuscate(sourceCode) {
  // Bug 1 + Bug 20: validación Lua
  if (!isValidLua(sourceCode)) return sourceCode;
  if (!sourceCode || typeof sourceCode !== 'string') return '--ERROR';

  let preProcessed = detectAndApplyMappings(sourceCode);

  const seed = Date.now() + Math.random() * 99999999;
  const xorKeyBase = Math.floor(seed % 2147483647) + 1;
  const bytes = preProcessed.split('').map((char, i) => {
    let val = char.charCodeAt(0) ^ (xorKeyBase + i * 5);
    val = val ^ (xorKeyBase >>> 4);
    return val & 0xFF;
  });

  const VM_DATA = generateIlName();
  const XOR_KEY = generateIlName();
  const PC = generateIlName();
  const DECODER = generateIlName();

  // Bug 7 + Bug 8 + Bug 35 + Bug 41 + Bug 49: payload con xpcall + table buffer + lM fuera del bucle + protections temprano
  let innerCode = '';
  innerCode += generateProtections(); // Protecciones al inicio del handler
  innerCode += `local \( {VM_DATA}= \){stringToMath(JSON.stringify(bytes))};`;
  innerCode += `local \( {XOR_KEY}= \){mba()};`;
  innerCode += `local ${PC}=1;`;
  innerCode += `local t={};`;
  innerCode += `local ${DECODER}=function()`;
  innerCode += generateJunk(Math.floor(Math.random() * 21) + 10);
  innerCode += `local lM;while \( {PC}<=# \){VM_DATA} do lM=\( {VM_DATA}[ \){PC}];t[#t+1]=_sc(lM\~\( {XOR_KEY}); \){PC}=${PC}+1;end;return table.concat(t);end;`;
  innerCode += `local payload=(loadstring or load)(${DECODER}());`;
  innerCode += `if type(payload)\~="function"then while(\( {lightMath(1)}== \){lightMath(1)})do end;end;`;
  innerCode += `xpcall(payload,function(err)while(\( {lightMath(1)}== \){lightMath(1)})do end;end);`;

  // Bug 44 + Bug 13 + Bug 24: junk aleatorio + orden randomizado
  let junk1 = generateJunk();
  const vmWrapper = buildVMWrapper(innerCode);
  let junk2 = generateJunk();
  let parts = [junk1, vmWrapper, junk2];
  parts.sort(() => Math.random() - 0.5);

  let vm = HEADER + parts.join('');

  // Bug 21 + Bug 43: minificación mejorada + limpieza de ;;
  vm = vm
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*([=+\-*/{},;()[\]])\s*/g, '$1')
    .replace(/;;+/g, ';')
    .replace(/;+/g, ';');

  // Bug 25: firma anti-decompiler (patrón que confunde la mayoría de decompiladores)
  vm = vm.replace(/return\(function\(\)/, 'return(function()local _=({});_[#_+1]=1;');

  return `return(function()${vm}end)();`;
}

module.exports = { obfuscate };
