import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { ClipboardCheck, ArrowRight, User, Activity, Moon } from "lucide-react";
import { useApp } from "../context/AppContext";

const COMORBIDADES = ["Diabetes", "Hipertensão", "Colesterol alto", "Hipotireoidismo", "Obesidade", "Nenhuma"];
const RESTRICOES   = ["Lactose", "Glúten", "Frutos do mar", "Amendoim", "Vegano", "Vegetariano", "Nenhuma"];

export default function FichaAnamnese() {
  const navigate = useNavigate();
  const { salvarAnamnese } = useApp();
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
      if (lista.includes(valor)) return { ...prev, [field]: lista.filter(v => v !== valor) };
      return { ...prev, [field]: [...lista, valor] };
    });
  };

  const handleNext = async () => {
    if (step === 1 && (!formData.peso || !formData.altura || !formData.idade || !formData.objetivo || !formData.sexo)) {
      toast.error("Preencha todos os campos do Passo 1.");
      return;
    }
    if (step === 3 && (!formData.nivelAtividade || !formData.horasSono)) {
      toast.error("Preencha o nível de atividade e as horas de sono.");
      return;
    }
    if (step < 3) { setStep(step + 1); return; }

    // converte arrays para string separada por vírgula antes de salvar
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

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-700 font-bold mb-4">
                <User className="w-5 h-5" /> Passo 1: Dados Físicos
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Peso Atual (kg)</Label>
                  <Input type="number" placeholder="75.5" value={formData.peso} onChange={e => set("peso", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Altura (cm)</Label>
                  <Input type="number" placeholder="175" value={formData.altura} onChange={e => set("altura", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Idade</Label>
                  <Input type="number" placeholder="25" value={formData.idade} onChange={e => set("idade", e.target.value)} />
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
                <div className="space-y-2">
                  <Label>Objetivo Principal</Label>
                  <Select onValueChange={v => set("objetivo", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                      <SelectItem value="hipertrofia">Ganho de Massa</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

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
                    <SelectItem value="leve">Leve (1-3x/semana)</SelectItem>
                    <SelectItem value="moderado">Moderado (3-5x/semana)</SelectItem>
                    <SelectItem value="intenso">Intenso (6-7x/semana)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Horas de Sono por Noite</Label>
                <Input type="number" placeholder="8" value={formData.horasSono} onChange={e => set("horasSono", e.target.value)} />
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
