const HEADER = `--[[ protected by vvmer v7 | discord:https://discord.gg/AAVKHtbxS ]]`

const IL_POOL = ["IIIIIIII1", "vvvvvv1", "vvvvvvvv2", "vvvvvv3", "IIlIlIlI1", "lvlvlvlv2", "I1","l1","v1","v2","v3","II","ll","vv", "I2"]
const H_POOL = ["KQ","HF","W8","SX","Rj","nT","pL","qZ","mV","xB","yC","wD"]

const gn = () => IL_POOL[Math.floor(Math.random() * IL_POOL.length)] + Math.floor(Math.random() * 9999)
const heavyMath = (n) => {
    const a = Math.floor(Math.random() * 2000) + 500;
    const b = Math.floor(Math.random() * 30) + 2;
    return `(((${n}+${a})*${b})/${b}-${a})`;
}
const sc = (s) => `string.char(${Array.from(s).map(c => heavyMath(c.charCodeAt(0))).join(',')})`;

// --- SECCIÓN 1: ANTI-ALL (FlameDumper, EVM, Hooks, Environment) ---
function buildAntiAll() {
    return `
    local _err = function() while true do end end
    -- Anti FlameCoder Timing
    local function _det()
        if not (task and os) then return false end
        local t = os.clock()
        task.wait(0.1)
        return (os.clock() - t) < 0.05
    end
    if _det() then _err() end

    -- Anti FlameDumperV2 & Hook Detection
    local _s1 = _G.LuraphContinue or _G.__FLAMEDUMPER_REQUIRE_ONLY
    local _s3 = debug and debug.gethook and debug.gethook()
    if _s1 or (utf8 or {}).graphemes or _s3 or _G._VERSION == "Lua 5.3" then _err() end

    -- Anti getgenv & Environment Spoofing
    local _ok = pcall(function() return game.PlaceId end)
    if not _ok or not game or rawget(getfenv(), "getgenv") ~= nil then 
        -- Validar si es un entorno real de ejecutor, si no, crash
    else 
        _err() 
    end

    -- Check math.pi (Sanity check)
    if math.floor(math.pi*100) ~= 314 then _err() end
    `.replace(/\s+/g, ' ');
}

// --- SECCIÓN 2: LA MÁQUINA VIRTUAL (VMMER7 CORE) ---
function buildVMMER7(payload, isUrl) {
    const STACK = gn(); const KEY = gn(); const SALT = gn();
    const IP = gn(); const INSTR = gn(); const ENV = gn();
    
    const seed = Math.floor(Math.random() * 150) + 50;
    const saltVal = Math.floor(Math.random() * 100) + 1;

    // Bytecode compilation (XOR + Affine)
    let encryptedChunks = [];
    const chunkSize = 10;
    for (let i = 0; i < payload.length; i += chunkSize) {
        let chunk = payload.slice(i, i + chunkSize);
        let bytes = Array.from(chunk).map((c, idx) => {
            return (c.charCodeAt(0) + seed + (i + idx) * saltVal) % 256;
        });
        encryptedChunks.push(bytes);
    }

    let lua = `local ${ENV} = getfenv(0) `;
    lua += `local ${KEY} = (string.byte(tostring(math.pi),1)-51)+${heavyMath(seed)} `;
    lua += `local ${SALT} = ${heavyMath(saltVal)} `;
    lua += `local ${STACK} = {} `;

    // Pool de datos cifrados
    encryptedChunks.forEach((chunk, i) => {
        lua += `local _c${i} = {${chunk.map(heavyMath).join(',')}} `;
    });

    lua += `local _pool = {${encryptedChunks.map((_, i) => `_c${i}`).join(',')}} `;

    // Intérprete de la VM
    lua += `
    local _res = ""
    for _i=1, #_pool do
        local _ch = _pool[_i]
        for _j=1, #_ch do
            local _b = _ch[_j]
            local _real = (_b - ${KEY} - ((_i-1)*${chunkSize} + (_j-1)) * ${SALT}) % 256
            _res = _res .. string.char(math.floor(_real))
        end
    end
    `;

    // Lógica de ejecución (URL vs Script)
    const LOAD = `rawget(${ENV}, ${sc("loadstring")})`;
    const GAME = `rawget(${ENV}, ${sc("game")})`;
    const HTTP = sc("HttpGet");

    if (isUrl) {
        lua += `
        local _co = coroutine.create(function()
            local _src = ${GAME}[${HTTP}](${GAME}, _res)
            ${LOAD}(_src)()
        end)
        coroutine.resume(_co)
        `;
    } else {
        lua += `
        local _co = coroutine.create(function()
            ${LOAD}(_res)()
        end)
        coroutine.resume(_co)
        `;
    }

    return lua.replace(/\s+/g, ' ');
}

// --- SECCIÓN 3: WRAPPERS Y HANDLERS (ESTILO VMMER7) ---
function wrapLayers(code) {
    const state = gn();
    const h1 = H_POOL[Math.floor(Math.random() * H_POOL.length)] + "v1";
    const h2 = H_POOL[Math.floor(Math.random() * H_POOL.length)] + "v2";

    return `
    local ${h1}, ${h2}
    ${h1} = function() ${code} end
    ${h2} = function() return nil end
    local ${state} = ${heavyMath(1)}
    while true do
        if ${state} == ${heavyMath(1)} then
            ${h1}()
            ${state} = ${heavyMath(2)}
        elseif ${state} == ${heavyMath(2)} then
            break
        end
    end
    `.replace(/\s+/g, ' ');
}

function obfuscate(sourceCode) {
    if (!sourceCode) return "-- ERROR: No source provided";

    // Detectar si es una URL o código plano
    const urlMatch = sourceCode.match(/["'](http[^"']+)["']/i);
    const isUrl = !!urlMatch && sourceCode.includes("HttpGet");
    const payload = isUrl ? urlMatch[1] : sourceCode;

    // 1. Inyectar Anti-Protecciones
    const anti = buildAntiAll();

    // 2. Crear VM Core
    let vm = buildVMMER7(payload, isUrl);

    // 3. Aplicar 15 capas de Handlers rotativos (como el v7 original)
    for (let i = 0; i < 15; i++) {
        vm = wrapLayers(vm);
    }

    // 4. Junk Code inicial
    let junk = "";
    for (let i = 0; i < 10; i++) junk += `local ${gn()} = ${heavyMath(Math.random()*100)} `;

    return `${HEADER} ${junk} ${anti} ${vm}`.replace(/\s+/g, " ").trim();
}

module.exports = { obfuscate };
