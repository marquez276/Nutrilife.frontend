import { Layout } from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Plus, Edit2, Trash2, Database } from "lucide-react";
import { useState } from "react";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";

export default function GerenciarAlimentos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [foods, setFoods] = useState([
    { id: 1, name: "Banana", category: "Frutas", calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
    { id: 2, name: "Peito de Frango", category: "Proteínas", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { id: 3, name: "Arroz Integral", category: "Carboidratos", calories: 123, protein: 2.6, carbs: 25.6, fat: 1 },
  ]);

  const handleSave = () => {
    toast.success("Base de dados de alimentos atualizada!");
    setIsDialogOpen(false);
  };

  const filteredFoods = foods.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <Layout userType="admin">
      <div className="p-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Banco de Alimentos</h1>
            <p className="text-gray-500">Controle total sobre a base nutricional do sistema</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" /> Adicionar Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Novo Alimento</DialogTitle>
                <DialogDescription>Adicione um novo alimento à base de dados.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nome</Label>
                  <Input id="name" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cat" className="text-right">Categoria</Label>
                  <Input id="cat" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cal" className="text-right">Calorias</Label>
                  <Input id="cal" type="number" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="prot" className="text-right">Proteína</Label>
                  <Input id="prot" type="number" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSave} className="bg-green-600">Salvar Alimento</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mb-8 border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50 border-b">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar na base de dados..."
                className="pl-10 h-11 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alimento</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Calorias</TableHead>
                  <TableHead>Prot/Carb/Gord</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFoods.map((food) => (
                  <TableRow key={food.id}>
                    <TableCell className="font-bold text-gray-900">{food.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-none font-medium">{food.category}</Badge>
                    </TableCell>
                    <TableCell className="font-bold">{food.calories} kcal</TableCell>
                    <TableCell className="text-gray-500 font-medium">{food.protein}g / {food.carbs}g / {food.fat}g</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => { setFoods(foods.filter(f => f.id !== food.id)); toast.error("Alimento removido"); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm bg-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase opacity-80">Itens Totais</p>
                  <h3 className="text-2xl font-bold">1,432</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
