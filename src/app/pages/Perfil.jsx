import { Layout } from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Save, Activity, Moon, ShieldAlert, User, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { toast } from "sonner";
import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function Perfil() {
  const { usuarioLogado, anamnese, salvarAnamnese } = useApp();

  const [fotoPreview, setFotoPreview] = useState(null);

  const [form, setForm] = useState({
    peso:       anamnese?.peso       || "",
    altura:     anamnese?.altura     || "",
    objetivo:   anamnese?.objetivo   || "",
    atividade:  anamnese?.atividade  || "",
    sono:       anamnese?.sono       || "",
    restricoes:   anamnese?.restricoes   || "",
    comorbidades: anamnese?.comorbidades || "",
  });

  const set = (field, value) => setForm(p => ({ ...p, [field]: value }));

  const handleFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFotoPreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("file", file);
    try {
      await fetch(`/usuarios/${usuarioLogado?.id}/imagem`, { method: "POST", body: formData });
      toast.success("Foto atualizada!");
    } catch {
      toast.error("Erro ao enviar foto.");
    }
  };

  const handleSave = async () => {
    try {
      await fetch(`/usuarios/${usuarioLogado?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomeCompleto: usuarioLogado?.nome, telefone: usuarioLogado?.telefone }),
      });
      if (anamnese?.id) {
        await fetch(`/anamnese/${anamnese.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            peso:         parseFloat(form.peso)  || null,
            altura:       parseFloat(form.altura) || null,
            objetivo:     form.objetivo?.toUpperCase() || null,
            atividade:    form.atividade || null,
            sono:         parseInt(form.sono)    || null,
            restricoes:   form.restricoes   || null,
            comorbidades: form.comorbidades || null,
          }),
        });
        // atualiza localStorage sem chamar POST /anamnese de novo
        const atualizado = { ...anamnese, ...form };
        localStorage.setItem(`anamnese_${usuarioLogado?.id}`, JSON.stringify(atualizado));
        window.location.reload();
      }
      toast.success("Perfil salvo com sucesso!");
    } catch {
      toast.error("Erro ao salvar. Tente novamente.");
    }
  };

  const initials = usuarioLogado?.nome
    ? usuarioLogado.nome.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
    : "??";

  return (
    <Layout userType="patient">
      <div className="p-8">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meu Perfil de Saúde</h1>
            <p className="text-gray-500">Suas informações de cadastro e anamnese</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" /> Salvar Tudo
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-sm overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-green-500 to-green-600" />
              <CardContent className="p-6 -mt-12 text-center">
                {/* Foto com upload */}
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                    {fotoPreview
                      ? <AvatarImage src={fotoPreview} className="object-cover" />
                      : <AvatarFallback className="bg-green-100 text-green-700 text-2xl font-bold">{initials}</AvatarFallback>
                    }
                  </Avatar>
                  <label className="absolute bottom-0 right-0 p-1.5 bg-green-600 rounded-full text-white cursor-pointer hover:bg-green-700 border-2 border-white">
                    <Camera className="w-3 h-3" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleFoto} />
                  </label>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{usuarioLogado?.nome || "—"}</h2>
                <p className="text-sm text-gray-500 mb-4">{usuarioLogado?.email || "—"}</p>
                <div className="flex flex-col gap-2 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Telefone</span>
                    <span className="font-bold">{usuarioLogado?.telefone || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Sexo</span>
                    <span className="font-bold">{anamnese?.sexo === "M" ? "Masculino" : anamnese?.sexo === "F" ? "Feminino" : "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Idade</span>
                    <span className="font-bold">{anamnese?.idade ? `${anamnese.idade} anos` : "—"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-amber-50">
              <CardContent className="p-6">
                <h4 className="font-bold text-amber-900 flex items-center gap-2 mb-3">
                  <ShieldAlert className="w-4 h-4" /> Alertas de Saúde
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-400 font-bold uppercase">Restrições</p>
                    <p className="text-sm font-bold text-gray-900">{anamnese?.restricoes || "Nenhuma registrada"}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-400 font-bold uppercase">Comorbidades</p>
                    <p className="text-sm font-bold text-gray-900">{anamnese?.comorbidades || "Nenhuma registrada"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600" /> Dados de Cadastro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input defaultValue={usuarioLogado?.nome || ""} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input defaultValue={usuarioLogado?.email || ""} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input defaultValue={usuarioLogado?.telefone || ""} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Idade</Label>
                    <Input defaultValue={anamnese?.idade ? `${anamnese.idade} anos` : ""} readOnly className="bg-gray-50" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" /> Informações de Anamnese
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Peso (kg)</Label>
                    <Input type="number" value={form.peso} onChange={e => set("peso", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Altura (cm)</Label>
                    <Input type="number" value={form.altura} onChange={e => set("altura", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Objetivo</Label>
                    <Input value={form.objetivo} onChange={e => set("objetivo", e.target.value)} className="capitalize" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Activity className="w-4 h-4" /> Nível de Atividade</Label>
                    <Input value={form.atividade} onChange={e => set("atividade", e.target.value)} className="capitalize" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Moon className="w-4 h-4" /> Horas de Sono</Label>
                    <Input type="number" value={form.sono} onChange={e => set("sono", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Restrições e Alergias</Label>
                    <Input value={form.restricoes} onChange={e => set("restricoes", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Problemas de Saúde e Comorbidades</Label>
                    <Input value={form.comorbidades} onChange={e => set("comorbidades", e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
