import { Layout } from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Coffee, Sun, Cookie, Moon, RefreshCw, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";

const icones = [Coffee, Sun, Cookie, Moon];
const cores = [
  "bg-amber-50 text-amber-600",
  "bg-orange-50 text-orange-600",
  "bg-yellow-50 text-yellow-600",
  "bg-indigo-50 text-indigo-600",
];

export default function PlanoAlimentar() {
  const { usuarioLogado } = useApp();
  const [plano, setPlano]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [regenerando, setRegenerando] = useState(false);
  const [erro, setErro]           = useState("");

  const carregarPlano = (forcar = false) => {
    if (!usuarioLogado?.id) return;
    const url = forcar
      ? `/plano/regenerar/${usuarioLogado.id}`
      : `/plano/gerar/${usuarioLogado.id}`;
    forcar ? setRegenerando(true) : setLoading(true);
    setErro("");
    fetch(url, { method: "POST" })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Erro ao carregar plano.");
        }
        return res.json();
      })
      .then(data => {
        setPlano(data);
        if (forcar) toast.success("Plano regenerado com sucesso!");
      })
      .catch(e => {
        setErro(e.message);
        if (forcar) toast.error("Erro ao regenerar plano.");
      })
      .finally(() => forcar ? setRegenerando(false) : setLoading(false));
  };

  useEffect(() => { carregarPlano(); }, [usuarioLogado]);

  const totalCalories = plano?.refeicoes?.reduce(
    (acc, r) => acc + (r.alimentos?.reduce((s, a) => s + (a.calorias ?? 0), 0) ?? 0), 0
  ) ?? 0;

  return (
    <Layout userType="patient">
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Plano Alimentar</h1>
            <p className="text-gray-500">Seu plano personalizado gerado automaticamente</p>
          </div>
          <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50" onClick={() => carregarPlano(true)} disabled={regenerando}>
            <RefreshCw className={`w-4 h-4 mr-2 ${regenerando ? "animate-spin" : ""}`} />
            {regenerando ? "Regenerando..." : "Regenerar Plano"}
          </Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" /> Imprimir
          </Button>
        </div>

        {loading && <p className="text-gray-400">Carregando plano...</p>}
        {erro    && <p className="text-red-500">{erro}</p>}

        {plano && (
          <>
            <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total de Calorias</p>
                    <p className="text-3xl font-bold text-gray-900">{totalCalories.toFixed(0)}</p>
                    <p className="text-sm text-gray-500">kcal/dia</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Refeições</p>
                    <p className="text-3xl font-bold text-gray-900">{plano.refeicoes?.length ?? 0}</p>
                    <p className="text-sm text-gray-500">por dia</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Início do Plano</p>
                    <p className="text-xl font-bold text-gray-900">{plano.dataInicio}</p>
                    <p className="text-sm text-gray-500">Paciente: {plano.cliente?.nomeCompleto}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {plano.refeicoes?.map((refeicao, index) => {
                const Icon = icones[index % icones.length];
                const mealTotal = refeicao.alimentos?.reduce((s, a) => s + (a.calorias ?? 0), 0) ?? 0;
                return (
                  <Card key={refeicao.id ?? index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-lg ${cores[index % cores.length]}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <CardTitle>{refeicao.nome}</CardTitle>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{mealTotal.toFixed(0)}</p>
                          <p className="text-sm text-gray-500">kcal</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {refeicao.alimentos?.map((alimento, j) => (
                          <div key={alimento.id ?? j} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{alimento.nome}</p>
                              <p className="text-sm text-gray-500">
                                P: {alimento.proteina}g · C: {alimento.carboidrato}g · G: {alimento.gordura}g
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold text-gray-900">{alimento.calorias}</span>
                              <span className="text-sm text-gray-500 ml-1">kcal</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
