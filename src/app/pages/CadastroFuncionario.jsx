import { Layout } from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { UserPlus, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiJson } from "../api";
import { useApp } from "../context/AppContext";

const EMPTY = { nome: "", email: "", telefone: "", senha: "", confirmar: "" };

const fmtData = (iso) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "—");

export default function CadastroFuncionario() {
  const { usuarioLogado } = useApp();
  const [form, setForm] = useState(EMPTY);
  const [salvando, setSalvando] = useState(false);
  const [funcionarios, setFuncionarios] = useState([]);

  const carregar = () =>
    apiJson("/admin/funcionarios").then(d => setFuncionarios(Array.isArray(d) ? d : [])).catch(e => toast.error(e.message));

  useEffect(() => { carregar(); }, []);

  const set = (campo) => (e) => setForm(f => ({ ...f, [campo]: e.target.value }));

  const cadastrar = async (e) => {
    e.preventDefault();
    if (form.senha.length < 6) { toast.error("A senha deve ter ao menos 6 caracteres."); return; }
    if (form.senha !== form.confirmar) { toast.error("As senhas não coincidem."); return; }
    setSalvando(true);
    try {
      await apiJson("/admin/funcionarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: form.nome, email: form.email, telefone: form.telefone, senha: form.senha }),
      });
      toast.success("Funcionário cadastrado! Ele já pode entrar como Admin.");
      setForm(EMPTY);
      carregar();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const alternarStatus = async (f) => {
    try {
      await apiJson(`/admin/usuarios/${f.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !f.ativo }),
      });
      setFuncionarios(prev => prev.map(x => (x.id === f.id ? { ...x, ativo: !f.ativo } : x)));
      toast.success(f.ativo ? "Acesso desativado." : "Acesso reativado.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Layout userType="admin">
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cadastro de Funcionário / Admin</h1>
          <p className="text-gray-500">Crie contas de acesso administrativo para a equipe do NutriLife</p>
        </div>

        <Card className="border-none shadow-sm max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-green-600" /> Novo funcionário</CardTitle>
            <CardDescription>A conta já nasce ativa e aprovada, com acesso total ao painel admin.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={cadastrar} className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="f-nome">Nome completo</Label>
                <Input id="f-nome" value={form.nome} onChange={set("nome")} maxLength={100} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="f-email">E-mail</Label>
                <Input id="f-email" type="email" value={form.email} onChange={set("email")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="f-tel">Telefone (opcional)</Label>
                <Input id="f-tel" value={form.telefone} onChange={set("telefone")} maxLength={20} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="f-senha">Senha</Label>
                <Input id="f-senha" type="password" value={form.senha} onChange={set("senha")} minLength={6} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="f-conf">Confirmar senha</Label>
                <Input id="f-conf" type="password" value={form.confirmar} onChange={set("confirmar")} required />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={salvando}>
                  {salvando ? "Cadastrando..." : "Cadastrar funcionário"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-green-600" /> Equipe administrativa</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead>Último acesso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funcionarios.map(f => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">
                      {f.nome} {f.principal && <Badge className="ml-1 bg-amber-100 text-amber-700 border-none">Principal</Badge>}
                    </TableCell>
                    <TableCell className="text-gray-500">{f.email}</TableCell>
                    <TableCell className="text-gray-500">{fmtData(f.dataCadastro)}</TableCell>
                    <TableCell className="text-gray-500">{fmtData(f.ultimoAcesso)}</TableCell>
                    <TableCell>
                      <Badge className={f.ativo ? "bg-green-100 text-green-700 border-none" : "bg-gray-100 text-gray-700 border-none"}>
                        {f.ativo ? "Ativo" : "Desativado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {!f.principal && f.id !== usuarioLogado?.id && (
                        <Button size="sm" variant="outline" onClick={() => alternarStatus(f)}>
                          {f.ativo ? "Desativar" : "Reativar"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
