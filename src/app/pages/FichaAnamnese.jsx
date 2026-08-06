import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { ClipboardCheck, ArrowRight, User, Activity, Moon } from "lucide-react";
import { useApp } from "../context/AppContext";

const COMORBIDADES = [
  "Diabetes tipo 1",
  "Diabetes tipo 2",
  "Hipertensão arterial",
  "Colesterol alto",
  "Triglicerídeos altos",
  "Hipotireoidismo",
  "Hipertireoidismo",
  "Obesidade",
  "Síndrome metabólica",
  "Doença celíaca",
  "Intolerância à lactose",
  "Anemia",
  "Nenhuma",
];

const RESTRICOES = [
  "Lactose",
  "Glúten",
  "Frutos do mar",
  "Amendoim",
  "Ovos",
  "Soja",
  "Nozes e castanhas",
  "Vegano",
  "Vegetariano",
  "Ovolactovegetariano",
  "Nenhuma",
];

const HORAS_SONO = Array.from({ length: 12 }, (_, i) => String(i + 1));

export default function FichaAnamnese() {
  const navigate = useNavigate();
  const { salvarAnamnese, anamnese, usuarioLogado } = useApp();

  // Redirect away if anamnesis already exists (guards direct URL access)
  useEffect(() => {
    if (!usuarioLogado) { navigate("/login"); return; }
    if (usuarioLogado.tipo !== "patient") { navigate("/dashboard"); return; }
    if (anamnese?.id) { navigate("/dashboard"); }
  }, [anamnese, usuarioLogado]);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    peso: "", altura: "", idade: "", objetivo: "", sexo: "",
    comorbidades: [],
    restricoes: [],
    nivelAtividade: "", horasSono: "",
  });

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const toggleCheck = (field, valor) => {
    setFormData(prev => {
      const lista = prev[field];
      // se selecionar "Nenhuma", desmarca todos os outros
      if (valor === "Nenhuma") return { ...prev, [field]: lista.includes("Nenhuma") ? [] : ["Nenhuma"] };
      // se selecionar outro, remove "Nenhuma"
      const semNenhuma = lista.filter(v => v !== "Nenhuma");
      if (semNenhuma.includes(valor)) return { ...prev, [field]: semNenhuma.filter(v => v !== valor) };
      return { ...prev, [field]: [...semNenhuma, valor] };
    });
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.peso || !formData.altura || !formData.idade || !formData.objetivo || !formData.sexo) {
        toast.error("Preencha todos os campos do Passo 1.");
        return;
      }
      const idade = parseInt(formData.idade);
      if (isNaN(idade) || idade < 1 || idade > 120) {
        toast.error("Idade deve ser entre 1 e 120 anos.");
        return;
      }
    }
    if (step === 3 && (!formData.nivelAtividade || !formData.horasSono)) {
      toast.error("Preencha o nível de atividade e as horas de sono.");
      return;
    }
    if (step < 3) { setStep(step + 1); return; }

    await salvarAnamnese({
      ...formData,
      comorbidades: formData.comorbidades.join(", "),
      restricoes:   formData.restricoes.join(", "),
    });
    toast.success("Ficha preenchida! Bem-vindo ao NutriLife.");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-xl w-full border-none shadow-xl">
        <CardHeader className="bg-green-600 text-white rounded-t-xl py-8">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardCheck className="w-8 h-8" />
            <CardTitle className="text-2xl text-white">Ficha de Anamnese</CardTitle>
          </div>
          <p className="text-green-50 text-base">Complete sua ficha para liberar o acesso ao sistema.</p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="mb-8 flex gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-2 flex-1 rounded-full transition-colors ${s <= step ? "bg-green-600" : "bg-gray-200"}`} />
            ))}
          </div>

          {/* ── PASSO 1: Dados Físicos ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-700 font-bold mb-4">
                <User className="w-5 h-5" /> Passo 1: Dados Físicos
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Peso Atual (kg)</Label>
                  <Input type="number" min="1" max="500" step="0.1" placeholder="75.5"
                    value={formData.peso} onChange={e => set("peso", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Altura (cm)</Label>
                  <Input type="number" min="50" max="250" placeholder="175"
                    value={formData.altura} onChange={e => set("altura", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Idade</Label>
                  <Input type="number" min="1" max="120" placeholder="25"
                    value={formData.idade}
                    onChange={e => {
                      const v = parseInt(e.target.value);
                      if (e.target.value === "" || (v >= 1 && v <= 120)) set("idade", e.target.value);
                    }}
                  />
                  <p className="text-xs text-gray-400">Máximo: 120 anos</p>
                </div>
                <div className="space-y-2">
                  <Label>Sexo Biológico</Label>
                  <Select onValueChange={v => set("sexo", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Objetivo Principal</Label>
                  <Select onValueChange={v => set("objetivo", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMAGRECIMENTO">Emagrecimento</SelectItem>
                      <SelectItem value="HIPERTROFIA">Ganho de Massa</SelectItem>
                      <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
                      <SelectItem value="PERFORMANCE">Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* ── PASSO 2: Saúde e Restrições ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-green-700 font-bold mb-4">
                <Activity className="w-5 h-5" /> Passo 2: Saúde e Restrições
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Comorbidades / Problemas de Saúde</Label>
                <div className="grid grid-cols-2 gap-2">
                  {COMORBIDADES.map(item => (
                    <div key={item} className="flex items-center gap-2">
                      <Checkbox
                        id={`com-${item}`}
                        checked={formData.comorbidades.includes(item)}
                        onCheckedChange={() => toggleCheck("comorbidades", item)}
                      />
                      <label htmlFor={`com-${item}`} className="text-sm cursor-pointer">{item}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Restrições Alimentares / Alergias</Label>
                <div className="grid grid-cols-2 gap-2">
                  {RESTRICOES.map(item => (
                    <div key={item} className="flex items-center gap-2">
                      <Checkbox
                        id={`res-${item}`}
                        checked={formData.restricoes.includes(item)}
                        onCheckedChange={() => toggleCheck("restricoes", item)}
                      />
                      <label htmlFor={`res-${item}`} className="text-sm cursor-pointer">{item}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PASSO 3: Estilo de Vida ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-700 font-bold mb-4">
                <Moon className="w-5 h-5" /> Passo 3: Estilo de Vida
              </div>
              <div className="space-y-2">
                <Label>Nível de Atividade Física</Label>
                <Select onValueChange={v => set("nivelAtividade", v)}>
                  <SelectTrigger><SelectValue placeholder="Como é sua rotina?" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentario">Sedentário</SelectItem>
                    <SelectItem value="leve">Leve (1–3x/semana)</SelectItem>
                    <SelectItem value="moderado">Moderado (3–5x/semana)</SelectItem>
                    <SelectItem value="intenso">Intenso (6–7x/semana)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Horas de Sono por Noite</Label>
                <Select onValueChange={v => set("horasSono", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {HORAS_SONO.map(h => (
                      <SelectItem key={h} value={h}>{h} {h === "1" ? "hora" : "horas"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400">Máximo: 12 horas</p>
              </div>
            </div>
          )}

          <div className="pt-6 flex gap-3">
            {step > 1 && (
              <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>Voltar</Button>
            )}
            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleNext}>
              {step === 3 ? "Finalizar" : "Próximo Passo"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
