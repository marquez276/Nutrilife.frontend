import { Layout } from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";
import { Coffee, Sun, Cookie, Moon, Plus, Trash2, ClipboardList, Save } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router";
import { useApp } from "../context/AppContext";
import { apiFetch } from "../api";
import { toast } from "sonner";

const icones = [Coffee, Sun, Cookie, Moon];
const cores = [
  "bg-amber-50 text-amber-600",
  "bg-orange-50 text-orange-600",
  "bg-yellow-50 text-yellow-600",
  "bg-indigo-50 text-indigo-600",
];

function refeicaoVazia() {
  return { nome: "", horario: "", alimentos: [] };
}

export default function PlanoPersonalizado() {
  const { clienteId: clienteIdParam } = useParams();
  const { usuarioLogado, vinculos } = useApp();
  const podeEditar = usuarioLogado?.tipo === "nutritionist";
  const clienteId = clienteIdParam || usuarioLogado?.id;

  const [plano, setPlano] = useState(null);
  const [refeicoes, setRefeicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [anamnese, setAnamnese] = useState(null);
  const [catalogo, setCatalogo] = useState([]);
  const [buscaAberta, setBuscaAberta] = useState(null); // índice da refeição com a busca de alimento aberta
  const [buscaTexto, setBuscaTexto] = useState("");

  const clienteNome = plano?.cliente?.nomeCompleto
    || vinculos.find(v => String(v.clienteId) === String(clienteId))?.clienteNome
    || "Paciente";

  useEffect(() => {
    if (!clienteId) return;
    setLoading(true);
    apiFetch(`/plano/personalizado/${clienteId}`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        setPlano(data);
        setRefeicoes(data?.refeicoes?.map(r => ({
          nome: r.nome || "",
          horario: r.horario || "",
          alimentos: r.alimentos || [],
        })) || []);
      })
      .catch(() => setPlano(null))
      .finally(() => setLoading(false));

    if (podeEditar) {
      apiFetch(`/anamnese/cliente/${clienteId}`)
        .then(r => (r.ok ? r.json() : null))
        .then(setAnamnese)
        .catch(() => setAnamnese(null));
      apiFetch("/admin/alimentos")
        .then(r => (r.ok ? r.json() : []))
        .then(d => setCatalogo(Array.isArray(d) ? d : []))
        .catch(() => setCatalogo([]));
    }
  }, [clienteId]);

  const resultadosBusca = useMemo(() => {
    if (!buscaTexto.trim()) return [];
    const q = buscaTexto.toLowerCase();
    return catalogo.filter(a => a.nome?.toLowerCase().includes(q)).slice(0, 8);
  }, [buscaTexto, catalogo]);

  const adicionarRefeicao = () => setRefeicoes(prev => [...prev, refeicaoVazia()]);
  const removerRefeicao = (i) => setRefeicoes(prev => prev.filter((_, idx) => idx !== i));
  const atualizarRefeicao = (i, campo, valor) =>
    setRefeicoes(prev => prev.map((r, idx) => (idx === i ? { ...r, [campo]: valor } : r)));

  const adicionarAlimento = (refeicaoIndex, alimentoCatalogo) => {
    setRefeicoes(prev => prev.map((r, idx) => {
      if (idx !== refeicaoIndex) return r;
      return {
        ...r,
        alimentos: [...r.alimentos, {
          nome: alimentoCatalogo.nome,
          calorias: alimentoCatalogo.calorias,
          proteina: alimentoCatalogo.proteina,
          carboidrato: alimentoCatalogo.carboidrato,
          gordura: alimentoCatalogo.gordura,
          categoria: alimentoCatalogo.categoria,
          quantidade: 100,
          unidade: "g",
        }],
      };
    }));
    setBuscaAberta(null);
    setBuscaTexto("");
  };

  const removerAlimento = (refeicaoIndex, alimentoIndex) =>
    setRefeicoes(prev => prev.map((r, idx) =>
      idx !== refeicaoIndex ? r : { ...r, alimentos: r.alimentos.filter((_, j) => j !== alimentoIndex) }
    ));

  const atualizarAlimento = (refeicaoIndex, alimentoIndex, campo, valor) =>
    setRefeicoes(prev => prev.map((r, idx) => {
      if (idx !== refeicaoIndex) return r;
      return { ...r, alimentos: r.alimentos.map((a, j) => (j === alimentoIndex ? { ...a, [campo]: valor } : a)) };
    }));

  const salvarPlano = async () => {
    setSalvando(true);
    try {
      const res = await apiFetch(`/plano/personalizado/${clienteId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refeicoes }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message); }
      const salvo = await res.json();
      setPlano(salvo);
      toast.success("Plano personalizado enviado com sucesso!");
    } catch (e) {
      toast.error(e.message || "Não foi possível salvar o plano.");
    } finally {
      setSalvando(false);
    }
  };

  const FichaAnamneseConteudo = () => (
    anamnese ? (
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-xl"><p className="text-[10px] text-gray-400 uppercase font-bold">Peso</p><p className="font-bold text-gray-900">{anamnese.peso} kg</p></div>
          <div className="p-3 bg-gray-50 rounded-xl"><p className="text-[10px] text-gray-400 uppercase font-bold">Altura</p><p className="font-bold text-gray-900">{anamnese.altura} cm</p></div>
          <div className="p-3 bg-gray-50 rounded-xl"><p className="text-[10px] text-gray-400 uppercase font-bold">Idade</p><p className="font-bold text-gray-900">{anamnese.idade} anos</p></div>
          <div className="p-3 bg-gray-50 rounded-xl"><p className="text-[10px] text-gray-400 uppercase font-bold">Sexo</p><p className="font-bold text-gray-900">{anamnese.sexo}</p></div>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl"><p className="text-[10px] text-gray-400 uppercase font-bold">Objetivo</p><p className="font-bold text-gray-900">{anamnese.objetivo}</p></div>
        <div className="p-3 bg-gray-50 rounded-xl"><p className="text-[10px] text-gray-400 uppercase font-bold">Atividade física</p><p className="font-bold text-gray-900">{anamnese.atividade || "—"}</p></div>
        <div className="p-3 bg-gray-50 rounded-xl"><p className="text-[10px] text-gray-400 uppercase font-bold">Sono</p><p className="font-bold text-gray-900">{anamnese.sono ? `${anamnese.sono}h` : "—"}</p></div>
        <div className="p-3 bg-gray-50 rounded-xl"><p className="text-[10px] text-gray-400 uppercase font-bold">Restrições</p><p className="font-bold text-gray-900">{anamnese.restricoes || "Nenhuma"}</p></div>
        <div className="p-3 bg-gray-50 rounded-xl"><p className="text-[10px] text-gray-400 uppercase font-bold">Comorbidades</p><p className="font-bold text-gray-900">{anamnese.comorbidades || "Nenhuma"}</p></div>
      </div>
    ) : <p className="text-gray-400 text-sm">Este paciente ainda não preencheu a ficha de anamnese.</p>
  );

  if (loading) return <Layout userType={usuarioLogado?.tipo}><div className="p-8 text-gray-400">Carregando...</div></Layout>;

  if (!podeEditar && !plano) {
    return (
      <Layout userType="patient">
        <div className="p-8">
          <Card><CardContent className="p-12 text-center text-gray-400">
            Seu nutricionista ainda não disponibilizou um Plano Personalizado para você.
          </CardContent></Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userType={usuarioLogado?.tipo}>
      <div className="p-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Plano Personalizado</h1>
            <p className="text-gray-500">
              Paciente: {clienteNome}
              {plano?.dataInicio && <> · Última atualização: {new Date(plano.dataInicio).toLocaleDateString("pt-BR")}</>}
            </p>
          </div>
          <div className="flex gap-2">
            {podeEditar && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline"><ClipboardList className="w-4 h-4 mr-2" /> Ver ficha de anamnese</Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                  <SheetHeader><SheetTitle>Ficha de Anamnese</SheetTitle></SheetHeader>
                  <div className="px-4"><FichaAnamneseConteudo /></div>
                </SheetContent>
              </Sheet>
            )}
            {podeEditar && (
              <Button className="bg-green-600 hover:bg-green-700" onClick={salvarPlano} disabled={salvando}>
                <Save className="w-4 h-4 mr-2" /> {salvando ? "Enviando..." : "Enviar plano"}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {refeicoes.map((refeicao, i) => {
            const Icon = icones[i % icones.length];
            const total = refeicao.alimentos?.reduce((s, a) => s + (Number(a.calorias) || 0), 0) ?? 0;
            return (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                      <div className={`p-3 rounded-lg ${cores[i % cores.length]}`}><Icon className="w-6 h-6" /></div>
                      {podeEditar ? (
                        <div className="flex gap-2 flex-1">
                          <Input placeholder="Nome da refeição (ex: Café da manhã)" value={refeicao.nome} onChange={e => atualizarRefeicao(i, "nome", e.target.value)} />
                          <Input type="time" className="w-32" value={refeicao.horario} onChange={e => atualizarRefeicao(i, "horario", e.target.value)} />
                        </div>
                      ) : (
                        <CardTitle>{refeicao.nome} {refeicao.horario && <span className="text-gray-400 text-sm font-normal">· {refeicao.horario}</span>}</CardTitle>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{total.toFixed(0)}</p>
                        <p className="text-sm text-gray-500">kcal</p>
                      </div>
                      {podeEditar && (
                        <Button variant="ghost" size="icon" onClick={() => removerRefeicao(i)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {refeicao.alimentos?.map((alimento, j) => (
                      <div key={j} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg gap-3">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{alimento.nome}</p>
                          <p className="text-sm text-gray-500">P: {alimento.proteina}g · C: {alimento.carboidrato}g · G: {alimento.gordura}g</p>
                        </div>
                        {podeEditar ? (
                          <div className="flex items-center gap-2">
                            <Input type="number" className="w-20" value={alimento.quantidade ?? ""} onChange={e => atualizarAlimento(i, j, "quantidade", e.target.value)} />
                            <Input className="w-16" value={alimento.unidade ?? ""} onChange={e => atualizarAlimento(i, j, "unidade", e.target.value)} />
                            <Button variant="ghost" size="icon" onClick={() => removerAlimento(i, j)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">{alimento.quantidade} {alimento.unidade}</span>
                        )}
                      </div>
                    ))}

                    {podeEditar && (
                      buscaAberta === i ? (
                        <div className="relative p-3 border-2 border-dashed rounded-lg">
                          <Input autoFocus placeholder="Pesquisar alimento..." value={buscaTexto} onChange={e => setBuscaTexto(e.target.value)} />
                          {resultadosBusca.length > 0 && (
                            <div className="mt-2 border rounded-lg overflow-hidden bg-white shadow-sm">
                              {resultadosBusca.map(a => (
                                <button key={a.id} className="w-full text-left px-3 py-2 hover:bg-green-50 text-sm" onClick={() => adicionarAlimento(i, a)}>
                                  {a.nome} <span className="text-gray-400">· {a.calorias} kcal</span>
                                </button>
                              ))}
                            </div>
                          )}
                          <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setBuscaAberta(null); setBuscaTexto(""); }}>Cancelar</Button>
                        </div>
                      ) : (
                        <Button variant="outline" className="w-full border-dashed" onClick={() => setBuscaAberta(i)}>
                          <Plus className="w-4 h-4 mr-2" /> Adicionar alimento
                        </Button>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {podeEditar && (
          <Button variant="outline" className="w-full mt-6 border-dashed h-14" onClick={adicionarRefeicao}>
            <Plus className="w-4 h-4 mr-2" /> Adicionar refeição
          </Button>
        )}

        {!podeEditar && refeicoes.length === 0 && (
          <Card><CardContent className="p-12 text-center text-gray-400">Este plano ainda não possui refeições.</CardContent></Card>
        )}
      </div>
    </Layout>
  );
}
