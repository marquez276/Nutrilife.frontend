import { Layout } from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Users, Plus, Search, TrendingUp, ClipboardList, Calendar, Copy, Check, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Label } from "../components/ui/label";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Textarea } from "../components/ui/textarea";
import { useApp } from "../context/AppContext";
import { apiFetch } from "../api";

export default function Nutricionista() {
  const navigate = useNavigate();
  const { vinculos, aceitarVinculo, recusarVinculo, gerarConvite, pacientesExternos, cadastrarPacienteExterno, usuarioLogado } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [observacoes, setObservacoes] = useState([]);
  const [novaObservacao, setNovaObservacao] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const [isEvolutionDialogOpen, setIsEvolutionDialogOpen] = useState(false);
  const [evolutionPatient, setEvolutionPatient] = useState(null);
  const [evolutionData, setEvolutionData] = useState(null);
  const [convite, setConvite] = useState(null);
  const [conviteCopiado, setConviteCopiado] = useState(false);
  const FORM_EXTERNO_VAZIO = { nome: "", objetivo: "", observacoes: "" };
  const [externoForm, setExternoForm] = useState(FORM_EXTERNO_VAZIO);

  const pacientesAtivos = vinculos.filter(v => v.status === "ATIVO");
  const solicitacoesPendentes = vinculos.filter(v => v.status === "PENDENTE" && v.origem === "PACIENTE");
  const convitesAbertos = vinculos.filter(v => v.status === "PENDENTE" && v.origem === "NUTRICIONISTA");

  const [planosPorCliente, setPlanosPorCliente] = useState({});

  useEffect(() => {
    pacientesAtivos.forEach(v => {
      if (!v.clienteId || planosPorCliente[v.clienteId] !== undefined) return;
      apiFetch(`/plano/personalizado/${v.clienteId}`)
        .then(r => (r.ok ? r.json() : null))
        .then(plano => setPlanosPorCliente(prev => ({ ...prev, [v.clienteId]: plano })))
        .catch(() => setPlanosPorCliente(prev => ({ ...prev, [v.clienteId]: null })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vinculos]);

  const handleOpenPatient = async (vinculo) => {
    setSelectedPatient(vinculo);
    setObservacoes([]);
    setNovaObservacao("");
    if (vinculo?.clienteId) {
      try {
        const res = await apiFetch(`/prontuario/${vinculo.clienteId}`);
        if (res.ok) setObservacoes(await res.json());
      } catch {}
    }
  };

  const handleSaveClinicalNotes = async () => {
    if (!selectedPatient?.clienteId || !novaObservacao.trim()) return;
    setSavingNotes(true);
    try {
      const res = await apiFetch("/prontuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteId: selectedPatient.clienteId, texto: novaObservacao.trim() }),
      });
      if (res.ok) {
        const salva = await res.json();
        setObservacoes(prev => [salva, ...prev]);
        setNovaObservacao("");
        toast.success("Observação salva com sucesso.");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Não foi possível salvar a observação.");
      }
    } catch { toast.error("Erro ao conectar com o servidor."); }
    setSavingNotes(false);
  };

  const handleOpenEvolution = async (vinculo) => {
    setEvolutionPatient(vinculo);
    setEvolutionData(null);
    if (vinculo?.clienteId) {
      try {
        const res = await apiFetch(`/clientes/${vinculo.clienteId}/progresso`);
        if (res.ok) setEvolutionData(await res.json());
      } catch {}
    }
    setIsEvolutionDialogOpen(true);
  };

  const handleGerarConvite = async () => {
    const codigo = await gerarConvite();
    if (codigo) setConvite(codigo);
  };

  const copiarConvite = () => {
    navigator.clipboard?.writeText(convite).then(() => {
      setConviteCopiado(true);
      setTimeout(() => setConviteCopiado(false), 2000);
    });
  };

  const handleSalvarExterno = async () => {
    if (!externoForm.nome) { toast.error("Informe o nome do paciente."); return; }
    const { ok } = await cadastrarPacienteExterno(externoForm);
    if (ok) {
      toast.success(`Paciente ${externoForm.nome} cadastrado.`);
      setExternoForm(FORM_EXTERNO_VAZIO);
      setIsNewPatientDialogOpen(false);
    }
  };

  const filteredPatients = pacientesAtivos.filter(v =>
    (v.clienteNome || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout userType="nutritionist">
      <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portal do Nutricionista</h1>
            <p className="text-gray-500">Olá, {usuarioLogado?.nome || "Nutricionista"}! Gerencie seus pacientes.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-green-200 text-green-700 bg-green-50" onClick={() => navigate("/agenda-nutricionista")}>
              <Calendar className="w-4 h-4 mr-2" /> Agenda de Hoje
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => { setConvite(null); setIsNewPatientDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar Paciente
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-none shadow-sm bg-green-600 text-white">
            <CardContent className="p-6">
              <p className="text-sm font-bold opacity-80 uppercase mb-1">Pacientes Vinculados</p>
              <h3 className="text-3xl font-bold">{pacientesAtivos.length}</h3>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm font-bold text-gray-500 uppercase mb-1">CRN</p>
              <h3 className="text-xl font-bold text-gray-900">{usuarioLogado?.crn || "—"}</h3>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm font-bold text-gray-500 uppercase mb-1">Especialidade</p>
              <h3 className="text-sm font-bold text-gray-900">{usuarioLogado?.specialty || "—"}</h3>
            </CardContent>
          </Card>
        </div>

        {solicitacoesPendentes.length > 0 && (
          <Card className="mb-8 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Solicitações de acompanhamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {solicitacoesPendentes.map(v => (
                <div key={v.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                  <span className="font-medium text-gray-800">{v.clienteNome}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => recusarVinculo(v.id)}>Recusar</Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => aceitarVinculo(v.id)}>Aceitar</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {convitesAbertos.length > 0 && (
          <Card className="mb-8 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Convites aguardando uso</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {convitesAbertos.map(v => (
                <Badge key={v.id} variant="outline" className="text-sm py-1 px-3">{v.codigoConvite}</Badge>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="mb-8 border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input placeholder="Buscar paciente por nome..." className="pl-12 bg-white h-11 border-gray-200" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredPatients.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                {pacientesAtivos.length === 0
                  ? "Nenhum paciente vinculado, melhore seu perfil e espere seus clientes"
                  : "Nenhum paciente encontrado com esse nome."}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-px bg-gray-100">
                {filteredPatients.map(v => {
                  const plano = planosPorCliente[v.clienteId];
                  const temPlano = !!plano;
                  return (
                    <div key={v.id} className="bg-white p-6 hover:bg-green-50/30 transition-colors">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="w-16 h-16 border-2 border-green-50">
                          <AvatarFallback className="bg-green-100 text-green-700 font-bold text-xl">
                            {(v.clienteNome || "?").charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 truncate">{v.clienteNome}</h3>
                          <p className="text-sm text-gray-500 truncate">{v.clienteEmail}</p>
                        </div>
                      </div>

                      <div className="mb-4 p-3 bg-gray-50 rounded-xl text-sm">
                        {temPlano ? (
                          <>
                            <p className="font-medium text-green-700">✓ Plano criado</p>
                            {plano.dataInicio && (
                              <p className="text-gray-400">Última atualização: {new Date(plano.dataInicio).toLocaleDateString("pt-BR")}</p>
                            )}
                          </>
                        ) : (
                          <p className="font-medium text-gray-400">○ Nenhum plano criado</p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" className="flex-1 h-11 rounded-xl" onClick={() => handleOpenPatient(v)}>
                          <ClipboardList className="w-4 h-4 mr-2" /> Prontuário
                        </Button>
                        <Button variant="outline" className="flex-1 h-11 rounded-xl" onClick={() => handleOpenEvolution(v)}>
                          <TrendingUp className="w-4 h-4 mr-2" /> Evolução
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700 w-full h-11 rounded-xl" onClick={() => navigate(`/plano-personalizado/${v.clienteId}`)}>
                          {temPlano ? "Criar Novo Plano Personalizado" : "Criar Plano Personalizado"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {pacientesExternos.length > 0 && (
          <Card className="mb-8 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Pacientes sem conta</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              {pacientesExternos.map(p => (
                <div key={p.id} className="p-4 bg-gray-50 rounded-xl">
                  <p className="font-bold text-gray-900">{p.nome}</p>
                  <p className="text-sm text-gray-500">{p.objetivo || "Sem objetivo definido"}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Dialog Prontuário */}
        <Dialog open={!!selectedPatient} onOpenChange={open => !open && setSelectedPatient(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedPatient && (
              <>
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    <Users className="w-6 h-6 text-green-600" /> Prontuário: {selectedPatient.clienteNome}
                  </DialogTitle>
                  <DialogDescription>Observações clínicas do paciente.</DialogDescription>
                </DialogHeader>
                <div className="p-4 border-2 border-dashed rounded-xl">
                  <Label className="text-sm font-bold text-gray-600 mb-2 block">Nova observação</Label>
                  <Textarea
                    className="w-full text-sm text-gray-700 resize-none"
                    placeholder="Adicione uma observação clínica..."
                    rows={4}
                    value={novaObservacao}
                    onChange={e => setNovaObservacao(e.target.value)}
                  />
                  <Button
                    className="mt-3 bg-green-600 hover:bg-green-700"
                    onClick={handleSaveClinicalNotes}
                    disabled={savingNotes || !novaObservacao.trim()}
                  >
                    {savingNotes ? "Salvando..." : "Salvar observação"}
                  </Button>
                </div>

                <div className="mt-4">
                  <Label className="text-sm font-bold text-gray-600 mb-2 block">Histórico de observações</Label>
                  {observacoes.length === 0 ? (
                    <p className="text-sm text-gray-400 py-4">Nenhuma observação registrada ainda.</p>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {observacoes.map(o => (
                        <div key={o.id} className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-400 font-medium mb-1">
                            {new Date(o.dataHora).toLocaleDateString("pt-BR")} — Nutricionista
                          </p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{o.texto}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog Evolução */}
        <Dialog open={isEvolutionDialogOpen} onOpenChange={setIsEvolutionDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {evolutionPatient && (
              <div className="py-2">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-green-600" /> Evolução: {evolutionPatient.clienteNome}
                  </DialogTitle>
                  <DialogDescription>Histórico de peso do paciente.</DialogDescription>
                </DialogHeader>
                {evolutionData?.historico?.length > 0 ? (
                  <>
                    <div className="h-[250px] w-full mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={evolutionData.historico}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="data" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={["dataMin - 2", "dataMax + 2"]} />
                          <Tooltip contentStyle={{ border: "none", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                          <Line type="monotone" dataKey="peso" stroke="#16a34a" strokeWidth={3} dot={{ fill: "#16a34a", r: 5 }} activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-green-50 rounded-xl text-center">
                        <p className="text-[10px] text-green-600 font-bold uppercase">Peso Inicial</p>
                        <p className="text-lg font-bold text-gray-900">{evolutionData.pesoInicial ?? "—"}kg</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-xl text-center">
                        <p className="text-[10px] text-blue-600 font-bold uppercase">Peso Ideal</p>
                        <p className="text-lg font-bold text-gray-900">{evolutionData.pesoIdeal ?? "—"}kg</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-xl text-center">
                        <p className="text-[10px] text-purple-600 font-bold uppercase">IMC</p>
                        <p className="text-lg font-bold text-gray-900">{evolutionData.imc ?? "—"}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-gray-400 py-8">Nenhum histórico de peso registrado para este paciente.</p>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog Adicionar Paciente */}
        <Dialog open={isNewPatientDialogOpen} onOpenChange={setIsNewPatientDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-green-600" /> Adicionar Paciente
              </DialogTitle>
              <DialogDescription>Vincule um paciente que já tem conta ou cadastre um sem conta.</DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="convite">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="convite">Paciente já possui conta</TabsTrigger>
                <TabsTrigger value="externo">Cadastrar sem conta</TabsTrigger>
              </TabsList>
              <TabsContent value="convite" className="space-y-4 pt-4">
                <p className="text-sm text-gray-500">
                  Gere um código e envie para o paciente (WhatsApp, Instagram, etc). Ele informa o código no NutriLife para se vincular a você.
                </p>
                {convite ? (
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                    <span className="text-lg font-bold text-green-700">{convite}</span>
                    <Button size="sm" variant="outline" onClick={copiarConvite}>
                      {conviteCopiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                ) : (
                  <Button className="bg-green-600 hover:bg-green-700 w-full" onClick={handleGerarConvite}>
                    Gerar código de convite
                  </Button>
                )}
              </TabsContent>
              <TabsContent value="externo" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Nome Completo *</Label>
                  <Input placeholder="João da Silva" value={externoForm.nome} onChange={e => setExternoForm(p => ({ ...p, nome: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Objetivo</Label>
                  <Input placeholder="Emagrecimento" value={externoForm.objetivo} onChange={e => setExternoForm(p => ({ ...p, objetivo: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea rows={3} value={externoForm.observacoes} onChange={e => setExternoForm(p => ({ ...p, observacoes: e.target.value }))} />
                </div>
                <DialogFooter>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={handleSalvarExterno}>Salvar Paciente</Button>
                </DialogFooter>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
