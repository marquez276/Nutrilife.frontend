import { Layout } from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Users, Stethoscope, UserCheck, Star, Search, BarChart, CheckCircle, XCircle, Clock, CreditCard, Eye } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [imcFilter, setImcFilter] = useState("all");

  // ── Dados do backend
  const [stats, setStats] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [nutricionistas, setNutricionistas] = useState([]);
  const [barData, setBarData] = useState([]);
  const [diasInatividade, setDiasInatividade] = useState(30);
  const [savingConfig, setSavingConfig] = useState(false);
  const [pagamentos, setPagamentos] = useState([]);
  const [loadingPagamentos, setLoadingPagamentos] = useState(false);
  const [comprovanteAberto, setComprovanteAberto] = useState(null);
  const [carregandoComprovante, setCarregandoComprovante] = useState(false);
  const [processando, setProcessando] = useState(null);

  const abrirComprovante = async (pagamentoId) => {
    setCarregandoComprovante(true);
    try {
      const res = await fetch(`/admin/pagamentos/${pagamentoId}/comprovante`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setComprovanteAberto(data.comprovanteUrl);
    } catch {
      toast.error("Erro ao carregar comprovante.");
    } finally {
      setCarregandoComprovante(false);
    }
  };

  const loadPagamentos = useCallback(() => {
    setLoadingPagamentos(true);
    fetch("/admin/pagamentos/todos")
      .then(r => r.json())
      .then(data => setPagamentos(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingPagamentos(false));
  }, []);

  const handleAprovar = async (id) => {
    setProcessando(id);
    try {
      const res = await fetch(`/admin/pagamentos/${id}/aprovar`, { method: "PUT" });
      if (!res.ok) throw new Error();
      toast.success("Pagamento aprovado! Nutricionista liberado.");
      loadPagamentos();
      loadStats();
    } catch { toast.error("Erro ao aprovar pagamento."); }
    setProcessando(null);
  };

  const handleRejeitar = async (id) => {
    setProcessando(id);
    try {
      const res = await fetch(`/admin/pagamentos/${id}/rejeitar`, { method: "PUT" });
      if (!res.ok) throw new Error();
      toast.success("Pagamento rejeitado.");
      loadPagamentos();
    } catch { toast.error("Erro ao rejeitar pagamento."); }
    setProcessando(null);
  };

  const loadStats = useCallback(() => {
    fetch("/admin/stats").then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  const loadCrescimento = useCallback(() => {
    fetch("/admin/crescimento").then(r => r.json()).then(data => setBarData(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  useEffect(() => {
    loadStats();
    loadCrescimento();
    loadPagamentos();
    fetch("/admin/usuarios").then(r => r.json()).then(data => setUsuarios(Array.isArray(data) ? data : [])).catch(() => {});
    fetch("/admin/nutricionistas").then(r => r.json()).then(data => setNutricionistas(Array.isArray(data) ? data : [])).catch(() => {});
    fetch("/admin/configuracoes").then(r => r.json()).then(d => setDiasInatividade(d.diasInatividade ?? 30)).catch(() => {});
  }, [loadStats, loadCrescimento, loadPagamentos]);

  const salvarConfiguracoes = () => {
    setSavingConfig(true);
    fetch("/admin/configuracoes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ diasInatividade }),
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(() => toast.success("Configurações salvas!"))
      .catch(() => toast.error("Erro ao salvar configurações."))
      .finally(() => setSavingConfig(false));
  };

  // ── Derivados
  const totalUsuarios = stats?.totalPacientes ?? usuarios.length;
  const totalNutricionistas = stats?.totalNutricionistas ?? nutricionistas.length;
  const mediaAvaliacoes = stats?.mediaAvaliacoes != null ? stats.mediaAvaliacoes.toFixed(1) : "—";

  const comNutri = nutricionistas.filter(n => n.ativo).length;
  const semNutri = totalNutricionistas - comNutri;
  const pieData = [
    { name: "Ativos", value: comNutri, color: "#9333ea" },
    { name: "Inativos", value: semNutri, color: "#d8b4fe" },
  ];

  const filteredUsers = usuarios.filter(u => {
    const matchSearch = u.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;
    if (imcFilter === "all") return true;
    return u.status?.toLowerCase() === imcFilter;
  });

  return (
    <Layout userType="admin">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Painel de Administração</h1>
          <p className="text-gray-500">Gestão global do sistema NutriLife</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="dashboard">Painel Geral</TabsTrigger>
            <TabsTrigger value="pagamentos" className="relative">
              Pagamentos
              {pagamentos.filter(p => p.status === "PENDENTE").length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                  {pagamentos.filter(p => p.status === "PENDENTE").length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* ── PAINEL GERAL ── */}
          <TabsContent value="dashboard" className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Total de Pacientes", value: totalUsuarios, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                { title: "Nutricionistas", value: totalNutricionistas, icon: Stethoscope, color: "text-green-600", bg: "bg-green-50" },
                { title: "Nutricionistas Ativos", value: comNutri, icon: UserCheck, color: "text-purple-600", bg: "bg-purple-50" },
                { title: "Média Avaliações", value: mediaAvaliacoes, icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
              ].map((m, i) => {
                const Icon = m.icon;
                return (
                  <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">{m.title}</p>
                          <h3 className="text-2xl font-bold text-gray-900">{m.value}</h3>
                        </div>
                        <div className={`p-3 rounded-xl ${m.bg}`}>
                          <Icon className={`w-6 h-6 ${m.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart className="w-4 h-4 text-green-600" /> Crescimento de Usuários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip cursor={{ fill: "#f0fdf4" }} />
                        <Bar dataKey="users" fill="#16a34a" radius={[4, 4, 0, 0]} />
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Nutricionistas por Status</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col">
                  <div className="w-full" style={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {pieData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    {pieData.map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="text-gray-600">{d.name}</span>
                        </div>
                        <span className="font-bold text-gray-900">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gestão de Usuários */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" /> Gestão de Usuários
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 md:flex-none">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input placeholder="Buscar por nome..." className="pl-10 w-full md:w-[200px]" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                      {[{ key: "all", label: "Todos" }, { key: "abaixo", label: "Abaixo" }, { key: "ideal", label: "Ideal" }, { key: "acima", label: "Acima" }].map(({ key, label }) => (
                        <Button key={key} variant={imcFilter === key ? "secondary" : "ghost"} size="sm" onClick={() => setImcFilter(key)} className="text-xs px-2">{label}</Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {filteredUsers.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">
                    {usuarios.length === 0 ? "Nenhum usuário cadastrado ainda." : "Nenhum usuário encontrado."}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>IMC</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map(user => (
                        <TableRow key={user.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-gray-900">{user.nome}</TableCell>
                          <TableCell className="text-gray-500">{user.email}</TableCell>
                          <TableCell className="font-bold text-gray-700">{user.imc ?? "—"}</TableCell>
                          <TableCell>
                            <Badge className={
                              user.status === "Ideal" ? "bg-green-100 text-green-700 border-none" :
                              user.status === "Abaixo" ? "bg-blue-100 text-blue-700 border-none" :
                              user.status === "Acima" ? "bg-amber-100 text-amber-700 border-none" :
                              "bg-gray-100 text-gray-700 border-none"
                            }>
                              {user.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── PAGAMENTOS ── */}
          <TabsContent value="pagamentos" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Comprovantes de Pagamento PIX</h2>
                <p className="text-sm text-gray-500">Aprove ou rejeite os pagamentos para liberar o acesso dos nutricionistas</p>
              </div>
              <Button variant="outline" size="sm" onClick={loadPagamentos} disabled={loadingPagamentos}>
                {loadingPagamentos ? "Carregando..." : "Atualizar"}
              </Button>
            </div>

            {pagamentos.length === 0 ? (
              <Card className="border-none shadow-sm">
                <CardContent className="p-12 text-center text-gray-400">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum comprovante enviado ainda.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pagamentos.map(p => (
                  <Card key={p.id} className="border-none shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex items-center gap-4 p-5">
                        <div className={`p-3 rounded-xl shrink-0 ${
                          p.status === "APROVADO" ? "bg-green-50" :
                          p.status === "REJEITADO" ? "bg-red-50" : "bg-amber-50"
                        }`}>
                          {p.status === "APROVADO" ? <CheckCircle className="w-6 h-6 text-green-600" /> :
                           p.status === "REJEITADO" ? <XCircle className="w-6 h-6 text-red-500" /> :
                           <Clock className="w-6 h-6 text-amber-500" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-gray-900">
                              {p.nutricionista?.nomeCompleto ?? `ID: ${p.nutricionista?.id ?? "—"}`}
                            </p>
                            <Badge className={`border-none text-xs ${
                              p.status === "APROVADO" ? "bg-green-100 text-green-700" :
                              p.status === "REJEITADO" ? "bg-red-100 text-red-600" :
                              "bg-amber-100 text-amber-700"
                            }`}>
                              {p.status === "APROVADO" ? "Aprovado" :
                               p.status === "REJEITADO" ? "Rejeitado" : "Pendente"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {p.nutricionista?.email ?? ""}
                            {p.nutricionista?.crn ? ` · CRN ${p.nutricionista.crn}` : ""}
                            {p.nutricionista?.telefone ? ` · ${p.nutricionista.telefone}` : ""}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Enviado em: {p.dataEnvio ? new Date(p.dataEnvio).toLocaleString("pt-BR") : "—"}
                          </p>
                          {p.observacao && (
                            <p className="text-xs text-gray-400 mt-1">Plano: {p.observacao}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {p.temComprovante && (
                            <Button variant="outline" size="sm" onClick={() => abrirComprovante(p.id)} disabled={carregandoComprovante}>
                              <Eye className="w-4 h-4 mr-1" /> Ver comprovante
                            </Button>
                          )}
                          {p.status === "PENDENTE" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                disabled={processando === p.id}
                                onClick={() => handleAprovar(p.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                {processando === p.id ? "..." : "Aprovar"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                disabled={processando === p.id}
                                onClick={() => handleRejeitar(p.id)}
                              >
                                <XCircle className="w-4 h-4 mr-1" /> Rejeitar
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Modal comprovante */}
            {comprovanteAberto && (
              <div
                className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
                onClick={() => setComprovanteAberto(null)}
              >
                <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute -top-10 right-0 text-white border-white/30 hover:bg-white/10"
                    onClick={() => setComprovanteAberto(null)}
                  >
                    Fechar
                  </Button>
                  <img
                    src={comprovanteAberto.startsWith("data:") ? comprovanteAberto : `data:image/jpeg;base64,${comprovanteAberto}`}
                    alt="Comprovante"
                    className="w-full rounded-xl shadow-2xl"
                  />
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── RELATÓRIOS ── */}
          <TabsContent value="reports" className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader><CardTitle>Resumo do Sistema</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-6">
                <div className="p-6 bg-green-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Total de Cadastros</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.totalCadastros ?? "—"}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats?.totalPacientes ?? 0} pacientes + {stats?.totalNutricionistas ?? 0} nutricionistas</p>
                </div>
                <div className="p-6 bg-blue-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Nutricionistas Ativos</p>
                  <p className="text-3xl font-bold text-gray-900">{comNutri}</p>
                  <p className="text-xs text-gray-500 mt-1">Pagamento aprovado</p>
                </div>
                <div className="p-6 bg-purple-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Média de Avaliações</p>
                  <p className="text-3xl font-bold text-gray-900">{mediaAvaliacoes}</p>
                  <p className="text-xs text-gray-500 mt-1">Dos nutricionistas</p>
                </div>
                <div className="p-6 bg-amber-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Pagamentos Pendentes</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.pagamentosPendentes ?? "—"}</p>
                  <p className="text-xs text-gray-500 mt-1">Aguardando aprovação</p>
                </div>
                <div className="p-6 bg-red-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Total de Logs</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.totalLogs ?? "—"}</p>
                  <p className="text-xs text-gray-500 mt-1">Registros de atividade</p>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de nutricionistas */}
            {nutricionistas.length > 0 && (
              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle>Nutricionistas Cadastrados</CardTitle></CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>CRN</TableHead>
                        <TableHead>Média</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {nutricionistas.map(n => (
                        <TableRow key={n.id}>
                          <TableCell className="font-medium">{n.nome}</TableCell>
                          <TableCell className="text-gray-500">{n.crn || "—"}</TableCell>
                          <TableCell>{n.mediaAvaliacoes ?? "—"}</TableCell>
                          <TableCell>
                            <Badge className={n.ativo ? "bg-green-100 text-green-700 border-none" : "bg-gray-100 text-gray-700 border-none"}>
                              {n.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── CONFIGURAÇÕES ── */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader><CardTitle>Configurações do Sistema</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="max-w-sm space-y-2">
                  <Label htmlFor="dias-inatividade">Notificar se inatividade superior a (dias)</Label>
                  <Input
                    id="dias-inatividade"
                    type="number"
                    min="1"
                    value={diasInatividade}
                    onChange={e => setDiasInatividade(Number(e.target.value))}
                  />
                  <p className="text-xs text-gray-400">Usuários sem acesso há mais de {diasInatividade} dias serão sinalizados.</p>
                </div>
                <div className="pt-4 border-t">
                  <Button className="bg-green-600 hover:bg-green-700" onClick={salvarConfiguracoes} disabled={savingConfig}>
                    {savingConfig ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
