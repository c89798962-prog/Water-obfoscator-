const axios = require("axios");

// 🔥 función principal
async function obfuscate(code){
    try {
        const res = await axios.post("https://luaobfuscator.com/api/obfuscate", {
            code: code,
            options: { preset: "Basic" }
        }, {
            timeout: 10000
        });

        // soporta varios formatos de respuesta
        if (typeof res.data === "string") return res.data;
        if (res.data.code) return res.data.code;

        return JSON.stringify(res.data);

    } catch (err) {
        console.log("API externa falló, usando fallback...");
        return fallbackObfuscate(code);
    }
}

// 🔒 fallback simple (SIEMPRE FUNCIONA)
function fallbackObfuscate(code){
    const encoded = Buffer.from(code).toString("base64");

    return `
local data = "${encoded}"
local decoded = game:HttpGet("data:text/plain;base64,"..data)
loadstring(decoded)()
`;
}

// 📦 exportar función
module.exports = { obfuscate };
