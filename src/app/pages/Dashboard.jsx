import { Layout } from "../components/Layout";
import { StatCard } from "../components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Flame, Target, TrendingDown, Apple, Clock, Plus, Edit2, Trash2, ChevronRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "../components/ui/button";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router";
import { useApp } from "../context/AppContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { anamnese, refeicoes, adicionarRefeicao, editarRefeicao, removerRefeicao, pesagens, usuarioLogado } = useApp();

  useEffect(() => {
    if (!anamnese) {
      toast.info("Por favor, preencha sua ficha de anamnese.");
      navigate("/anamnese");
    }
  }, [anamnese, navigate]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [formData, setFormData] = useState({ time: "", meal: "", items: "", calories: 0 });

  const caloriesGoal = 1800;
  const caloriesConsumed = refeicoes.reduce((sum, m) => sum + Number(m.calories), 0);
  const caloriesRemaining = Math.max(0, caloriesGoal - caloriesConsumed);
  const progressPercentage = Math.min(100, (caloriesConsumed / caloriesGoal) * 100);

  const pesoAtual = pesagens.length > 0 ? pesagens[pesagens.length - 1].peso : (anamnese?.peso || "—");
  const pesoInicial = anamnese?.peso || null;
  const pesoPerda = pesoInicial && pesagens.length > 0
    ? (parseFloat(pesoInicial) - parseFloat(pesoAtual)).toFixed(1)
    : null;

  const progressData = pesagens.slice(-8).map(p => ({ date: p.data, peso: parseFloat(p.peso) }));

  const calculateStatus = () => {
    if (!anamnese) return { label: "Carregando...", color: "bg-gray-100 text-gray-700", desc: "" };
    const weight = parseFloat(anamnese.peso);
    const height = parseFloat(anamnese.altura) / 100;
    const bmi = weight / (height * height);
    if (bmi < 18.5) return { label: "Abaixo do peso", color: "bg-blue-100 text-blue-700", desc: "Sua meta deve focar em ganho de massa." };
    if (bmi < 25) return { label: "Peso Ideal", color: "bg-green-100 text-green-700", desc: "Excelente! Mantenha seus hábitos saudáveis." };
    if (bmi < 30) return { label: "Sobrepeso", color: "bg-amber-100 text-amber-700", desc: "Procure manter um déficit calórico leve." };
    return { label: "Obesidade", color: "bg-red-100 text-red-700", desc: "Priorize sua saúde com acompanhamento profissional." };
  };

  const status = calculateStatus();

  const handleOpenDialog = (meal) => {
    if (meal) {
      setEditingMeal(meal);
      setFormData({ time: meal.time, meal: meal.meal, items: meal.items, calories: meal.calories });
    } else {
      setEditingMeal(null);
      setFormData({ time: "", meal: "", items: "", calories: 0 });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.meal || !formData.time) { toast.error("Preencha o nome e o horário."); return; }
    if (editingMeal) {
      editarRefeicao(editingMeal.id, formData);
      toast.success("Refeição atualizada!");
    } else {
      adicionarRefeicao(formData);
      toast.success("Refeição registrada!");
    }
    setIsDialogOpen(false);
  };

  return (
    <Layout userType="patient">
      <div className="p-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Olá, {usuarioLogado?.nome?.split(" ")[0] || "bem-vindo"}!
            </h1>
            <p className="text-gray-500">Acompanhe sua evolução diária.</p>
          </div>
          <div className="flex gap-3">
            <div className={`flex flex-col items-end px-4 py-2 rounded-xl ${status.color} border border-current/10`}>
              <span className="text-xs font-bold uppercase tracking-wider opacity-70">Status Atual</span>
              <span className="text-sm font-bold">{status.label}</span>
            </div>
            <Link to="/nutricionistas" className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors shadow-sm">
              Encontrar Nutri <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {status.desc && (
          <div className={`mb-8 p-4 rounded-xl ${status.color} border border-current/10 flex items-center gap-3`}>
            <div className="p-2 bg-white/50 rounded-lg"><Target className="w-5 h-5" /></div>
            <p className="text-sm font-medium"><span className="font-bold">Nota de Saúde:</span> {status.desc}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Flame} label="Calorias Consumidas" value={caloriesConsumed} subtext={`de ${caloriesGoal} kcal`} color="orange" />
          <StatCard icon={Target} label="Meta Diária" value={caloriesGoal} subtext="kcal" color="green" />
          <StatCard
            icon={TrendingDown}
            label="Peso Atual"
            value={`${pesoAtual} kg`}
            subtext={pesoPerda ? `-${pesoPerda}kg total` : "Registre pesagens"}
            color="blue"
          />
          <StatCard icon={Apple} label="Refeições Hoje" value={`${refeicoes.length}/5`} subtext={refeicoes.length >= 5 ? "Meta atingida" : `${5 - refeicoes.length} pendentes`} color="purple" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader><CardTitle className="text-xl">Evolução de Peso</CardTitle></CardHeader>
            <CardContent>
              {progressData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  <p>Nenhuma pesagem registrada ainda. Vá em <Link to="/evolucao" className="text-green-600 underline">Evolução de Peso</Link> para registrar.</p>
                </div>
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="date" stroke="#9ca3af" axisLine={false} tickLine={false} />
                      <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#fff", border: "none", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                      <Line type="monotone" dataKey="peso" stroke="#16a34a" strokeWidth={4} dot={{ fill: "#16a34a", r: 6, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 8, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="text-xl">Meta de Calorias</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center bg-gray-50 rounded-2xl py-6">
                  <div className="text-5xl font-bold text-gray-900 mb-2">{caloriesRemaining}</div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">calorias restantes</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-600">Progresso</span>
                    <span className="text-green-600">{progressPercentage.toFixed(0)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-3 bg-gray-100" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-orange-50 rounded-xl">
                    <p className="text-xs text-orange-600 font-bold mb-1 uppercase">Consumidas</p>
                    <p className="text-lg font-bold text-gray-900">{caloriesConsumed} kcal</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl">
                    <p className="text-xs text-green-600 font-bold mb-1 uppercase">Meta</p>
                    <p className="text-lg font-bold text-gray-900">{caloriesGoal} kcal</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Registro de Refeições</h2>
            <Button onClick={() => handleOpenDialog(null)} className="bg-green-600 hover:bg-green-700 rounded-full px-6">
              <Plus className="w-4 h-4 mr-2" /> Adicionar Refeição
            </Button>
          </div>

          {refeicoes.length === 0 ? (
            <Card className="border-dashed border-2 bg-gray-50">
              <CardContent className="p-12 text-center text-gray-400">
                Nenhuma refeição registrada hoje. Clique em "Adicionar Refeição" para começar.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {refeicoes.map(meal => (
                <Card key={meal.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-7 h-7 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-gray-900 truncate">{meal.meal}</h4>
                        <span className="text-sm font-bold text-green-600">{meal.calories} kcal</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">{meal.time}</p>
                      <p className="text-sm text-gray-600 line-clamp-1">{meal.items}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(meal)} className="text-gray-400 hover:text-blue-600">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { removerRefeicao(meal.id); toast.success("Refeição removida."); }} className="text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMeal ? "Editar Refeição" : "Registrar Refeição"}</DialogTitle>
              <DialogDescription>{editingMeal ? "Atualize os detalhes." : "Registre uma nova refeição."}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Refeição</Label>
                <Input placeholder="Ex: Almoço" className="col-span-3" value={formData.meal} onChange={e => setFormData(p => ({ ...p, meal: e.target.value }))} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Horário</Label>
                <Input type="time" className="col-span-3" value={formData.time} onChange={e => setFormData(p => ({ ...p, time: e.target.value }))} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Alimentos</Label>
                <Input placeholder="Ex: Frango, Arroz, Salada" className="col-span-3" value={formData.items} onChange={e => setFormData(p => ({ ...p, items: e.target.value }))} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Calorias</Label>
                <Input type="number" className="col-span-3" value={formData.calories} onChange={e => setFormData(p => ({ ...p, calories: Number(e.target.value) }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} className="bg-green-600">Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
