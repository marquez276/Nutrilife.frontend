import { Layout } from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ShieldCheck, PieChart, FileText, Activity, Database } from "lucide-react";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { useApp } from "../context/AppContext";

const PAGE_SIZE = 20;

export default function AdminPerfil() {
  const { usuarioLogado } = useApp();
  const [activeSection, setActiveSection] = useState("profile");

  // ── Perfil
  const adminNome  = usuarioLogado?.nome  || "Administrador";
  const adminEmail = usuarioLogado?.email || "—";

  // ── Admins pendentes
  const [pendentes, setPendentes] = useState([]);
  useEffect(() => {
    fetch("/admin/pendentes")
      .then(r => r.json())
      .then(data => setPendentes(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const aprovarAdmin = (id) => {
    fetch(`/admin/${id}/aprovar`, { method: "PUT" })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(() => {
        setPendentes(prev => prev.filter(a => a.id !== id));
        toast.success("Admin aprovado com sucesso!");
      })
      .catch(() => toast.error("Erro ao aprovar admin."));
  };

  // ── Relatórios
  const [stats, setStats] = useState(null);
  useEffect(() => {
    if (activeSection !== "reports") return;
    fetch("/admin/stats")
      .then(r => r.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, [activeSection]);

  // ── Logs
  const [logs, setLogs] = useState([]);
  const [logPage, setLogPage] = useState(0);
  const [logTotal, setLogTotal] = useState(0);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    if (activeSection !== "logs") return;
    setLogs([]);
    setLogPage(0);
    fetchLogs(0, true);
  }, [activeSection]);

  function fetchLogs(page, replace = false) {
    setLoadingLogs(true);
    fetch(`/admin/logs?page=${page}&size=${PAGE_SIZE}`)
      .then(r => r.json())
      .then(data => {
        setLogs(prev => replace ? data.content : [...prev, ...data.content]);
        setLogTotal(data.totalElements || 0);
        setLogPage(page);
      })
      .catch(() => toast.error("Erro ao carregar logs."))
      .finally(() => setLoadingLogs(false));
  }

  const hasMore = logs.length < logTotal;

  const fmtData = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("pt-BR");
  };

  return (
    <Layout userType="admin">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Perfil do Administrador</h1>
          <p className="text-gray-500">Gestão de conta administrativa e configurações do sistema</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 mb-4 border-4 border-green-100">
                  <AvatarFallback className="bg-green-600 text-white text-2xl font-bold">ADM</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{adminNome}</h2>
                <p className="text-sm text-gray-500 mb-4">{adminEmail}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3" /> Acesso Total
                </div>
              </div>
              <div className="mt-8 space-y-2">
                {[
                  { key: "profile", icon: ShieldCheck, label: "Perfil" },
                  { key: "reports", icon: PieChart, label: "Relatórios Globais" },
                  { key: "logs", icon: FileText, label: "Logs de Atividades" },
                ].map(({ key, icon: Icon, label }) => (
                  <Button key={key} variant={activeSection === key ? "secondary" : "outline"} className="w-full justify-start" onClick={() => setActiveSection(key)}>
                    <Icon className="w-4 h-4 mr-2" /> {label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            {/* ── PERFIL ── */}
            {activeSection === "profile" && (
              <>
                <Card>
                  <CardHeader><CardTitle>Dados de Acesso</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-500">Os dados de acesso do administrador são gerenciados internamente e não podem ser alterados por aqui.</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Nome</p>
                        <p className="font-medium text-gray-900">{adminNome}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">E-mail</p>
                        <p className="font-medium text-gray-900">{adminEmail}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {pendentes.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-amber-500" /> Admins Aguardando Aprovação</CardTitle></CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>E-mail</TableHead>
                            <TableHead className="text-right">Ação</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendentes.map(a => (
                            <TableRow key={a.id}>
                              <TableCell className="font-medium">{a.nomeCompleto}</TableCell>
                              <TableCell className="text-gray-500">{a.email}</TableCell>
                              <TableCell className="text-right">
                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => aprovarAdmin(a.id)}>Aprovar</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* ── RELATÓRIOS ── */}
            {activeSection === "reports" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-green-600" /> Relatórios Globais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!stats ? (
                    <p className="text-gray-400 text-center py-8">Carregando dados...</p>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        { bg: "bg-green-50", iconBg: "bg-green-600", Icon: Database, label: "Total de Cadastros", value: stats.totalCadastros ?? "—", sub: `${stats.totalPacientes ?? 0} pacientes + ${stats.totalNutricionistas ?? 0} nutricionistas` },
                        { bg: "bg-blue-50", iconBg: "bg-blue-600", Icon: Activity, label: "Nutricionistas Ativos", value: stats.totalNutricionistas ?? "—", sub: "Cadastrados na plataforma" },
                        { bg: "bg-amber-50", iconBg: "bg-amber-600", Icon: ShieldCheck, label: "Pagamentos Pendentes", value: stats.pagamentosPendentes ?? "—", sub: "Aguardando aprovação" },
                        { bg: "bg-purple-50", iconBg: "bg-purple-600", Icon: FileText, label: "Total de Logs", value: stats.totalLogs ?? "—", sub: "Registros de atividade" },
                      ].map(({ bg, iconBg, Icon, label, value, sub }, i) => (
                        <div key={i} className={`p-6 ${bg} rounded-xl`}>
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`p-3 ${iconBg} rounded-lg`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">{label}</p>
                              <p className="text-2xl font-bold text-gray-900">{value}</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">{sub}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ── LOGS ── */}
            {activeSection === "logs" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" /> Logs de Atividades do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {logs.length === 0 && !loadingLogs ? (
                    <p className="text-center text-gray-400 py-8">Nenhum log registrado.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Ação</TableHead>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.map((l) => (
                          <TableRow key={l.id}>
                            <TableCell className="font-medium">{l.usuarioNome || "—"}</TableCell>
                            <TableCell className="text-gray-600">{l.acao}</TableCell>
                            <TableCell className="text-sm text-gray-500">{fmtData(l.dataHora)}</TableCell>
                            <TableCell>
                              <Badge className={l.status === "Sucesso" ? "bg-green-100 text-green-700 border-none" : "bg-red-100 text-red-700 border-none"}>
                                {l.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                  <div className="mt-6 flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      {logTotal === 0 ? "Nenhum registro." : `Mostrando ${logs.length} de ${logTotal} registros`}
                    </p>
                    {hasMore && (
                      <Button variant="outline" disabled={loadingLogs} onClick={() => fetchLogs(logPage + 1)}>
                        {loadingLogs ? "Carregando..." : "Carregar Mais"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
