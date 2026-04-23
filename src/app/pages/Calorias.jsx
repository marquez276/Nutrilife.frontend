import { Layout } from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Progress } from "../components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

const ALIMENTOS_COMUNS = [
  { name: "Banana", quantity: "1 unidade", calories: 105 },
  { name: "Maçã", quantity: "1 unidade", calories: 95 },
  { name: "Arroz branco", quantity: "4 colheres", calories: 180 },
  { name: "Peito de frango", quantity: "100g", calories: 165 },
  { name: "Pão francês", quantity: "1 unidade", calories: 135 },
  { name: "Ovo cozido", quantity: "1 unidade", calories: 70 },
];

export default function Calorias() {
  const { refeicoes, adicionarRefeicao, removerRefeicao } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customFood, setCustomFood] = useState({ name: "", quantity: "", calories: "", time: "" });

  const dailyGoal = 1800;
  const totalConsumed = refeicoes.reduce((sum, item) => sum + Number(item.calories), 0);
  const remaining = dailyGoal - totalConsumed;
  const progressPercentage = Math.min(100, (totalConsumed / dailyGoal) * 100);

  const handleAddFood = (food) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    adicionarRefeicao({ meal: food.name, items: food.quantity, calories: food.calories, time });
    toast.success(`${food.name} adicionado!`);
  };

  const handleAddCustom = () => {
    if (!customFood.name || !customFood.quantity || !customFood.calories || !customFood.time) {
      toast.error("Preencha todos os campos.");
      return;
    }
    adicionarRefeicao({ meal: customFood.name, items: customFood.quantity, calories: parseInt(customFood.calories), time: customFood.time });
    setCustomFood({ name: "", quantity: "", calories: "", time: "" });
    setIsDialogOpen(false);
    toast.success("Alimento adicionado!");
  };

  const filteredFoods = ALIMENTOS_COMUNS.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout userType="patient">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Controle de Calorias</h1>
          <p className="text-gray-500">Registre os alimentos consumidos durante o dia</p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-8 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Consumidas</p>
                <p className="text-4xl font-bold text-gray-900">{totalConsumed}</p>
                <p className="text-sm text-gray-500">kcal</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Meta Diária</p>
                <p className="text-4xl font-bold text-green-600">{dailyGoal}</p>
                <p className="text-sm text-gray-500">kcal</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Restantes</p>
                <p className={`text-4xl font-bold ${remaining < 0 ? "text-red-600" : "text-blue-600"}`}>{remaining}</p>
                <p className="text-sm text-gray-500">kcal</p>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-center text-sm text-gray-500 mt-3">{progressPercentage.toFixed(0)}% da meta diária alcançada</p>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader><CardTitle>Alimentos Consumidos Hoje</CardTitle></CardHeader>
              <CardContent>
                {refeicoes.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">Nenhum alimento registrado ainda.</div>
                ) : (
                  <div className="space-y-3">
                    {refeicoes.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg group">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded">{item.time}</span>
                          <div>
                            <p className="font-medium text-gray-900">{item.meal}</p>
                            <p className="text-sm text-gray-500">{item.items}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-lg font-bold text-gray-900">{item.calories}</span>
                            <span className="text-sm text-gray-500 ml-1">kcal</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => { removerRefeicao(item.id); toast.success("Removido."); }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader><CardTitle>Buscar Alimento</CardTitle></CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Buscar alimento..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700 mb-4" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Personalizado
                </Button>
                <p className="font-semibold text-sm mb-3 text-gray-700">Alimentos Comuns</p>
                <div className="space-y-2">
                  {filteredFoods.map((food, i) => (
                    <button key={i} className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => handleAddFood(food)}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{food.name}</p>
                          <p className="text-xs text-gray-500">{food.quantity}</p>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{food.calories} kcal</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Alimento Personalizado</DialogTitle>
              <DialogDescription>Preencha os detalhes do alimento.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {[
                { label: "Nome", field: "name", type: "text", placeholder: "Ex: Iogurte" },
                { label: "Quantidade", field: "quantity", type: "text", placeholder: "Ex: 1 pote" },
                { label: "Calorias", field: "calories", type: "number", placeholder: "Ex: 100" },
                { label: "Hora", field: "time", type: "time", placeholder: "" },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field} className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">{label}</Label>
                  <Input type={type} placeholder={placeholder} className="col-span-3" value={customFood[field]} onChange={e => setCustomFood(p => ({ ...p, [field]: e.target.value }))} />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleAddCustom} className="bg-green-600">Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
