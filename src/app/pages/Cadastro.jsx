import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { apiFetch } from "../api";

// ── Funções de máscara ──────────────────────────────────────────────
function maskCpf(v) {
  return v.replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskTelefone(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2)  return d.replace(/^(\d{0,2})/, "($1");
  if (d.length <= 7)  return d.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
  return d.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

function maskData(v) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

// Converte DD/MM/AAAA → AAAA-MM-DD para o backend
function dataParaIso(v) {
  const parts = v.split("/");
  if (parts.length !== 3 || parts[2].length !== 4) return null;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

export default function Cadastro() {
  const navigate = useNavigate();
  const { cadastrarPaciente, cadastrarNutricionista, login } = useApp();

  const [paciente, setPaciente] = useState({
    nome: "", email: "", senha: "", confirmar: "",
    cpf: "", dataNascimento: "", telefone: "",
  });
  const [nutri, setNutri] = useState({
    nome: "", email: "", crn: "", especialidade: "",
    telefone: "", senha: "", confirmar: "",
  });
  const [crnStatus, setCrnStatus] = useState(null); // null | "ok" | "erro"

  // ── Handlers de máscara ──
  const onPacienteCpf = e => setPaciente(p => ({ ...p, cpf: maskCpf(e.target.value) }));
  const onPacienteTel = e => setPaciente(p => ({ ...p, telefone: maskTelefone(e.target.value) }));
  const onPacienteData = e => setPaciente(p => ({ ...p, dataNascimento: maskData(e.target.value) }));
  const onNutriTel = e => setNutri(n => ({ ...n, telefone: maskTelefone(e.target.value) }));

  const verificarCrn = async (crn) => {
    if (!crn || crn.length < 4) { setCrnStatus(null); return; }
    try {
      const r = await apiFetch(`/admin/verificar-crn?crn=${encodeURIComponent(crn)}`);
      const data = await r.json();
      setCrnStatus(data.disponivel ? "ok" : "erro");
    } catch { setCrnStatus(null); }
  };

  const handlePaciente = async (e) => {
    e.preventDefault();
    if (paciente.cpf.replace(/\D/g, "").length !== 11) {
      toast.error("CPF inválido. Use o formato 000.000.000-00.");
      return;
    }
    if (paciente.telefone.replace(/\D/g, "").length < 10) {
      toast.error("Telefone inválido. Use o formato (00) 00000-0000.");
      return;
    }
    const dataIso = dataParaIso(paciente.dataNascimento);
    if (!dataIso) {
      toast.error("Data de nascimento inválida. Use DD/MM/AAAA.");
      return;
    }
    if (paciente.senha !== paciente.confirmar) { toast.error("As senhas não coincidem."); return; }

    const resultado = await cadastrarPaciente({
      nome: paciente.nome,
      email: paciente.email,
      senha: paciente.senha,
      cpf: paciente.cpf,
      dataNascimento: dataIso,
      telefone: paciente.telefone,
    });
    if (!resultado.ok) { toast.error(resultado.erro); return; }

    const loginResult = await login(paciente.email, paciente.senha, "patient");
    if (!loginResult.ok) {
      toast.error("Conta criada, mas erro ao fazer login. Tente entrar manualmente.");
      navigate("/login");
      return;
    }
    toast.success("Conta criada! Preencha sua ficha de anamnese.");
    navigate("/anamnese");
  };

  const handleNutri = async (e) => {
    e.preventDefault();
    if (nutri.telefone.replace(/\D/g, "").length < 10) {
      toast.error("Telefone inválido. Use o formato (00) 00000-0000.");
      return;
    }
    if (nutri.senha !== nutri.confirmar) { toast.error("As senhas não coincidem."); return; }
    if (crnStatus === "erro") { toast.error("CRN já cadastrado no sistema."); return; }

    const resultado = await cadastrarNutricionista({
      nome: nutri.nome,
      email: nutri.email,
      crn: nutri.crn,
      especialidade: nutri.especialidade,
      telefone: nutri.telefone,
      senha: nutri.senha,
    });
    if (!resultado.ok) { toast.error(resultado.erro); return; }
    toast.success("Conta profissional criada!");
    navigate("/login?type=nutritionist", { state: { email: nutri.email, senha: nutri.senha } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">NutriLife</h1>
          <p className="text-gray-600">Crie sua conta e comece sua transformação</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Criar Nova Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="patient" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="patient">Paciente</TabsTrigger>
                <TabsTrigger value="nutritionist">Nutricionista</TabsTrigger>
              </TabsList>

              {/* ── Paciente ── */}
              <TabsContent value="patient">
                <form onSubmit={handlePaciente} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input id="nome" placeholder="João Silva" required
                        value={paciente.nome}
                        onChange={e => setPaciente(p => ({ ...p, nome: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input id="cpf" placeholder="000.000.000-00" required
                        value={paciente.cpf} onChange={onPacienteCpf} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                      <Input id="dataNascimento" placeholder="DD/MM/AAAA" required
                        value={paciente.dataNascimento} onChange={onPacienteData} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone-pac">Telefone</Label>
                      <Input id="telefone-pac" placeholder="(00) 00000-0000" required
                        value={paciente.telefone} onChange={onPacienteTel} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input id="email" type="email" placeholder="joao@email.com" required
                        value={paciente.email}
                        onChange={e => setPaciente(p => ({ ...p, email: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="senha">Senha</Label>
                      <Input id="senha" type="password" placeholder="••••••••" required
                        value={paciente.senha}
                        onChange={e => setPaciente(p => ({ ...p, senha: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmar">Confirmar Senha</Label>
                      <Input id="confirmar" type="password" placeholder="••••••••" required
                        value={paciente.confirmar}
                        onChange={e => setPaciente(p => ({ ...p, confirmar: e.target.value }))} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Criar Conta</Button>
                </form>
              </TabsContent>

              {/* ── Nutricionista ── */}
              <TabsContent value="nutritionist">
                <form onSubmit={handleNutri} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nutr-nome">Nome Completo</Label>
                      <Input id="nutr-nome" placeholder="Dra. Maria Santos" required
                        value={nutri.nome}
                        onChange={e => setNutri(n => ({ ...n, nome: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nutr-email">E-mail</Label>
                      <Input id="nutr-email" type="email" placeholder="maria@email.com" required
                        value={nutri.email}
                        onChange={e => setNutri(n => ({ ...n, email: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="crn">CRN</Label>
                      <Input
                        id="crn" placeholder="12345/P" required
                        value={nutri.crn}
                        onChange={e => { setNutri(n => ({ ...n, crn: e.target.value })); verificarCrn(e.target.value); }}
                        className={crnStatus === "erro" ? "border-red-400" : crnStatus === "ok" ? "border-green-400" : ""}
                      />
                      {crnStatus === "erro" && <p className="text-xs text-red-500">CRN já cadastrado.</p>}
                      {crnStatus === "ok"  && <p className="text-xs text-green-600">CRN disponível.</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="especialidade">Especialidade</Label>
                      <Input id="especialidade" placeholder="Ex: Nutrição Esportiva" required
                        value={nutri.especialidade}
                        onChange={e => setNutri(n => ({ ...n, especialidade: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nutr-tel">Telefone</Label>
                      <Input id="nutr-tel" placeholder="(00) 00000-0000" required
                        value={nutri.telefone} onChange={onNutriTel} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nutr-senha">Senha</Label>
                      <Input id="nutr-senha" type="password" placeholder="••••••••" required
                        value={nutri.senha}
                        onChange={e => setNutri(n => ({ ...n, senha: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nutr-confirmar">Confirmar Senha</Label>
                      <Input id="nutr-confirmar" type="password" placeholder="••••••••" required
                        value={nutri.confirmar}
                        onChange={e => setNutri(n => ({ ...n, confirmar: e.target.value }))} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    Criar Conta Profissional
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{" "}
                <Link to="/login" className="text-green-600 hover:underline font-medium">Faça login</Link>
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">← Voltar para a página inicial</Link>
        </div>
      </div>
    </div>
  );
}
