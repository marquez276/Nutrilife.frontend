import { Layout } from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Info } from "lucide-react";
import { useState } from "react";
import { Badge } from "../components/ui/badge";

export default function Alimentos() {
  const [searchTerm, setSearchTerm] = useState("");

  const foodDatabase = [
    { name: "Banana", category: "Frutas", portion: "1 unidade média (100g)", calories: 105, protein: 1.3, carbs: 27, fat: 0.3, fiber: 3.1 },
    { name: "Peito de Frango Grelhado", category: "Proteínas", portion: "100g", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
    { name: "Arroz Integral Cozido", category: "Carboidratos", portion: "100g (4 colheres)", calories: 123, protein: 2.6, carbs: 25.6, fat: 1, fiber: 1.8 },
    { name: "Brócolis Cozido", category: "Vegetais", portion: "100g", calories: 35, protein: 2.4, carbs: 7, fat: 0.4, fiber: 3.3 },
    { name: "Ovo Cozido", category: "Proteínas", portion: "1 unidade (50g)", calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, fiber: 0 },
    { name: "Maçã", category: "Frutas", portion: "1 unidade média (180g)", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4 },
    { name: "Batata Doce Cozida", category: "Carboidratos", portion: "100g", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3 },
    { name: "Salmão Grelhado", category: "Proteínas", portion: "100g", calories: 206, protein: 22, carbs: 0, fat: 13, fiber: 0 },
    { name: "Abacate", category: "Frutas", portion: "1/4 unidade (50g)", calories: 80, protein: 1, carbs: 4.3, fat: 7.3, fiber: 3.4 },
    { name: "Iogurte Natural", category: "Laticínios", portion: "1 pote (170g)", calories: 100, protein: 10, carbs: 13, fat: 0, fiber: 0 },
    { name: "Feijão Preto Cozido", category: "Leguminosas", portion: "100g (1 concha)", calories: 132, protein: 8.9, carbs: 23.7, fat: 0.5, fiber: 8.3 },
    { name: "Aveia em Flocos", category: "Carboidratos", portion: "30g (3 colheres)", calories: 117, protein: 4.2, carbs: 20, fat: 2.3, fiber: 3 },
  ];

  const filteredFoods = foodDatabase.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(foodDatabase.map(food => food.category)));

  const categoryColors = {
    "Frutas": "bg-orange-100 text-orange-700",
    "Proteínas": "bg-red-100 text-red-700",
    "Carboidratos": "bg-yellow-100 text-yellow-700",
    "Vegetais": "bg-green-100 text-green-700",
    "Laticínios": "bg-blue-100 text-blue-700",
    "Leguminosas": "bg-purple-100 text-purple-700",
  };

  return (
    <Layout userType="patient">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Banco de Alimentos</h1>
          <p className="text-gray-500">Consulte informações nutricionais de diversos alimentos</p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar por alimento ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 text-lg h-14"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {categories.map((category) => (
                <Badge
                  key={category}
                  className={`cursor-pointer ${categoryColors[category] || 'bg-gray-100 text-gray-700'}`}
                  onClick={() => setSearchTerm(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {filteredFoods.length === 0 ? (
            <div className="col-span-2">
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">Nenhum alimento encontrado</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredFoods.map((food, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{food.name}</CardTitle>
                      <Badge className={categoryColors[food.category] || 'bg-gray-100 text-gray-700'}>{food.category}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900">{food.calories}</p>
                      <p className="text-sm text-gray-500">kcal</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600"><span className="font-medium">Porção:</span> {food.portion}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Proteínas</p>
                      <p className="text-lg font-bold text-gray-900">{food.protein}g</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Carboidratos</p>
                      <p className="text-lg font-bold text-gray-900">{food.carbs}g</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Gorduras</p>
                      <p className="text-lg font-bold text-gray-900">{food.fat}g</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Fibras</p>
                      <p className="text-lg font-bold text-gray-900">{food.fiber}g</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Info className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Informação Nutricional</h3>
                <p className="text-sm text-gray-700">
                  Os valores nutricionais apresentados são aproximados e podem variar de acordo com a forma de preparo e origem do alimento. Consulte sempre seu nutricionista para orientações personalizadas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
