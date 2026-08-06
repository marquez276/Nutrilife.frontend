import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

const AppContext = createContext(null);

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function AppProvider({ children }) {
  const [usuarioLogado, setUsuarioLogado] = useState(() => load("nutrilife_sessao", null));

  function atualizarUsuarioLogado(campos) {
    setUsuarioLogado(prev => {
      const atualizado = { ...prev, ...campos };
      save("nutrilife_sessao", atualizado);
      return atualizado;
    });
  }
  const [anamnese, setAnamneseState] = useState(null);
  const [refeicoes, setRefeicoesState] = useState([]);
  const [pesagens, setPesagensState] = useState([]);
  const [agendamentos, setAgendamentosState] = useState([]);
  const [pacientes, setPacientesState] = useState([]);
  const [nutricionistas, setNutricionistasState] = useState([]);
  const [metas, setMetasState] = useState(null);

  function tryParseJson(str, fallback) {
    try { return JSON.parse(str); } catch { return fallback; }
  }

  function carregarNutricionistas() {
    fetch("/nutricionistas/perfis")
      .then(r => r.json())
      .then(perfis => {
        if (!Array.isArray(perfis)) return;
        const lista = perfis.map(p => ({
          id: p.nutricionista?.id,
          nome: p.nutricionista?.nomeCompleto || p.nutricionista?.nome || "",
          email: p.nutricionista?.email || "",
          crn: p.nutricionista?.crn || "",
          telefone: p.nutricionista?.telefone || "",
          fotoUrl: p.nutricionista?.id ? `/usuarios/${p.nutricionista.id}/imagem` : null,
          specialty: p.especialidade || p.nutricionista?.especialidade || "",
          bio: p.bio || "",
          whatsapp: p.whatsapp || "",
          instagram: p.instagram || "",
          linkedin: p.linkedin || "",
          website: p.website || "",
          precos: p.precos ? tryParseJson(p.precos, []) : [],
          experiencia: p.experiencia ? p.experiencia.split("\n").filter(Boolean) : [],
          portfolio: p.portfolio ? p.portfolio.split("\n").filter(Boolean) : [],
          videos: p.videos ? p.videos.split("\n").filter(Boolean) : [],
          reviews: [],
        }));
        setNutricionistasState(lista);
        lista.forEach(n => {
          fetch(`/avaliacoes/nutricionista/${n.id}`)
            .then(r => r.json())
            .then(avs => {
              if (!Array.isArray(avs)) return;
              setNutricionistasState(prev => prev.map(x =>
                x.id === n.id
                  ? {
                      ...x,
                      reviews: avs.map(a => ({
                        id: a.id,
                        userName: a.clienteNome || "Paciente",
                        rating: a.nota,
                        comment: a.comentario,
                        date: a.dataAvaliacao,
                      })),
                      rating: avs.length ? (avs.reduce((s, a) => s + a.nota, 0) / avs.length) : 0,
                    }
                  : x
              ));
            })
            .catch(() => {});
        });
      })
      .catch(() => {});
  }

  const hoje = () => new Date().toISOString().slice(0, 10);

  async function carregarDadosPaciente(id) {
    // Anamnese
    const aRes = await fetch(`/anamnese/cliente/${id}`).catch(() => null);
    if (aRes && aRes.ok) {
      const d = await aRes.json();
      setAnamneseState(d);
      save(`anamnese_${id}`, d);
    } else {
      setAnamneseState(load(`anamnese_${id}`, null));
    }
    // Refeições do dia
    fetch(`/registros/refeicoes/${id}`)
      .then(r => r.ok ? r.json() : [])
      .then(d => { setRefeicoesState(Array.isArray(d) ? d : []); save(`refeicoes_data_${id}`, hoje()); })
      .catch(() => setRefeicoesState([]));
    // Pesagens + progresso
    fetch(`/clientes/${id}/progresso`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        setPesagensState(Array.isArray(d.historico) ? d.historico : []);
        setMetasState(prev => ({ ...prev, pesoInicial: d.pesoInicial, pesoIdeal: d.pesoIdeal, imc: d.imc, statusPeso: d.statusPeso }));
      })
      .catch(() => {
        fetch(`/registros/pesagens/${id}`)
          .then(r => r.json()).then(d => setPesagensState(Array.isArray(d) ? d : []))
          .catch(() => setPesagensState([]));
      });
    // Metas
    fetch(`/anamnese/cliente/${id}/metas`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setMetasState(d); })
      .catch(() => {
        fetch(`/clientes/${id}/metas`)
          .then(r => r.ok ? r.json() : null)
          .then(d => { if (d) setMetasState(d); })
          .catch(() => {});
      });
    // Agenda
    fetch(`/consultas/cliente/${id}`)
      .then(r => r.json()).then(d => setAgendamentosState(Array.isArray(d) ? d : []))
      .catch(() => setAgendamentosState([]));
  }

  // ── Carrega dados ao montar conforme tipo de usuário ──────────────
  useEffect(() => {
    if (!usuarioLogado) return;

    if (usuarioLogado.tipo === "patient") {
      carregarDadosPaciente(usuarioLogado.id);
    }

    if (usuarioLogado.tipo === "nutritionist") {
      fetch(`/consultas/nutricionista/${usuarioLogado.id}`)
        .then(r => r.json()).then(d => setAgendamentosState(Array.isArray(d) ? d : []))
        .catch(() => setAgendamentosState([]));
      setPacientesState(load(`pacientes_${usuarioLogado.id}`, []));
    }

    carregarNutricionistas();
  }, []);

  // ── Reset diário de calorias à meia-noite ─────────────────────────
  useEffect(() => {
    if (!usuarioLogado || usuarioLogado.tipo !== "patient") return;
    const ultimaData = load(`refeicoes_data_${usuarioLogado.id}`, null);
    if (ultimaData && ultimaData !== hoje()) {
      // Novo dia: recarrega refeições do backend (retorna lista vazia para hoje)
      fetch(`/registros/refeicoes/${usuarioLogado.id}`)
        .then(r => r.ok ? r.json() : [])
        .then(d => { setRefeicoesState(Array.isArray(d) ? d : []); save(`refeicoes_data_${usuarioLogado.id}`, hoje()); })
        .catch(() => {});
    }
    // Agenda um timer para o próximo dia
    const agora = new Date();
    const meianoite = new Date(agora);
    meianoite.setHours(24, 0, 0, 0);
    const ms = meianoite - agora;
    const timer = setTimeout(() => {
      fetch(`/registros/refeicoes/${usuarioLogado.id}`)
        .then(r => r.ok ? r.json() : [])
        .then(d => { setRefeicoesState(Array.isArray(d) ? d : []); save(`refeicoes_data_${usuarioLogado.id}`, hoje()); })
        .catch(() => {});
    }, ms);
    return () => clearTimeout(timer);
  }, [usuarioLogado]);

  // ── Auth ──────────────────────────────────────────────────────────
  async function login(email, senha, tipo) {
    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { ok: false, erro: err.message || "E-mail ou senha incorretos." };
      }
      const { usuario } = await res.json();

      let tipoMapeado;
      if (usuario.tipoUsuario === "ADMIN") tipoMapeado = "admin";
      else if (usuario.tipoUsuario === "NUTRICIONISTA") tipoMapeado = "nutritionist";
      else tipoMapeado = "patient";

      const sessao = { ...usuario, nome: usuario.nomeCompleto, tipo: tipoMapeado };
      setUsuarioLogado(sessao);
      save("nutrilife_sessao", sessao);

      if (tipoMapeado === "patient") {
        const aRes = await fetch(`/anamnese/cliente/${sessao.id}`).catch(() => null);
        if (aRes && aRes.ok) {
          const aData = await aRes.json();
          setAnamneseState(aData);
          save(`anamnese_${sessao.id}`, aData);
          fetch(`/anamnese/cliente/${sessao.id}/metas`)
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d) setMetasState(d); })
            .catch(() => {});
          // Carrega demais dados do paciente
          fetch(`/registros/refeicoes/${sessao.id}`)
            .then(r => r.ok ? r.json() : [])
            .then(d => { setRefeicoesState(Array.isArray(d) ? d : []); save(`refeicoes_data_${sessao.id}`, hoje()); })
            .catch(() => {});
          fetch(`/clientes/${sessao.id}/progresso`)
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d) setPesagensState(Array.isArray(d.historico) ? d.historico : []); })
            .catch(() => {});
          fetch(`/consultas/cliente/${sessao.id}`)
            .then(r => r.json()).then(d => setAgendamentosState(Array.isArray(d) ? d : []))
            .catch(() => {});
          return { ok: true, hasAnamnese: true };
        } else {
          setAnamneseState(null);
          return { ok: true, hasAnamnese: false };
        }
      }
      if (tipoMapeado === "nutritionist") {
        return { ok: true, codStatus: sessao.codStatus };
      }
      return { ok: true };
    } catch {
      return { ok: false, erro: "Erro ao conectar com o servidor." };
    }
  }

  function logout() {
    setUsuarioLogado(null);
    localStorage.removeItem("nutrilife_sessao");
    setAnamneseState(null);
    setRefeicoesState([]);
    setPesagensState([]);
    setAgendamentosState([]);
    setPacientesState([]);
    setNutricionistasState([]);
    setMetasState(null);
  }

  // ── Cadastro ──────────────────────────────────────────────────────
  async function cadastrarPaciente(dados) {
    try {
      const res = await fetch("/usuarios/paciente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomeCompleto: dados.nome, email: dados.email, senha: dados.senha, telefone: dados.telefone || null, cpf: dados.cpf || null, dataNascimento: dados.dataNascimento || null }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); return { ok: false, erro: err.message || "Erro ao criar conta." }; }
      return { ok: true, usuario: await res.json() };
    } catch { return { ok: false, erro: "Erro ao conectar com o servidor." }; }
  }

  async function cadastrarNutricionista(dados) {
    try {
      const res = await fetch("/usuarios/nutricionista", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomeCompleto: dados.nome, email: dados.email, senha: dados.senha, telefone: dados.telefone, crn: dados.crn, especialidade: dados.especialidade }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); return { ok: false, erro: err.message || "Erro ao criar conta." }; }
      return { ok: true };
    } catch { return { ok: false, erro: "Erro ao conectar com o servidor." }; }
  }

  // ── Anamnese ──────────────────────────────────────────────────────
  async function salvarAnamnese(dados) {
    const id = usuarioLogado?.id;
    if (!id) { setAnamneseState(dados); return; }
    try {
      const res = await fetch("/anamnese", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          peso: parseFloat(dados.peso) || 0,
          altura: parseFloat(dados.altura) || 0,
          idade: parseInt(dados.idade) || null,
          sexo: dados.sexo === "masculino" ? "M" : "F",
          objetivo: dados.objetivo,
          atividade: dados.nivelAtividade || "sedentario",
          sono: parseInt(dados.horasSono) || null,
          comorbidades: dados.comorbidades || null,
          restricoes: dados.restricoes || null,
          cliente: { id },
        }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); toast.error(err.message || "Erro ao salvar anamnese."); return; }
      const salvo = await res.json();
      setAnamneseState(salvo);
      save(`anamnese_${id}`, salvo);
      // Recalculate and persist goals after anamnese update
      fetch(`/anamnese/cliente/${id}/metas`)
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setMetasState(d); })
        .catch(() => {});
    } catch { setAnamneseState(dados); save(`anamnese_${id}`, dados); }
  }

  // ── Refeições ─────────────────────────────────────────────────────
  async function adicionarRefeicao(refeicao) {
    if (!usuarioLogado) return;
    try {
      const res = await fetch("/registros/refeicoes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...refeicao, cliente: { id: usuarioLogado.id } }) });
      const salva = await res.json();
      setRefeicoesState(prev => [...prev, salva]);
    } catch { setRefeicoesState(prev => [...prev, { ...refeicao, id: Date.now() }]); }
  }
  async function editarRefeicao(id, dados) {
    if (!usuarioLogado) return;
    try {
      const res = await fetch(`/registros/refeicoes/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dados) });
      const atualizada = await res.json();
      setRefeicoesState(prev => prev.map(r => r.id === id ? atualizada : r));
    } catch { setRefeicoesState(prev => prev.map(r => r.id === id ? { ...r, ...dados } : r)); }
  }
  async function removerRefeicao(id) {
    if (!usuarioLogado) return;
    try { await fetch(`/registros/refeicoes/${id}`, { method: "DELETE" }); } catch {}
    setRefeicoesState(prev => prev.filter(r => r.id !== id));
  }

  // ── Pesagens ──────────────────────────────────────────────────────
  async function adicionarPesagem(pesagem) {
    if (!usuarioLogado) return;
    try {
      const res = await fetch("/registros/pesagens", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...pesagem, cliente: { id: usuarioLogado.id } }) });
      const salva = await res.json();
      setPesagensState(prev => [...prev, salva]);
      fetch(`/anamnese/cliente/${usuarioLogado.id}/metas`)
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setMetasState(d); })
        .catch(() => {});
    } catch { setPesagensState(prev => [...prev, { ...pesagem, id: Date.now() }]); }
  }

  async function removerPesagem(id) {
    if (!usuarioLogado) return;
    try { await fetch(`/registros/pesagens/${id}`, { method: "DELETE" }); } catch {}
    setPesagensState(prev => prev.filter(p => p.id !== id));
    fetch(`/anamnese/cliente/${usuarioLogado.id}/metas`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setMetasState(d); })
      .catch(() => {});
  }

  // ── Agenda ────────────────────────────────────────────────────────
  async function adicionarAgendamento(ag) {
    if (!usuarioLogado) return;
    const body = {
      date: ag.date,
      time: ag.time,
      videoLink: ag.videoLink || null,
      observations: ag.observations || null,
      paciente: ag.paciente || null,
      nutritionist: ag.nutritionist || null,
      clienteId: usuarioLogado.tipo === "patient" ? usuarioLogado.id : null,
      nutricionistaId: usuarioLogado.tipo === "nutritionist" ? usuarioLogado.id : null,
    };
    try {
      const res = await fetch("/consultas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const salvo = await res.json();
      setAgendamentosState(prev => [...prev, salvo]);
    } catch { setAgendamentosState(prev => [...prev, { ...ag, id: Date.now().toString() }]); }
  }
  async function editarAgendamento(id, dados) {
    if (!usuarioLogado) return;
    const body = {
      date: dados.date,
      time: dados.time,
      videoLink: dados.videoLink || null,
      observations: dados.observations || null,
      paciente: dados.paciente || null,
      nutritionist: dados.nutritionist || null,
      clienteId: usuarioLogado.tipo === "patient" ? usuarioLogado.id : null,
      nutricionistaId: usuarioLogado.tipo === "nutritionist" ? usuarioLogado.id : null,
    };
    try {
      const res = await fetch(`/consultas/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const atualizada = await res.json();
      setAgendamentosState(prev => prev.map(a => a.id === id ? atualizada : a));
    } catch { setAgendamentosState(prev => prev.map(a => a.id === id ? { ...a, ...dados } : a)); }
  }
  async function removerAgendamento(id) {
    try { await fetch(`/consultas/${id}`, { method: "DELETE" }); } catch {}
    setAgendamentosState(prev => prev.filter(a => a.id !== id));
  }

  // ── Pacientes (nutricionista) ─────────────────────────────────────
  function adicionarPaciente(paciente) {
    if (!usuarioLogado) return;
    const novo = { ...paciente, id: Date.now(), status: "Em dia", progress: 0, evolution: [] };
    setPacientesState(prev => { const next = [...prev, novo]; save(`pacientes_${usuarioLogado.id}`, next); return next; });
  }

  // ── Avaliações ────────────────────────────────────────────────────
  async function adicionarAvaliacao(nutricionistaId, avaliacao) {
    if (!usuarioLogado) return;
    try {
      const res = await fetch("/avaliacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nutricionista: { id: nutricionistaId },
          cliente: { id: usuarioLogado.id },
          nota: avaliacao.rating,
          comentario: avaliacao.comment,
        }),
      });
      if (res.ok) {
        const salva = await res.json();
        const novaReview = {
          id: salva.id,
          userName: salva.clienteNome || usuarioLogado.nome || "Paciente",
          rating: salva.nota,
          comment: salva.comentario,
          date: salva.dataAvaliacao,
        };
        setNutricionistasState(prev => prev.map(n =>
          n.id === nutricionistaId
            ? { ...n, reviews: [novaReview, ...(n.reviews || [])] }
            : n
        ));
      }
    } catch {}
  }

  return (
    <AppContext.Provider value={{
      usuarioLogado, login, logout, atualizarUsuarioLogado,
      nutricionistas, adicionarAvaliacao, recarregarNutricionistas: carregarNutricionistas,
      anamnese, salvarAnamnese, recarregarDadosPaciente: carregarDadosPaciente,
      metas,
      refeicoes, adicionarRefeicao, editarRefeicao, removerRefeicao,
      pesagens, adicionarPesagem, removerPesagem,
      agendamentos, adicionarAgendamento, editarAgendamento, removerAgendamento,
      pacientes, adicionarPaciente,
      cadastrarPaciente, cadastrarNutricionista,
      usuarios: [],
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
