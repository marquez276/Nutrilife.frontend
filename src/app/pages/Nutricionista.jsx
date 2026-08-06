import { Layout } from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Users, Plus, Search, TrendingUp, ClipboardList, Calendar } from "lucide-react";
import { useState } from "react";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Label } from "../components/ui/label";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { useApp } from "../context/AppContext";

export default function Nutricionista() {
  const navigate = useNavigate();
  const { pacientes, adicionarPaciente, usuarioLogado } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [clinicalNotesId, setClinicalNotesId] = useState(null);
  const [savingNotes, setSavingNotes] = useState(false);
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const [isEvolutionDialogOpen, setIsEvolutionDialogOpen] = useState(false);
  const [evolutionPatient, setEvolutionPatient] = useState(null);
  const [progressNote, setProgressNote] = useState("");
  const [savingProgress, setSavingProgress] = useState(false);
  const FORM_VAZIO = { name: "", age: "", sex: "", weight: "", height: "", goal: "", healthIssues: "", restrictions: "", activity: "", sleep: "" };
  const [newPatientForm, setNewPatientForm] = useState(FORM_VAZIO);
  const setField = (field, value) => setNewPatientForm(p => ({ ...p, [field]: value }));

  const handleOpenPatient = async (patient) => {
    setSelectedPatient(patient);
    setClinicalNotes("");
    setClinicalNotesId(null);
    if (usuarioLogado?.id && patient?.name) {
      try {
        const res = await fetch(`/prontuario/${usuarioLogado.id}/${encodeURIComponent(patient.name)}`);
        if (res.ok) {
          const data = await res.json();
          setClinicalNotes(data.observations || "");
          setClinicalNotesId(data.id > 0 ? data.id : null);
        }
      } catch {}
    }
  };

  const handleSaveClinicalNotes = async () => {
    if (!usuarioLogado?.id || !selectedPatient?.name) return;
    setSavingNotes(true);
    try {
      const res = await fetch("/prontuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultaId: clinicalNotesId,
          observations: clinicalNotes,
          pacienteNome: selectedPatient.name,
          nutricionistaId: usuarioLogado.id,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setClinicalNotesId(data.id);
        toast.success("Notas clínicas salvas!");
      } else {
        toast.error("Erro ao salvar notas.");
      }
    } catch { toast.error("Erro ao conectar com o servidor."); }
    setSavingNotes(false);
  };

  const handleOpenEvolution = async (patient) => {
    setEvolutionPatient(patient);
    setProgressNote("");
    if (usuarioLogado?.id && patient?.name) {
      try {
        const res = await fetch(`/prontuario/${usuarioLogado.id}/${encodeURIComponent(patient.name)}`);
        if (res.ok) {
          const data = await res.json();
          setProgressNote(data.observations || "");
        }
      } catch {}
    }
    setIsEvolutionDialogOpen(true);
  };

  const handleSaveProgressNote = async () => {
    if (!usuarioLogado?.id || !evolutionPatient?.name) return;
    setSavingProgress(true);
    try {
      const res = await fetch("/prontuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          observations: progressNote,
          pacienteNome: evolutionPatient.name,
          nutricionistaId: usuarioLogado.id,
        }),
      });
      if (res.ok) {
        toast.success("Nota de progresso salva!");
      } else {
        toast.error("Erro ao salvar nota.");
      }
    } catch { toast.error("Erro ao conectar com o servidor."); }
    setSavingProgress(false);
  };

  const handleSaveNewPatient = () => {
    if (!newPatientForm.name || !newPatientForm.age || !newPatientForm.weight) {
      toast.error("Preencha os campos obrigatórios (Nome, Idade, Peso)");
      return;
    }
    adicionarPaciente(newPatientForm);
    toast.success(`Paciente ${newPatientForm.name} adicionado!`);
    setIsNewPatientDialogOpen(false);
    setNewPatientForm(FORM_VAZIO);
  };

  const filteredPatients = pacientes.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsNewPatientDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Novo Paciente
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-none shadow-sm bg-green-600 text-white">
            <CardContent className="p-6">
              <p className="text-sm font-bold opacity-80 uppercase mb-1">Total de Pacientes</p>
              <h3 className="text-3xl font-bold">{pacientes.length}</h3>
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
                {pacientes.length === 0
                  ? "Nenhum paciente cadastrado ainda. Clique em \"Novo Paciente\" para adicionar."
                  : "Nenhum paciente encontrado com esse nome."}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-px bg-gray-100">
                {filteredPatients.map(patient => (
                  <div key={patient.id} className="bg-white p-6 hover:bg-green-50/30 transition-colors">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-16 h-16 border-2 border-green-50">
                        <AvatarFallback className="bg-green-100 text-green-700 font-bold text-xl">
                          {patient.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-gray-900 truncate">{patient.name}</h3>
                          <Badge className={patient.status === "Em dia" ? "bg-green-100 text-green-700 border-none" : "bg-amber-100 text-amber-700 border-none"}>
                            {patient.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{patient.age} anos • {patient.goal || "Sem objetivo definido"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Peso Atual</p>
                        <p className="text-lg font-bold text-gray-900">{patient.weight} kg</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Altura</p>
                        <p className="text-lg font-bold text-gray-900">{patient.height ? `${patient.height} cm` : "—"}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 h-11 rounded-xl" onClick={() => handleOpenPatient(patient)}>
                        <ClipboardList className="w-4 h-4 mr-2" /> Detalhes
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700 flex-1 h-11 rounded-xl" onClick={() => handleOpenEvolution(patient)}>
                        <TrendingUp className="w-4 h-4 mr-2" /> Evolução
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog Detalhes */}
        <Dialog open={!!selectedPatient} onOpenChange={open => !open && setSelectedPatient(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedPatient && (
              <>
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    <Users className="w-6 h-6 text-green-600" /> Prontuário: {selectedPatient.name}
                  </DialogTitle>
                  <DialogDescription>Detalhes completos do paciente.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Objetivo", value: selectedPatient.goal },
                    { label: "Restrições", value: selectedPatient.restrictions },
                    { label: "Atividade Física", value: selectedPatient.activity },
                    { label: "Problemas de Saúde", value: selectedPatient.healthIssues },
                    { label: "Horas de Sono", value: selectedPatient.sleep },
                    { label: "Sexo", value: selectedPatient.sex },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-4 bg-gray-50 rounded-xl">
                      <Label className="text-[10px] uppercase font-bold text-gray-400">{label}</Label>
                      <p className="text-gray-900 font-bold text-base mt-1">{value || "—"}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 border-2 border-dashed rounded-xl">
                  <Label className="text-sm font-bold text-gray-600 mb-2 block">Observações Clínicas</Label>
                  <Textarea
                    className="w-full text-sm text-gray-700 resize-none"
                    placeholder="Adicione notas clínicas aqui..."
                    rows={4}
                    value={clinicalNotes}
                    onChange={e => setClinicalNotes(e.target.value)}
                  />
                  <Button
                    className="mt-3 bg-green-600 hover:bg-green-700"
                    onClick={handleSaveClinicalNotes}
                    disabled={savingNotes}
                  >
                    {savingNotes ? "Salvando..." : "Salvar Notas"}
                  </Button>
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
                    <TrendingUp className="w-6 h-6 text-green-600" /> Evolução: {evolutionPatient.name}
                  </DialogTitle>
                  <DialogDescription>Histórico de peso do paciente.</DialogDescription>
                </DialogHeader>
                {evolutionPatient.evolution && evolutionPatient.evolution.length > 0 ? (
                  <>
                    <div className="h-[250px] w-full mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={evolutionPatient.evolution}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={["dataMin - 2", "dataMax + 2"]} />
                          <Tooltip contentStyle={{ border: "none", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                          <Line type="monotone" dataKey="weight" stroke="#16a34a" strokeWidth={3} dot={{ fill: "#16a34a", r: 5 }} activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-green-50 rounded-xl text-center">
                        <p className="text-[10px] text-green-600 font-bold uppercase">Peso Inicial</p>
                        <p className="text-lg font-bold text-gray-900">{evolutionPatient.evolution[0].weight}kg</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-xl text-center">
                        <p className="text-[10px] text-blue-600 font-bold uppercase">Peso Atual</p>
                        <p className="text-lg font-bold text-gray-900">{evolutionPatient.weight}kg</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-xl text-center">
                        <p className="text-[10px] text-purple-600 font-bold uppercase">Redução</p>
                        <p className="text-lg font-bold text-gray-900">-{(evolutionPatient.evolution[0].weight - evolutionPatient.weight).toFixed(1)}kg</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-gray-400 py-8">Nenhum histórico de peso registrado para este paciente.</p>
                )}
                <div className="mt-4 pt-4 border-t">
                  <Label className="text-sm font-bold text-gray-600 mb-2 block">Nota de Progresso</Label>
                  <Textarea
                    placeholder="Registre evolução, observações de progresso..."
                    rows={3}
                    value={progressNote}
                    onChange={e => setProgressNote(e.target.value)}
                  />
                  <Button
                    className="mt-3 bg-green-600 hover:bg-green-700"
                    onClick={handleSaveProgressNote}
                    disabled={savingProgress}
                  >
                    {savingProgress ? "Salvando..." : "Salvar Nota"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog Novo Paciente */}
        <Dialog open={isNewPatientDialogOpen} onOpenChange={setIsNewPatientDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-600" /> Adicionar Novo Paciente
              </DialogTitle>
              <DialogDescription>Preencha os dados do novo paciente.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo *</Label>
                  <Input placeholder="João da Silva" value={newPatientForm.name} onChange={e => setField("name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Idade *</Label>
                  <Input type="number" placeholder="30" value={newPatientForm.age} onChange={e => setField("age", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Peso (kg) *</Label>
                  <Input type="number" step="0.1" placeholder="75.5" value={newPatientForm.weight} onChange={e => setField("weight", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Altura (cm)</Label>
                  <Input placeholder="175" value={newPatientForm.height} onChange={e => setField("height", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Sexo Biológico</Label>
                <Select value={newPatientForm.sex} onValueChange={v => setField("sex", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Feminino">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Objetivo Principal</Label>
                <Select value={newPatientForm.goal} onValueChange={v => setField("goal", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Emagrecimento">Emagrecimento</SelectItem>
                    <SelectItem value="Ganho de Massa">Ganho de Massa</SelectItem>
                    <SelectItem value="Definição">Definição</SelectItem>
                    <SelectItem value="Saúde Geral">Saúde Geral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nível de Atividade Física</Label>
                <Select value={newPatientForm.activity} onValueChange={v => setField("activity", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sedentário">Sedentário</SelectItem>
                    <SelectItem value="Leve">Leve (1-3x/semana)</SelectItem>
                    <SelectItem value="Moderado">Moderado (3-5x/semana)</SelectItem>
                    <SelectItem value="Intenso">Intenso (6-7x/semana)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Horas de Sono (média)</Label>
                <Input type="number" placeholder="7" value={newPatientForm.sleep} onChange={e => setField("sleep", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Restrições Alimentares</Label>
                <Textarea placeholder="Lactose, glúten..." value={newPatientForm.restrictions} onChange={e => setField("restrictions", e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Problemas de Saúde</Label>
                <Textarea placeholder="Diabetes, hipertensão..." value={newPatientForm.healthIssues} onChange={e => setField("healthIssues", e.target.value)} rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewPatientDialogOpen(false)}>Cancelar</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleSaveNewPatient}>Salvar Paciente</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
