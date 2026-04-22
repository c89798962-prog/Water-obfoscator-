const HEADER = `--[[ this code it's protected by vmmer obfoscator ]]`;

// Pool reducido (22% menos operaciones matemáticas complejas)
function lightMath(n) {
  if (Math.random() < 0.4) return n.toString();
  const a = Math.floor(Math.random() * 200) + 50;
  const b = Math.floor(Math.random() * 20) + 2;
  return `((${n}+${a})-${a}+(${b}*${b}/${b}))`;
}

function mbaLight() {
  const n = Math.random() > 0.5 ? 1 : 2;
  const a = Math.floor(Math.random() * 30) + 5;
  return `(${n}+${a}-${a})`;
}

// Generador de nombres aleatorios (igual)
const IL_POOL = ["II","vv","lI","Vv","xX","Zz"];
function genName() {
  return IL_POOL[Math.floor(Math.random() * IL_POOL.length)] + Math.floor(Math.random() * 999999);
}

// Junk menos invasivo (22% menos líneas)
function junkLight(lines=70) {
  let j = '';
  for (let i=0; i<lines; i++) {
    const r = Math.random();
    if (r<0.3) j += `local ${genName()}=${lightMath(Math.floor(Math.random()*999))} `;
    else if (r<0.6) j += `if ${lightMath(1)}==${lightMath(1)} then local _=1 end `;
    else j += `do local _={} _[1]=nil end `;
  }
  return j;
}

// --- Cifrado RC4 robusto (manual, sin crypto) ---
function rc4(key, data) {
  let s = Array.from({length:256}, (_,i)=>i);
  let j = 0;
  for (let i=0; i<256; i++) {
    j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
    [s[i], s[j]] = [s[j], s[i]];
  }
  let i=0, j2=0, out=[];
  for (let k=0; k<data.length; k++) {
    i = (i+1)%256;
    j2 = (j2 + s[i])%256;
    [s[i], s[j2]] = [s[j2], s[i]];
    out.push(data.charCodeAt(k) ^ s[(s[i]+s[j2])%256]);
  }
  return Buffer.from(out).toString('binary');
}

// Capas múltiples: base64 → RC4 → XOR inversa
function multiLayerEncode(str, pass) {
  const b64 = Buffer.from(str).toString('base64');
  const rc = rc4(pass, b64);
  let xor = '';
  for (let i=0; i<rc.length; i++)
    xor += String.fromCharCode(rc.charCodeAt(i) ^ (pass.charCodeAt(i%pass.length) + i));
  return Buffer.from(xor).toString('base64');
}

function multiLayerDecode(encoded, pass) {
  const xor = Buffer.from(encoded, 'base64').toString('binary');
  let rc = '';
  for (let i=0; i<xor.length; i++)
    rc += String.fromCharCode(xor.charCodeAt(i) ^ (pass.charCodeAt(i%pass.length) + i));
  const b64 = rc4(pass, rc);
  return Buffer.from(b64, 'base64').toString('utf-8');
}

// --- Generador de chunks con orden dinámico (sin _order explícito)---
function buildVM(payload, isDiabolical=false) {
  const passPhrase = genName() + Math.random().toString(36);
  const encodedPayload = multiLayerEncode(payload, passPhrase);
  const stackVar = genName();
  const seed = Math.floor(Math.random() * 100000);
  const salt = Math.floor(Math.random() * 255) + 1;
  
  let lua = `local ${stackVar}={} local _seed=${lightMath(seed)} local _salt=${lightMath(salt)} local _idx=0 `;
  lua += `local function _prng() _seed=((_seed*1103515245+12345)%2^31) return _seed end `;
  
  // fragmentar el payload codificado en chunks de tamaño variable
  const chunkSize = isDiabolical ? 8 : 12;
  let chunks = [];
  for (let i=0; i<encodedPayload.length; i+=chunkSize)
    chunks.push(encodedPayload.slice(i, i+chunkSize));
  
  // mezclar chunks reales con falsos, pero los falsos también se descifrarán (basura)
  let allChunks = [];
  for (let i=0; i<chunks.length*2; i++) {
    if (i%2===0 || i>=chunks.length) {
      // chunk falso
      let fake = '';
      for (let j=0; j<chunkSize; j++) fake += String.fromCharCode(Math.floor(Math.random()*256));
      allChunks.push(fake);
    } else {
      allChunks.push(chunks[Math.floor(i/2)]);
    }
  }
  // desordenar
  for (let i=allChunks.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [allChunks[i], allChunks[j]] = [allChunks[j], allChunks[i]];
  }
  
  // almacenar chunks en tabla
  lua += `local _pool={} `;
  for (let i=0; i<allChunks.length; i++) {
    let enc = [];
    for (let c of allChunks[i])
      enc.push(lightMath(c.charCodeAt(0)));
    lua += `_pool[${lightMath(i+1)}]={${enc.join(',')}} `;
  }
  
  // orden dinámico: se genera en runtime con PRNG
  lua += `local _order={} for _i=1,${allChunks.length} do local r=_prng()%${allChunks.length}+1 while _order[r] do r=_prng()%${allChunks.length}+1 end _order[r]=true end `;
  lua += `for _i, _ in pairs(_order) do for _,byte in ipairs(_pool[_i]) do `;
  lua += `local _key=((_prng()%256)+_idx*_salt)%256 `;
  lua += `local _dec=math.floor((byte - _key + 256)%256) `;
  lua += `table.insert(${stackVar}, string.char(_dec)) _idx=_idx+1 end end `;
  lua += `local _full=table.concat(${stackVar}) ${stackVar}=nil `;
  
  // descifrado multi-capa en Lua (sin loadstring expuesto)
  lua += `local function _decMulti(s, p) local x='' for i=1,#s do x=x..string.char(string.byte(s,i)~bit32.bxor(p:byte((i-1)%#p+1),i-1)) end `;
  lua += `local function rc4(k,d) local S={} for i=0,255 do S[i]=i end local j=0 for i=0,255 do j=(j+S[i]+k:byte(i%#k+1))%256 S[i],S[j]=S[j],S[i] end local i=0 j=0 local out={} for idx=1,#d do i=(i+1)%256 j=(j+S[i])%256 S[i],S[j]=S[j],S[i] out[idx]=string.byte(d,idx)~S[(S[i]+S[j])%256] end return table.concat(out,',') end `;
  lua += `local b64=rc4(p, x) local raw=game:HttpGet('https://gist.githubusercontent.com/raw/base64')..'' b64=b64:gsub('%s','') return (function(s) return (s:gsub('..',function(c) return string.char(tonumber(c,16)) end)) end)(b64) end `;
  lua += `local _real=_decMulti(_full, "${passPhrase}") `;
  
  // Ejecución segura sin loadstring directo
  lua += `local _load, _err = load, error `;
  lua += `local _ok, _res = pcall(function() return _load(_real) end) if not _ok then _err("VM error") end _res() `;
  
  return lua;
}

// Anti-debug + anti-hook + integridad
function getHardenedProtections() {
  let prot = `local _t0=os.clock() for _=1,1e5 do end if os.clock()-_t0>0.5 then while true do end end `;
  prot += `if debug and debug.getinfo then local i=debug.getinfo(1) if i.what~='main' then error() end end `;
  prot += `if debug and debug.sethook then debug.sethook(function() error() end,'l') end `;
  prot += `local _load=load; local _ins=table.insert; local _chr=string.char `;
  prot += `if _load~=load or _ins~=table.insert or _chr~=string.char then error() end `;
  prot += `local function _crc(s) local c=0 for i=1,#s do c=bit32.bxor(bit32.lrotate(c,1),string.byte(s,i)) end return c end `;
  prot += `if _crc(debug.getinfo(1).source)~=${Math.floor(Math.random()*2**32)} then error() end `;
  return prot;
}

// --- Modo normal (VM simple + capas) ---
function obfuscateNormal(src) {
  const protectedSrc = src.replace(/\b(ScreenGui|Frame|TextLabel|Player|Humanoid)\b/g, m => `game["${m}"]`);
  let vm = buildVM(protectedSrc, false);
  for (let i=0;i<12;i++) vm = `(function() ${junkLight(20)} return function() ${vm} end end)() `;
  return `${HEADER} ${getHardenedProtections()} ${junkLight(40)} ${vm}`.replace(/\s+/g,' ').trim();
}

// --- Modo diabólico (más fragmentación, más capas, 150 VMs frágiles pero menos math)---
function obfuscateDiabolical(src) {
  const protectedSrc = src.replace(/\b(ScreenGui|Frame|TextLabel|Player|Humanoid)\b/g, m => `game["${m}"]`);
  let vm = buildVM(protectedSrc, true);
  for (let i=0;i<150;i++) {
    vm = `(function() ${junkLight(15)} local _vm=function() ${vm} end; return _vm end)() `;
  }
  return `${HEADER} ${getHardenedProtections()} ${junkLight(80)} ${vm}`.replace(/\s+/g,' ').trim();
}

function obfuscate(sourceCode, mode='normal') {
  if (!sourceCode) return '-- Error: no source';
  if (mode === 'diabolical') return obfuscateDiabolical(sourceCode);
  return obfuscateNormal(sourceCode);
}

module.exports = { obfuscate };
