import { Layout } from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { TrendingDown, Calendar, Plus, Trash2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

function isoParaDisplay(iso) {
  if (!iso) return "";
  const d = String(iso).split("T")[0];
  const [y, m, dia] = d.split("-");
  return `${dia}/${m}/${y}`;
}

function maskData(v) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

function dataDisplayParaIso(v) {
  const parts = v.split("/");
  if (parts.length !== 3 || parts[2].length !== 4) return null;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

export default function Evolucao() {
  const { pesagens, adicionarPesagem, removerPesagem, anamnese, metas } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [novoPeso, setNovoPeso] = useState("");
  const [novaData, setNovaData] = useState(isoParaDisplay(new Date().toISOString().split("T")[0]));

  // pesoInicial: prefer backend-persisted value from metas, fall back to anamnese
  const pesoInicial = metas?.pesoInicial
    ? parseFloat(metas.pesoInicial)
    : (anamnese?.peso ? parseFloat(anamnese.peso) : null);

  const pesoAtual = pesagens.length > 0
    ? parseFloat(pesagens[pesagens.length - 1].peso)
    : pesoInicial;

  const goalWeight = metas?.pesoIdeal
    ? parseFloat(metas.pesoIdeal)
    : (pesoInicial ? parseFloat((pesoInicial - 5).toFixed(1)) : null);

  const weightLost = pesoInicial != null && pesoAtual != null
    ? parseFloat((pesoInicial - pesoAtual).toFixed(1))
    : 0;

  const weightToGoal = goalWeight != null && pesoAtual != null
    ? parseFloat((pesoAtual - goalWeight).toFixed(1))
    : null;

  const chartData = pesagens.map(p => ({
    date: isoParaDisplay(p.data),
    peso: parseFloat(p.peso),
    meta: goalWeight,
  }));

  const handleSalvar = () => {
    if (!novoPeso) { toast.error("Informe o peso."); return; }
    const iso = dataDisplayParaIso(novaData);
    if (!iso) { toast.error("Data inválida. Use DD/MM/AAAA."); return; }
    adicionarPesagem({ peso: parseFloat(novoPeso), data: iso });
    toast.success("Pesagem registrada!");
    setNovoPeso("");
    setShowForm(false);
  };

  const handleRemover = async (id) => {
    await removerPesagem(id);
    toast.success("Pesagem removida.");
  };

  return (
    <Layout userType="patient">
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Evolução de Peso</h1>
            <p className="text-gray-500">Acompanhe seu progresso ao longo do tempo</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" /> Registrar Peso
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader><CardTitle>Registrar Nova Pesagem</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Peso (kg)</Label>
                  <Input type="number" step="0.1" placeholder="73.5" value={novoPeso} onChange={e => setNovoPeso(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Data (DD/MM/AAAA)</Label>
                  <Input placeholder="DD/MM/AAAA" value={novaData} onChange={e => setNovaData(maskData(e.target.value))} />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button className="bg-green-600 hover:bg-green-700" onClick={handleSalvar}>Salvar</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Peso Atual</p>
                  <p className="text-3xl font-bold text-gray-900">{pesoAtual ?? "—"}</p>
                  <p className="text-sm text-gray-500">kg</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                  <TrendingDown className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-500 mb-1">Peso Inicial</p>
              <p className="text-3xl font-bold text-gray-900">{pesoInicial ?? "—"}</p>
              <p className="text-sm text-gray-500">kg</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-500 mb-1">Peso Perdido</p>
              <p className="text-3xl font-bold text-green-600">{weightLost > 0 ? `-${weightLost}` : weightLost < 0 ? `+${Math.abs(weightLost)}` : "0"}</p>
              <p className="text-sm text-gray-500">kg</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-500 mb-1">Meta (Peso Ideal)</p>
              <p className="text-3xl font-bold text-gray-900">{goalWeight ?? "—"}</p>
              <p className="text-sm text-gray-500">
                {weightToGoal != null && weightToGoal > 0 ? `ainda ${weightToGoal} kg` : weightToGoal != null && weightToGoal <= 0 ? "✓ Meta atingida" : "kg"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader><CardTitle>Gráfico de Progresso</CardTitle></CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                Nenhuma pesagem registrada ainda.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                  <Area type="monotone" dataKey="peso" stroke="#16a34a" strokeWidth={3} fill="url(#colorPeso)" />
                  {goalWeight && <Line type="monotone" dataKey="meta" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Histórico de Pesagens</CardTitle></CardHeader>
          <CardContent>
            {pesagens.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Nenhuma pesagem registrada.</p>
            ) : (
              <div className="space-y-3">
                {[...pesagens].reverse().map((p, i) => {
                  const idx = pesagens.length - 1 - i;
                  const anterior = idx > 0 ? pesagens[idx - 1] : null;
                  const diff = anterior ? (parseFloat(p.peso) - parseFloat(anterior.peso)).toFixed(1) : null;
                  return (
                    <div key={p.id ?? i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg group">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Calendar className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="font-medium text-gray-900">{isoParaDisplay(p.data)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{p.peso} kg</p>
                          {diff !== null && (
                            <p className={`text-sm font-medium ${parseFloat(diff) < 0 ? "text-green-600" : "text-red-600"}`}>
                              {parseFloat(diff) > 0 ? "+" : ""}{diff} kg
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemover(p.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
