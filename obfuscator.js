const MOONVEIL_API_KEY = 'mv-secret-14e95bba-c7a2-4673-ae9c-0d5974364c38';
const MOONVEIL_ENDPOINT = 'https://moonveil.cc/api/obfuscate';

// Config imagen 1 — modo normal (menos opciones)
const CONFIG_NORMAL = {
  prettify: false,
  embed_runtime: false,
  mangle_statements: true,
  lift_constants: 25,
  mangle_numbers: false,
  mangle_strings: false,
  mangle_self_calls: true,
  mangle_named_indexes: true,
  mangle_globals: true,
  flatten_control_flow: true,
  decompose_expressions: false,
  hoist_locals: false,
  virtualize_script: true,
  environment_check: false,
  debug_vm: false,
};

// Config imagen 2 — modo diabolical (máximas opciones)
const CONFIG_DIABOLICAL = {
  prettify: false,
  embed_runtime: true,
  mangle_statements: true,
  lift_constants: 50,
  mangle_numbers: true,
  mangle_strings: true,
  mangle_self_calls: true,
  mangle_named_indexes: true,
  mangle_globals: true,
  flatten_control_flow: true,
  decompose_expressions: false,
  hoist_locals: false,
  virtualize_script: true,
  environment_check: false,
  debug_vm: false,
};

// Convierte los nombres de campos a snake_case (como espera probablemente MoonVeil)
function toSnakeCase(obj) {
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    const snake = key.replace(/[A-Z]/g, c => '_' + c.toLowerCase());
    result[snake] = val;
  }
  return result;
}

async function obfuscate(sourceCode, mode = 'normal') {
  const config = mode === 'diabolical' ? CONFIG_DIABOLICAL : CONFIG_NORMAL;
  const configSnake = toSnakeCase(config);

  // Intenta con el formato snake_case (más probable para una API Rust/backend)
  const body = JSON.stringify({
    code: sourceCode,
    options: configSnake,
  });

  let res;
  try {
    res = await fetch(MOONVEIL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MOONVEIL_API_KEY}`,
      },
      body,
    });
  } catch (err) {
    throw new Error(`[MoonVeil NET] ${err.message}`);
  }

  const rawText = await res.text();

  if (!res.ok) {
    throw new Error(`[MoonVeil ${res.status}] ${rawText}`);
  }

  // Si la respuesta es texto plano (probablemente código Lua)
  if (!rawText.startsWith('{') && !rawText.startsWith('[')) {
    return rawText;
  }

  // Si es JSON
  let json;
  try {
    json = JSON.parse(rawText);
  } catch {
    return rawText; // Devuelve como está
  }

  // Intenta varios campos posibles
  const result = json.code ?? json.output ?? json.result ?? json.script ?? json.obfuscated ?? json;
  
  if (typeof result === 'string' && result.length > 0) {
    return result;
  }

  throw new Error(`[MoonVeil] Respuesta inesperada: ${JSON.stringify(json).substring(0, 200)}`);
}

module.exports = { obfuscate };
