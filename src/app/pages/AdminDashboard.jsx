import { Layout } from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Users, Stethoscope, UserCheck, Star, TrendingUp, Search, BarChart } from "lucide-react";
import { useState } from "react";
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { useApp } from "../context/AppContext";

export default function AdminDashboard() {
  const { usuarios, nutricionistas } = useApp();
  const [imcFilter, setImcFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");

  const totalUsuarios = usuarios.length;
  const totalNutricionistas = nutricionistas.length;

  // Calcula IMC dos usuários que têm anamnese salva
  const usuariosComDados = usuarios.map(u => {
    const anamneseRaw = localStorage.getItem(`anamnese_${u.id}`);
    if (!anamneseRaw) return { ...u, imc: null, status: "Sem dados", nutri: "—" };
    const a = JSON.parse(anamneseRaw);
    const peso = parseFloat(a.peso);
    const altura = parseFloat(a.altura) / 100;
    const imc = altura > 0 ? parseFloat((peso / (altura * altura)).toFixed(1)) : null;
    let status = "Sem dados";
    if (imc) {
      if (imc < 18.5) status = "Abaixo";
      else if (imc < 25) status = "Ideal";
      else status = "Acima";
    }
    return { ...u, imc, status };
  });

  const filteredUsers = usuariosComDados.filter(u => {
    const matchSearch = u.nome.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;
    if (imcFilter === "all") return true;
    return u.status.toLowerCase() === imcFilter;
  });

  const comNutri = usuarios.filter(u => localStorage.getItem(`agenda_${u.id}`)).length;
  const semNutri = totalUsuarios - comNutri;

  const pieData = [
    { name: "Com Nutricionista", value: comNutri || 0, color: "#9333ea" },
    { name: "Sem Nutricionista", value: semNutri || 0, color: "#d8b4fe" },
  ];

  // Crescimento simulado baseado no total real
  const barData = [
    { month: "Jan", users: Math.max(0, totalUsuarios - 3) },
    { month: "Fev", users: Math.max(0, totalUsuarios - 2) },
    { month: "Mar", users: Math.max(0, totalUsuarios - 1) },
    { month: "Abr", users: totalUsuarios },
  ];

  const mediaAvaliacoes = nutricionistas.length > 0
    ? (nutricionistas.reduce((sum, n) => {
        if (!n.reviews?.length) return sum;
        return sum + n.reviews.reduce((s, r) => s + r.rating, 0) / n.reviews.length;
      }, 0) / nutricionistas.filter(n => n.reviews?.length > 0).length || 0).toFixed(1)
    : "—";

  return (
    <Layout userType="admin">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Painel de Administração</h1>
          <p className="text-gray-500">Gestão global do sistema NutriLife</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="dashboard">Painel Geral</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Total de Usuários", value: totalUsuarios, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                { title: "Nutricionistas", value: totalNutricionistas, icon: Stethoscope, color: "text-green-600", bg: "bg-green-50" },
                { title: "Com Nutricionista", value: comNutri, icon: UserCheck, color: "text-purple-600", bg: "bg-purple-50" },
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
                  <CardTitle className="text-lg">Vínculo com Nutricionistas</CardTitle>
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
                    {totalUsuarios === 0 ? "Nenhum usuário cadastrado ainda." : "Nenhum usuário encontrado."}
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

          <TabsContent value="reports" className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader><CardTitle>Resumo do Sistema</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-6">
                <div className="p-6 bg-green-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Total de Cadastros</p>
                  <p className="text-3xl font-bold text-gray-900">{totalUsuarios + totalNutricionistas}</p>
                  <p className="text-xs text-gray-500 mt-1">{totalUsuarios} pacientes + {totalNutricionistas} nutricionistas</p>
                </div>
                <div className="p-6 bg-blue-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Nutricionistas Ativos</p>
                  <p className="text-3xl font-bold text-gray-900">{totalNutricionistas}</p>
                  <p className="text-xs text-gray-500 mt-1">Cadastrados na plataforma</p>
                </div>
                <div className="p-6 bg-purple-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Média de Avaliações</p>
                  <p className="text-3xl font-bold text-gray-900">{mediaAvaliacoes}</p>
                  <p className="text-xs text-gray-500 mt-1">Dos nutricionistas</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader><CardTitle>Configurações do Sistema</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Notificar Admin se inatividade superior a (dias)</Label>
                    <Input type="number" defaultValue="30" />
                  </div>
                  <div className="space-y-2">
                    <Label>Limite de Pacientes por Nutricionista</Label>
                    <Input type="number" defaultValue="100" />
                  </div>
                </div>
                <div className="pt-4 border-t flex gap-4">
                  <Button className="bg-green-600 hover:bg-green-700">Salvar Configurações</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
