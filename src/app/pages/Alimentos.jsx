import { Layout } from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "../components/ui/badge";

export default function Alimentos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [foodDatabase, setFoodDatabase] = useState([]);

  useEffect(() => {
    fetch("/admin/alimentos")
      .then(r => r.ok ? r.json() : [])
      .then(data => setFoodDatabase(Array.isArray(data) ? data : []))
      .catch(() => setFoodDatabase([]));
  }, []);

  const filteredFoods = foodDatabase.filter(food =>
    food.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(foodDatabase.map(food => food.categoria).filter(Boolean)));

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
            filteredFoods.map(food => (
              <Card key={food.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{food.nome}</CardTitle>
                      <Badge className={categoryColors[food.categoria] || 'bg-gray-100 text-gray-700'}>{food.categoria || "Geral"}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900">{food.calorias}</p>
                      <p className="text-sm text-gray-500">kcal</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Proteínas</p>
                      <p className="text-lg font-bold text-gray-900">{food.proteina}g</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Carboidratos</p>
                      <p className="text-lg font-bold text-gray-900">{food.carboidrato}g</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Gorduras</p>
                      <p className="text-lg font-bold text-gray-900">{food.gordura}g</p>
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
