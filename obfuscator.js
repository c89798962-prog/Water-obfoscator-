/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║       Tomato Deobfusquer v2  –  JavaScript Edition          ║
 * ║   Invierte CodeVault v35 rolling-XOR + base-10 encoding     ║
 * ║   Compatible con Node.js  (node tomato_deobfusquer.js)       ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Uso (Node.js):
 *   node tomato_deobfusquer.js input_obf.lua [output_clean.lua]
 *
 * También exporta  deobfuscate(luaCode)  para usar como módulo.
 */

"use strict";

// ── Watermark que se añade al inicio de todo código desobfuscado ────────────
const WATERMARK = "--[[this code it's deobfosquet by tomato deobfosquer ]]\n";

// ── Pool de caracteres válidos del codec de CodeVault v35 ───────────────────
const CODEC_POOL = new Set([...">#_</$|^!@%?=+-*:.;,(){}[]"]);

// ── Mensajes de log con prefijo // ─────────────────────────────────────────
const log  = (msg) => console.log(`// ${msg}`);
const warn = (msg) => console.warn(`// ⚠  ${msg}`);
const fail = (msg) => { throw new Error(`// ❌  ${msg}`); };

// ════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ════════════════════════════════════════════════════════════════════════════

/**
 * Parsea un número Lua: hex (0x...), decimal, negativo, con paréntesis.
 * Más robusto que parseInt: maneja 0X, paréntesis anidados, espacios.
 */
function parseLuaNum(raw) {
  let s = raw.trim();
  // quitar paréntesis externos mientras haya
  while (s.startsWith("(") && s.endsWith(")")) s = s.slice(1, -1).trim();
  const neg = s.startsWith("-");
  if (neg) {
    s = s.slice(1).trim();
    while (s.startsWith("(") && s.endsWith(")")) s = s.slice(1, -1).trim();
  }
  const v = s.toLowerCase().startsWith("0x")
    ? parseInt(s, 16)
    : parseInt(s, 10);
  if (isNaN(v)) fail(`No se pudo parsear el número: "${raw}"`);
  return neg ? -v : v;
}

/**
 * Busca TODOS los matches de un regex en un string (generator).
 */
function* matchAll(str, regex) {
  const re = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g");
  let m;
  while ((m = re.exec(str)) !== null) yield m;
}

// ════════════════════════════════════════════════════════════════════════════
// MOTOR PRINCIPAL DE DEOBFUSCACIÓN
// ════════════════════════════════════════════════════════════════════════════

/**
 * Desobfusca un string de código Lua generado por CodeVault v35.
 * Retorna el código fuente original como string.
 *
 * Pasos:
 *  1. Encontrar el MAP (tabla 10 entradas → char a dígito 0-9)
 *  2. Identificar vK y vS por la estructura del bucle decode
 *  3. Leer los valores numéricos de key y salt
 *  4. Recuperar los 4 chunks del payload cifrado
 *  5. Invertir rolling-XOR: byte = (encoded - key - i*salt) % 256
 *  6. Decodificar bytes → UTF-8
 */
function deobfuscate(luaCode) {

  // ── PASO 1: Encontrar el MAP del codec ─────────────────────────────────
  // Patrón emitido por CodeVault: local <var>={["c"]=N, ["c"]=N, ...}  (10 entradas)
  log("Paso 1/5 → Buscando tabla MAP del codec...");

  let charMap = null;

  for (const m of matchAll(
    luaCode,
    /local\s+[Il_]+\s*=\s*\{((?:\["[^"]{1}"\]\s*=[^,}]+,?\s*){8,12})\}/
  )) {
    const body = m[1];
    const entries = [...matchAll(body, /\["([^"]{1})"\]\s*=\s*([^,}\s]+)/)]
      .map(e => [e[1], e[2]]);

    if (
      entries.length === 10 &&
      entries.every(([ch]) => CODEC_POOL.has(ch))
    ) {
      try {
        charMap = new Map(entries.map(([ch, raw]) => [ch, parseLuaNum(raw)]));
        log(`  MAP encontrado: { ${[...charMap.entries()].map(([k,v])=>`"${k}"→${v}`).join(", ")} }`);
        break;
      } catch (_) { /* intentar siguiente match */ }
    }
  }

  if (!charMap) fail(
    "No se encontró el MAP del codec.\n" +
    "//    Verifica que el archivo fue generado por CodeVault v35."
  );

  const symChars = new Set(charMap.keys());

  // ── PASO 2: Identificar vK y vS por el bucle decode ────────────────────
  // CodeVault siempre emite:
  //   local _kv=(<vK>+0)%<256_hex>
  //   ... -_xi*<vS>) ...
  log("Paso 2/5 → Identificando variables de clave y salt en el bucle decode...");

  const mKv  = /local\s+_kv\s*=\s*\(([Il_]+)\+0\)/.exec(luaCode);
  const mXs  = /_xi\s*\*\s*([Il_]+)/.exec(luaCode);

  if (!mKv) fail("No se encontró '_kv=(<vK>+0)' en el bucle decode.");
  if (!mXs) fail("No se encontró '_xi*<vS>' en el bucle decode.");

  const vKname = mKv[1];
  const vSname = mXs[1];
  log(`  Variable clave: ${vKname} | Variable salt: ${vSname}`);

  // ── PASO 3: Leer valores numéricos ─────────────────────────────────────
  log("Paso 3/5 → Leyendo valores de key y salt...");

  const numPat = String.raw`\(?\s*-?\s*0[xX][0-9a-fA-F]+\s*\)?|\(?\s*-?\s*\d+\s*\)?`;

  const mKey  = new RegExp(`local\\s+${escRe(vKname)}\\s*=\\s*(${numPat})`).exec(luaCode);
  const mSalt = new RegExp(`local\\s+${escRe(vSname)}\\s*=\\s*(${numPat})`).exec(luaCode);

  if (!mKey)  fail(`No se encontró el valor de la clave (${vKname}).`);
  if (!mSalt) fail(`No se encontró el valor del salt (${vSname}).`);

  const key  = parseLuaNum(mKey[1]);
  const salt = parseLuaNum(mSalt[1]);
  log(`  key = ${key} | salt = ${salt}`);

  // ── PASO 4: Recuperar los 4 chunks del payload ─────────────────────────
  // CodeVault emite: local <vFULL>=<vTC>({<c1>,<c2>,<c3>,<c4>})
  log("Paso 4/5 → Localizando los 4 chunks del payload cifrado...");

  const mTC = /local\s+([Il_]+)\s*=\s*[Il_]+\s*\(\{([Il_,\s]+)\}\)/.exec(luaCode);
  if (!mTC) fail("No se encontró el table.concat de chunks.");

  const chunkVars = [...mTC[2].matchAll(/[Il_]+/g)].map(x => x[0]);
  if (chunkVars.length !== 4) fail(
    `Se esperaban 4 chunk-vars, se encontraron ${chunkVars.length}.`
  );
  log(`  Chunk vars: ${chunkVars.join(", ")}`);

  let fullEncoded = "";
  for (const varName of chunkVars) {
    const mChunk = new RegExp(`local\\s+${escRe(varName)}\\s*=\\s*"([^"]+)"`).exec(luaCode);
    if (!mChunk) fail(`No se encontró el valor del chunk '${varName}'.`);

    const chunk = mChunk[1];

    // Validación extra: todos los chars deben pertenecer al sym10
    const badChars = [...chunk].filter(c => !symChars.has(c));
    if (badChars.length > 0) fail(
      `Chunk '${varName}' contiene ${badChars.length} caracteres inválidos.\n` +
      `//    Primeros inválidos: ${[...new Set(badChars)].slice(0,8).join(" ")}`
    );

    fullEncoded += chunk;
    log(`  Chunk '${varName}': ${chunk.length} chars`);
  }

  if (fullEncoded.length % 3 !== 0) {
    warn(`Longitud del payload (${fullEncoded.length}) no es múltiplo de 3. Recortando...`);
    fullEncoded = fullEncoded.slice(0, fullEncoded.length - fullEncoded.length % 3);
  }

  log(`  Payload total: ${fullEncoded.length} chars → ${fullEncoded.length / 3} bytes`);

  // ── PASO 5: Invertir el rolling-XOR ────────────────────────────────────
  // Cifrado original: c[i] = (b[i] + key + i*salt) % 256
  // Inverso:          b[i] = (c[i] - key - i*salt + 256*N) % 256
  log("Paso 5/5 → Decodificando payload (rolling-XOR inverso)...");

  const byteLen = fullEncoded.length / 3;
  const decoded = new Uint8Array(byteLen);

  for (let xi = 0; xi < byteLen; xi++) {
    const i  = xi * 3;
    const c0 = charMap.get(fullEncoded[i])     ?? 0;
    const c1 = charMap.get(fullEncoded[i + 1]) ?? 0;
    const c2 = charMap.get(fullEncoded[i + 2]) ?? 0;
    const encodedByte = c0 * 100 + c1 * 10 + c2;
    // Mod aritmético positivo garantizado sumando 256*múltiplo
    decoded[xi] = ((encodedByte - key - xi * salt) % 256 + 256) % 256;
  }

  // ── Decodificar bytes a texto UTF-8 ────────────────────────────────────
  let source;
  try {
    // En Node.js usamos Buffer
    if (typeof Buffer !== "undefined") {
      source = Buffer.from(decoded).toString("utf8");
    } else {
      // En browser / Deno usamos TextDecoder
      source = new TextDecoder("utf-8").decode(decoded);
    }
  } catch (e) {
    warn("UTF-8 falló, intentando latin-1...");
    source = [...decoded].map(b => String.fromCharCode(b)).join("");
  }

  log(`  ✅ Desobfuscación exitosa: ${source.length} caracteres recuperados`);
  return source;
}

// ── Escapar caracteres especiales de regex ──────────────────────────────────
function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ════════════════════════════════════════════════════════════════════════════
// CLI  (Node.js)
// ════════════════════════════════════════════════════════════════════════════

if (
  typeof process !== "undefined" &&
  typeof require !== "undefined" &&
  require.main === module
) {
  const fs   = require("fs");
  const path = require("path");

  const args = process.argv.slice(2).filter(a => !a.startsWith("--"));
  if (args.length < 1) {
    console.log(
      "// Uso: node tomato_deobfusquer.js input_obf.lua [output_clean.lua]\n" +
      "// También: const { deobfuscate } = require('./tomato_deobfusquer');"
    );
    process.exit(1);
  }

  const inFile  = args[0];
  const outFile = args[1] ?? path.basename(inFile, ".lua") + "_clean.lua";

  log(`Tomato Deobfusquer v2 — JavaScript Edition`);
  log(`Leyendo: ${inFile}`);

  let luaCode;
  try {
    luaCode = fs.readFileSync(inFile, "utf8");
  } catch (e) {
    fail(`No se pudo leer '${inFile}': ${e.message}`);
  }

  let clean;
  try {
    clean = deobfuscate(luaCode);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }

  const result = WATERMARK + clean;
  fs.writeFileSync(outFile, result, "utf8");

  log(`Salida: ${outFile} (${result.length} bytes)`);
  log(`Código limpio: ${clean.length} bytes`);
  log(`Todas las capas de ofuscación eliminadas ✅`);
}

// ── Export para uso como módulo ─────────────────────────────────────────────
if (typeof module !== "undefined") {
  module.exports = { deobfuscate, WATERMARK };
    }
