const MOONVEIL_API_KEY = 'mv-secret-14e95bba-c7a2-4673-ae9c-0d5974364c38';
const MOONVEIL_ENDPOINT = 'https://moonveil.cc/api/obfuscate';

// Config imagen 1 — modo normal (menos opciones)
const CONFIG_NORMAL = {
  prettify:             false,
  embed_runtime:        false,
  mangle_statements:    true,
  lift_constants:       25,
  mangle_numbers:       false,
  mangle_strings:       false,
  mangle_self_calls:    true,
  mangle_named_indexes: true,
  mangle_globals:       true,
  flatten_control_flow: true,
  decompose_expressions:false,
  hoist_locals:         false,
  virtualize_script:    true,
  environment_check:    false,
  debug_vm:             false,
};

// Config imagen 2 — modo diabolical (máximas opciones)
const CONFIG_DIABOLICAL = {
  prettify:             false,
  embed_runtime:        true,
  mangle_statements:    true,
  lift_constants:       50,
  mangle_numbers:       true,
  mangle_strings:       true,
  mangle_self_calls:    true,
  mangle_named_indexes: true,
  mangle_globals:       true,
  flatten_control_flow: true,
  decompose_expressions:false,
  hoist_locals:         false,
  virtualize_script:    true,
  environment_check:    false,
  debug_vm:             false,
};

async function obfuscate(sourceCode, mode = 'normal') {
  const config = mode === 'diabolical' ? CONFIG_DIABOLICAL : CONFIG_NORMAL;

  const res = await fetch(MOONVEIL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MOONVEIL_API_KEY}`,
      'x-api-key': MOONVEIL_API_KEY,
    },
    body: JSON.stringify({ code: sourceCode, options: config }),
  });

  if (!res.ok) throw new Error(`MoonVeil error ${res.status}: ${await res.text()}`);

  const json = await res.json();
  return json.output ?? json.result ?? json.code ?? (() => { throw new Error('Respuesta inesperada: ' + JSON.stringify(json)); })();
}

module.exports = { obfuscate };
