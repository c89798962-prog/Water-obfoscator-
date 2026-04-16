const DISCORD = "https://discord.gg/5E45u5eES";
const HEADER = `--[[ MIMOSA ADVANCED VM - ${DISCORD} ]]`;
const IL_POOL = ["I", "l"];

// Generador estricto de variables IlIlIl
function generateIlName() {
  let name = "Il"; // Fuerza a empezar con Il para mantener el estilo visual
  const len = Math.floor(Math.random() * 8) + 8;
  for (let i = 0; i < len; i++) name += IL_POOL[Math.floor(Math.random() * 2)];
  return name;
}

function lightMath(n) {
  let a = Math.floor(Math.random() * 90) + 20, b = Math.floor(Math.random() * 60) + 10;
  return `(${n}+${a}*${b}-${a})`;
}

function stringToMath(str) {
  return `{${str.split('').map(c => lightMath(c.charCodeAt(0))).join(',')}}`;
}

function mba() {
  let n = Math.random() > 0.5 ? 1 : 2, a = Math.floor(Math.random() * 70) + 15, b = Math.floor(Math.random() * 40) + 8;
  return `((${n}*${a}-${a})/(${b}+1)+${n})`;
}

function generateJunk(lines = 10) {
  let j = '';
  for (let i = 0; i < lines; i++) {
    const r = Math.random();
    if (r < 0.25) j += `local lM_${generateIlName()}=${lightMath(Math.floor(Math.random() * 9999))}; `;
    else if (r < 0.5) j += `local lM_${generateIlName()}=${mba()}; `;
    else if (r < 0.75) j += `local lM_${generateIlName()}=${lightMath(mba())}; `;
    else j += `local lM_${generateIlName()}=(${mba()}+${lightMath(Math.floor(Math.random() * 999))}); `;
  }
  return j;
}

const MAPEO = {
  "Workspace":"Reverse If", "Players":"Fake Flow", "Lighting":"Size-Based Execution Switch"
  // Puedes mantener tu MAPEO original completo aquí
};

function detectAndApplyMappings(code) {
  // Simplificado para la demostración, puedes usar tu lógica original de MAPEO
  return code; 
}

function obfuscate(sourceCode) {
  if (!sourceCode || typeof sourceCode !== 'string') return '--ERROR';
  
  let preProcessed = detectAndApplyMappings(sourceCode);
  const xorKey = Math.floor(Math.random() * 255) + 1;
  
  // 1. "Compilar" el código en Bytecode de la Máquina Virtual
  // Opcodes: 1=SET_KEY, 2=LOAD_BYTE, 3=XOR, 4=CONCAT, 5=EXECUTE
  const instructions = [];
  instructions.push(`{1, 0, ${xorKey}}`); // lM_regs[0] = xorKey

  for (let i = 0; i < preProcessed.length; i++) {
    let byteCode = preProcessed.charCodeAt(i) ^ xorKey; // Encriptamos aquí
    instructions.push(`{2, 1, ${byteCode}}`);     // Carga el byte en el registro 1
    instructions.push(`{3, 2, 1, 0}`);            // XOR: Reg[2] = Reg[1] ^ Reg[0] (Key)
    instructions.push(`{4, 2}`);                  // Concatena Reg[2] al Stack/Buffer
  }
  instructions.push(`{5}`); // Ejecuta el Stack

  // 2. Generar el entorno falso (Virtual Machine)
  const regs = `lM_${generateIlName()}`;
  const pc = `lM_${generateIlName()}`;
  const stack = `lM_${generateIlName()}`;
  const bytecode = `lM_${generateIlName()}`;
  const handlers = `lM_${generateIlName()}`;

  let vm = `${HEADER}\n`;
  vm += `local lM_bit_xor = bit32 and bit32.bxor or bit and bit.bxor or function(a,b) return a~b end; `;
  vm += generateJunk(5);
  
  // Registros y variables de la CPU
  vm += `local ${regs} = {}; local ${pc} = 1; local ${stack} = ""; `;
  vm += `local ${bytecode} = {${instructions.join(",")}}; `;
  
  vm += generateJunk(3);

  // Funciones Handler (Manejadores de instrucciones)
  vm += `local function KQ(args) ${regs}[args[2]] = args[3]; end; `; // Opcode 1: LOAD CONSTANT
  vm += `local function HF(args) ${regs}[args[2]] = args[3]; end; `; // Opcode 2: LOAD BYTE
  vm += `local function W8(args) ${regs}[args[2]] = lM_bit_xor(${regs}[args[3]], ${regs}[args[4]]); end; `; // Opcode 3: MATH (XOR)
  vm += `local function SX(args) ${stack} = ${stack} .. string.char(${regs}[args[2]]); end; `; // Opcode 4: STACK PUSH
  vm += `local function Z9(args) local fn = (loadstring or load)(${stack}); if fn then fn() end; end; `; // Opcode 5: EXECUTE

  vm += generateJunk(5);

  // Tabla de Handlers
  vm += `local ${handlers} = { [1]=KQ, [2]=HF, [3]=W8, [4]=SX, [5]=Z9 }; `;

  // Ciclo de Ejecución de la Máquina Virtual
  vm += `while ${pc} <= #${bytecode} do `;
  vm += `  local lM_inst = ${bytecode}[${pc}]; `;
  vm += `  local lM_op = lM_inst[1]; `;
  vm += `  local lM_handler = ${handlers}[lM_op]; `;
  vm += `  if lM_handler then lM_handler(lM_inst) end; `;
  vm += `  ${pc} = ${pc} + 1; `;
  vm += `end; `;

  // Envolver todo en una función anónima confusa
  const wrapper = generateIlName();
  let finalScript = `local function ${wrapper}() \n ${vm} \n end \n ${wrapper}();`;
  
  // Opcional: Minificar
  finalScript = finalScript.replace(/\n/g, ' ').replace(/\s+/g, ' ');
  return finalScript;
}

module.exports = { obfuscate };
