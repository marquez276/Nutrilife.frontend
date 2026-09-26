// Único ponto de acesso ao token JWT e às chamadas HTTP autenticadas do frontend.
const TOKEN_KEY = "nutrilife_token";
const SESSAO_KEY = "nutrilife_sessao";

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

// true se existe token e ele ainda não expirou (lê o "exp" do payload; a validação real é do backend)
export function tokenValido() {
  const token = getToken();
  if (!token) return false;
  try {
    const { exp } = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return !exp || exp * 1000 > Date.now();
  } catch { return false; }
}

export function limparSessao() {
  setToken(null);
  localStorage.removeItem(SESSAO_KEY);
}

// fetch que envia "Authorization: Bearer <token>" quando há token. Se o backend responder 401 com um
// token enviado, a sessão expirou/foi revogada: limpa tudo e volta para o login (uma única vez).
export async function apiFetch(url, options = {}) {
  // login não usa token: um token velho no storage faria o 401 do login ser tratado como sessão expirada
  const token = url.includes("/auth/login") ? null : getToken();
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 && token) {
    limparSessao();
    if (!window.location.pathname.startsWith("/login")) window.location.assign("/login?expirada=1");
  }
  return res;
}

// apiFetch + JSON: devolve o corpo já convertido ou lança Error com a mensagem do backend.
export async function apiJson(url, options = {}) {
  const res = await apiFetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Erro ao comunicar com o servidor.");
  return data;
}
