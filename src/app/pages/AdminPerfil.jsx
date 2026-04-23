import { Layout } from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ShieldCheck, Mail, Phone, Lock, Save, Settings, PieChart, FileText, Activity, AlertCircle, Database } from "lucide-react";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { toast } from "sonner";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function AdminPerfil() {
  const [activeSection, setActiveSection] = useState("profile");

  const handleSave = () => {
    toast.success("Perfil do administrador atualizado com sucesso!");
  };

  const logs = [
    { id: 1, user: "João Silva", action: "Login no sistema", time: "20/03/2026 14:32", status: "Sucesso" },
    { id: 2, user: "Admin", action: "Alteração de configuração", time: "20/03/2026 12:15", status: "Sucesso" },
    { id: 3, user: "Maria Santos", action: "Tentativa de login falhada", time: "20/03/2026 09:45", status: "Erro" },
    { id: 4, user: "Dra. Maria Santos", action: "Cadastro de novo paciente", time: "19/03/2026 16:20", status: "Sucesso" },
    { id: 5, user: "Sistema", action: "Backup automático", time: "19/03/2026 03:00", status: "Sucesso" },
  ];

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
                <h2 className="text-xl font-bold text-gray-900 mb-1">Super Admin</h2>
                <p className="text-sm text-gray-500 mb-4">admin@nutrilife.com.br</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3" /> Acesso Total
                </div>
              </div>
              <div className="mt-8 space-y-2">
                {[
                  { key: "profile", icon: ShieldCheck, label: "Perfil" },
                  { key: "settings", icon: Settings, label: "Configurações do Sistema" },
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
            {activeSection === "profile" && (
              <>
                <Card>
                  <CardHeader><CardTitle>Dados de Acesso</CardTitle></CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="admin-name">Nome do Admin</Label>
                          <Input id="admin-name" defaultValue="Super Admin" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="admin-email">E-mail Corporativo</Label>
                          <Input id="admin-email" defaultValue="admin@nutrilife.com.br" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="admin-phone">Telefone de Contato</Label>
                          <Input id="admin-phone" defaultValue="(11) 3333-4444" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="admin-role">Cargo</Label>
                          <Input id="admin-role" defaultValue="Diretor de Operações" readOnly className="bg-gray-50" />
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Segurança</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-pass">Senha Atual</Label>
                      <Input id="current-pass" type="password" placeholder="••••••••" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-pass">Nova Senha</Label>
                        <Input id="new-pass" type="password" placeholder="••••••••" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-pass">Confirmar Nova Senha</Label>
                        <Input id="confirm-pass" type="password" placeholder="••••••••" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="flex justify-end gap-3">
                  <Button variant="outline">Descartar</Button>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" /> Salvar Alterações
                  </Button>
                </div>
              </>
            )}

            {activeSection === "settings" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-green-600" /> Configurações do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900">Parâmetros Gerais</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tempo de sessão (minutos)</Label>
                        <Input type="number" defaultValue="30" />
                      </div>
                      <div className="space-y-2">
                        <Label>Máx. tentativas de login</Label>
                        <Input type="number" defaultValue="5" />
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 border-t flex gap-4">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" /> Salvar Configurações
                    </Button>
                    <Button variant="outline" className="text-red-600 border-red-100 hover:bg-red-50">
                      <AlertCircle className="w-4 h-4 mr-2" /> Resetar Padrões
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "reports" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-green-600" /> Relatórios Globais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { bg: "bg-green-50", iconBg: "bg-green-600", Icon: Database, label: "Total de Cadastros", value: "1,332", sub: "Crescimento de 12.4% no último mês" },
                      { bg: "bg-blue-50", iconBg: "bg-blue-600", Icon: Activity, label: "Usuários Ativos (30d)", value: "987", sub: "Taxa de retenção: 87%" },
                      { bg: "bg-purple-50", iconBg: "bg-purple-600", Icon: PieChart, label: "Consultas Realizadas", value: "5,842", sub: "Média de 194 consultas/dia" },
                      { bg: "bg-amber-50", iconBg: "bg-amber-600", Icon: ShieldCheck, label: "Satisfação Geral", value: "4.85/5.0", sub: "Baseado em 2,341 avaliações" },
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
                  <div className="pt-6 border-t mt-6">
                    <Button variant="outline">
                      <FileText className="w-4 h-4 mr-2" /> Exportar Relatório Completo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "logs" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" /> Logs de Atividades do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.user}</TableCell>
                          <TableCell className="text-gray-600">{log.action}</TableCell>
                          <TableCell className="text-sm text-gray-500">{log.time}</TableCell>
                          <TableCell>
                            <Badge className={log.status === "Sucesso" ? "bg-green-100 text-green-700 border-none" : "bg-red-100 text-red-700 border-none"}>
                              {log.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-6 flex justify-between items-center">
                    <p className="text-sm text-gray-500">Mostrando 5 de 1,247 registros</p>
                    <Button variant="outline">Carregar Mais</Button>
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
