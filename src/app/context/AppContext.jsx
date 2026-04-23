import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

const AppContext = createContext(null);

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

const NUTRIS_INICIAIS = [
  {
    id: 1,
    nome: "Dra. Maria Santos",
    email: "maria@nutrilife.com",
    senha: "123456",
    crn: "12345/P",
    telefone: "(11) 99999-9999",
    specialty: "Nutrição Esportiva e Emagrecimento",
    bio: "Especialista em nutrição esportiva com mais de 10 anos de experiência transformando vidas através da alimentação consciente.",
    whatsapp: "5511999999999",
    photo: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400",
    rating: 4.9,
    prices: [
      { label: "Consulta Inicial", value: "R$ 250" },
      { label: "Acompanhamento Mensal", value: "R$ 150" },
    ],
    social: { instagram: "@dra.mariasantos", linkedin: "maria-santos-nutri", website: "www.mariasantosnutri.com.br" },
    experience: [
      "Nutricionista do Clube Atlético Regional (2018 - Presente)",
      "Docente na Faculdade de Nutrição (2015 - 2020)",
      "Pós-graduada em Comportamento Alimentar",
    ],
    portfolio: [
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400",
      "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400",
    ],
    videos: ["Apresentação Profissional", "Dica de Pré-treino"],
    reviews: [
      { id: "r1", userName: "Ana Clara", rating: 5, comment: "Atendimento excelente, muito atenciosa.", date: "05/02/2026" },
    ],
  },
  {
    id: 2,
    nome: "Dr. Ricardo Lima",
    email: "ricardo@nutrilife.com",
    senha: "123456",
    crn: "67890/P",
    telefone: "(11) 88888-8888",
    specialty: "Nutrição Funcional e Longevidade",
    bio: "Focado em melhorar a saúde intestinal e longevidade dos pacientes.",
    whatsapp: "5511888888888",
    photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
    rating: 4.7,
    prices: [
      { label: "Primeira Consulta", value: "R$ 300" },
      { label: "Bioimpedância", value: "R$ 80" },
    ],
    social: { instagram: "@dr.ricardolima", website: "www.ricardolima.com" },
    experience: [
      "Clínica Longevidade Saudável (2012 - Presente)",
      "Palestrante em Nutrição Funcional",
    ],
    portfolio: ["https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400"],
    videos: ["Como melhorar a digestão"],
    reviews: [
      { id: "r2", userName: "Pedro Gomes", rating: 5, comment: "Minha disposição melhorou muito!", date: "15/02/2026" },
    ],
  },
  {
    id: 3,
    nome: "Dra. Fernanda Alvim",
    email: "fernanda@nutrilife.com",
    senha: "123456",
    crn: "11223/P",
    telefone: "(11) 77777-7777",
    specialty: "Nutrição Materno-Infantil",
    bio: "Auxilio mães e crianças a terem uma relação saudável com a comida desde os primeiros meses de vida.",
    whatsapp: "5511777777777",
    photo: "https://images.unsplash.com/photo-1559839734-2b71f1536783?w=400",
    rating: 5.0,
    prices: [{ label: "Introdução Alimentar", value: "R$ 280" }],
    social: { instagram: "@dra.fernandaalvim" },
    experience: [
      "Hospital Infantil Santa Luzia (2020 - Presente)",
      "Especialista em Introdução Alimentar",
    ],
    portfolio: [],
    videos: [],
    reviews: [
      { id: "r3", userName: "Carla Souza", rating: 5, comment: "Salvou minha introdução alimentar!", date: "20/02/2026" },
    ],
  },
];

export function AppProvider({ children }) {
  const [usuarios, setUsuariosState] = useState(() => load("nutrilife_usuarios", []));
  const [nutricionistas, setNutricionistasState] = useState(() => load("nutrilife_nutricionistas", null) ?? NUTRIS_INICIAIS);
  const [usuarioLogado, setUsuarioLogado] = useState(() => load("nutrilife_sessao", null));
  const [refeicoes, setRefeicoesState] = useState([]);
  const [pesagens, setPesagensState] = useState([]);
  const [agendamentos, setAgendamentosState] = useState([]);
  const [pacientes, setPacientesState] = useState([]);
  const [anamnese, setAnamneseState] = useState(null);

  useEffect(() => {
    if (!usuarioLogado) return;
    if (usuarioLogado.tipo === "patient") {
      setAnamneseState(load(`anamnese_${usuarioLogado.id}`, null));
      fetch(`/registros/refeicoes/${usuarioLogado.id}`)
        .then(r => r.json()).then(data => setRefeicoesState(data))
        .catch(() => setRefeicoesState(load(`refeicoes_${usuarioLogado.id}`, [])));
      fetch(`/registros/pesagens/${usuarioLogado.id}`)
        .then(r => r.json()).then(data => setPesagensState(data))
        .catch(() => setPesagensState(load(`pesagens_${usuarioLogado.id}`, [])));
      setAgendamentosState(load(`agenda_${usuarioLogado.id}`, []));
    } else if (usuarioLogado.tipo === "nutritionist") {
      setPacientesState(load(`pacientes_${usuarioLogado.id}`, []));
      setAgendamentosState(load(`agenda_nutri_${usuarioLogado.id}`, []));
    }
  }, []);

  function setNutricionistas(fn) {
    setNutricionistasState(prev => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      save("nutrilife_nutricionistas", next);
      return next;
    });
  }
  function setRefeicoes(fn, uid) {
    setRefeicoesState(prev => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      save(`refeicoes_${uid}`, next);
      return next;
    });
  }
  function setPesagens(fn, uid) {
    setPesagensState(prev => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      save(`pesagens_${uid}`, next);
      return next;
    });
  }
  function setAgendamentos(fn, key) {
    setAgendamentosState(prev => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      save(key, next);
      return next;
    });
  }
  function setPacientes(fn, uid) {
    setPacientesState(prev => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      save(`pacientes_${uid}`, next);
      return next;
    });
  }

  // --- Auth ---
  async function login(email, senha, tipo) {
    if (tipo === "admin") {
      if (email === "admin@nutrilife.com" && senha === "123456") {
        const admin = { id: 0, nome: "Administrador", email, tipo: "admin" };
        setUsuarioLogado(admin);
        save("nutrilife_sessao", admin);
        return { ok: true };
      }
      return { ok: false, erro: "Credenciais administrativas incorretas." };
    }

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
      const sessao = { ...usuario, nome: usuario.nomeCompleto, tipo: usuario.tipoUsuario === "NUTRICIONISTA" ? "nutritionist" : "patient" };
      setUsuarioLogado(sessao);
      save("nutrilife_sessao", sessao);
      setAnamneseState(load(`anamnese_${sessao.id}`, null));
      setRefeicoesState(load(`refeicoes_${sessao.id}`, []));
      setPesagensState(load(`pesagens_${sessao.id}`, []));
      setAgendamentosState(load(`agenda_${sessao.id}`, []));
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
  }

  // --- Cadastro ---
  async function cadastrarPaciente(dados) {
    try {
      const res = await fetch("/usuarios/paciente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeCompleto:   dados.nome,
          email:          dados.email,
          senha:          dados.senha,
          telefone:       dados.telefone   || null,
          cpf:            dados.cpf        || null,
          dataNascimento: dados.dataNascimento || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { ok: false, erro: err.message || "Erro ao criar conta." };
      }
      const usuario = await res.json();
      return { ok: true, usuario };
    } catch {
      return { ok: false, erro: "Erro ao conectar com o servidor." };
    }
  }

  async function cadastrarNutricionista(dados) {
    try {
      const res = await fetch("/usuarios/nutricionista", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeCompleto: dados.nome,
          email:        dados.email,
          senha:        dados.senha,
          telefone:     dados.telefone,
          crn:          dados.crn,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { ok: false, erro: err.message || "Erro ao criar conta." };
      }
      return { ok: true };
    } catch {
      return { ok: false, erro: "Erro ao conectar com o servidor." };
    }
  }

  // --- Anamnese ---
  async function salvarAnamnese(dados) {
    const idUsuario = usuarioLogado?.id;
    if (!idUsuario) {
      setAnamneseState(dados);
      return;
    }
    try {
      const res = await fetch("/anamnese", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          peso:         parseFloat(dados.peso)   || 0,
          altura:       parseFloat(dados.altura) || 0,
          idade:        parseInt(dados.idade)    || null,
          sexo:         dados.sexo === "masculino" ? "M" : "F",
          objetivo:     dados.objetivo ? dados.objetivo.toUpperCase() : "MANUTENCAO",
          atividade:    dados.nivelAtividade || "sedentario",
          sono:         parseInt(dados.horasSono) || null,
          comorbidades: dados.comorbidades || null,
          restricoes:   dados.restricoes   || null,
          cliente:      { id: idUsuario },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Erro ao salvar anamnese.");
        return;
      }
      const salvo = await res.json();
      setAnamneseState(salvo);
      save(`anamnese_${idUsuario}`, salvo);
    } catch {
      setAnamneseState(dados);
      save(`anamnese_${idUsuario}`, dados);
    }
  }

  // --- Refeições ---
  async function adicionarRefeicao(refeicao) {
    if (!usuarioLogado) return;
    try {
      const res = await fetch("/registros/refeicoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...refeicao, cliente: { id: usuarioLogado.id } }),
      });
      const salva = await res.json();
      setRefeicoesState(prev => [...prev, salva]);
    } catch {
      setRefeicoes(prev => [...prev, { ...refeicao, id: Date.now() }], usuarioLogado.id);
    }
  }
  async function editarRefeicao(id, dados) {
    if (!usuarioLogado) return;
    try {
      const res = await fetch(`/registros/refeicoes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      const atualizada = await res.json();
      setRefeicoesState(prev => prev.map(r => r.id === id ? atualizada : r));
    } catch {
      setRefeicoes(prev => prev.map(r => r.id === id ? { ...r, ...dados } : r), usuarioLogado.id);
    }
  }
  async function removerRefeicao(id) {
    if (!usuarioLogado) return;
    try {
      await fetch(`/registros/refeicoes/${id}`, { method: "DELETE" });
      setRefeicoesState(prev => prev.filter(r => r.id !== id));
    } catch {
      setRefeicoes(prev => prev.filter(r => r.id !== id), usuarioLogado.id);
    }
  }

  // --- Pesagens ---
  async function adicionarPesagem(pesagem) {
    if (!usuarioLogado) return;
    try {
      const res = await fetch("/registros/pesagens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...pesagem, cliente: { id: usuarioLogado.id } }),
      });
      const salva = await res.json();
      setPesagensState(prev => [...prev, salva]);
    } catch {
      setPesagens(prev => [...prev, { ...pesagem, id: Date.now() }], usuarioLogado.id);
    }
  }

  // --- Agenda ---
  function agendaKey() {
    if (!usuarioLogado) return null;
    return usuarioLogado.tipo === "nutritionist"
      ? `agenda_nutri_${usuarioLogado.id}`
      : `agenda_${usuarioLogado.id}`;
  }
  async function adicionarAgendamento(agendamento) {
    const key = agendaKey();
    if (!key) return;
    // salva no localStorage (agenda não precisa de IDs do banco)
    const novo = { ...agendamento, id: Date.now().toString(), status: "confirmed" };
    setAgendamentos(prev => [...prev, novo], key);
  }
  function editarAgendamento(id, dados) {
    const key = agendaKey();
    if (!key) return;
    fetch(`/consultas/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dados) }).catch(() => {});
    setAgendamentos(prev => prev.map(a => a.id === id ? { ...a, ...dados } : a), key);
  }
  function removerAgendamento(id) {
    const key = agendaKey();
    if (!key) return;
    fetch(`/consultas/${id}`, { method: "DELETE" }).catch(() => {});
    setAgendamentos(prev => prev.filter(a => a.id !== id), key);
  }

  // --- Pacientes (nutricionista) ---
  function adicionarPaciente(paciente) {
    if (!usuarioLogado) return;
    const novo = { ...paciente, id: Date.now(), status: "Em dia", progress: 0, evolution: [] };
    setPacientes(prev => [...prev, novo], usuarioLogado.id);
  }

  // --- Avaliações ---
  function adicionarAvaliacao(nutricionistaId, avaliacao) {
    setNutricionistas(prev =>
      prev.map(n => n.id === nutricionistaId ? { ...n, reviews: [avaliacao, ...n.reviews] } : n)
    );
  }

  return (
    <AppContext.Provider value={{
      usuarioLogado, login, logout,
      usuarios, cadastrarPaciente, cadastrarNutricionista,
      nutricionistas, adicionarAvaliacao,
      anamnese, salvarAnamnese,
      refeicoes, adicionarRefeicao, editarRefeicao, removerRefeicao,
      pesagens, adicionarPesagem,
      agendamentos, adicionarAgendamento, editarAgendamento, removerAgendamento,
      pacientes, adicionarPaciente,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
