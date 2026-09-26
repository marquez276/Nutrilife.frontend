// Check rápido da lógica de token/401: node src/app/api.check.mjs
import assert from "node:assert";

const store = {};
globalThis.localStorage = { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
let redirect = null;
globalThis.window = { location: { pathname: "/dashboard", assign: u => { redirect = u; } } };
const jwt = exp => `h.${Buffer.from(JSON.stringify({ exp })).toString("base64url")}.s`;
const { getToken, setToken, tokenValido, apiFetch } = await import("./api.js");

assert.equal(tokenValido(), false, "sem token não é válido");
setToken(jwt(Math.floor(Date.now() / 1000) + 3600));
assert.equal(tokenValido(), true, "token no futuro é válido");
setToken(jwt(Math.floor(Date.now() / 1000) - 10));
assert.equal(tokenValido(), false, "token expirado não é válido");

// sem token: não envia "Bearer null"
setToken(null);
let enviado;
globalThis.fetch = async (_u, o) => { enviado = o.headers.get("Authorization"); return { status: 200 }; };
await apiFetch("/x");
assert.equal(enviado, null, "não deve enviar Authorization sem token");

// com token: envia Bearer; 401 limpa a sessão e redireciona uma vez
setToken("abc");
await apiFetch("/x");
assert.equal(enviado, "Bearer abc");
globalThis.fetch = async () => ({ status: 401 });
await apiFetch("/x");
assert.equal(getToken(), null, "401 limpa o token");
assert.equal(redirect, "/login?expirada=1");
console.log("api.js ok");
