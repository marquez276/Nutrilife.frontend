import { Layout } from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Edit2, Activity, Moon, ShieldAlert, User, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { apiFetch } from "../api";

const OBJETIVOS = [
  { value: "EMAGRECIMENTO", label: "Emagrecimento" },
  { value: "HIPERTROFIA",   label: "Ganho de Massa" },
  { value: "MANUTENCAO",    label: "Manutenção" },
  { value: "PERFORMANCE",   label: "Performance" },
];

const ATIVIDADES = [
  { value: "sedentario", label: "Sedentário" },
  { value: "leve",       label: "Leve (1–3x/semana)" },
  { value: "moderado",   label: "Moderado (3–5x/semana)" },
  { value: "intenso",    label: "Intenso (6–7x/semana)" },
];

const HORAS_SONO = Array.from({ length: 12 }, (_, i) => String(i + 1));

const COMORBIDADES = [
  "Diabetes tipo 1", "Diabetes tipo 2", "Hipertensão arterial", "Colesterol alto",
  "Triglicerídeos altos", "Hipotireoidismo", "Hipertireoidismo", "Obesidade",
  "Síndrome metabólica", "Doença celíaca", "Intolerância à lactose", "Anemia", "Nenhuma",
];

const RESTRICOES = [
  "Lactose", "Glúten", "Frutos do mar", "Amendoim", "Ovos", "Soja",
  "Nozes e castanhas", "Vegano", "Vegetariano", "Ovolactovegetariano", "Nenhuma",
];

function strToList(str) {
  if (!str) return [];
  return str.split(",").map(s => s.trim()).filter(Boolean);
}

function toggleItem(list, item) {
  if (item === "Nenhuma") return list.includes("Nenhuma") ? [] : ["Nenhuma"];
  const sem = list.filter(v => v !== "Nenhuma");
  return sem.includes(item) ? sem.filter(v => v !== item) : [...sem, item];
}

export default function Perfil() {
  const { usuarioLogado, anamnese, salvarAnamnese, recarregarDadosPaciente } = useApp();

  const [editing, setEditing]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [fotoUrl, setFotoUrl]       = useState(null);
  const [fotoBlob, setFotoBlob]     = useState(null); // arquivo pendente de upload

  const [form, setForm] = useState({
    nomeCompleto: "",
    telefone:     "",
    peso:         "",
    altura:       "",
    objetivo:     "",
    atividade:    "",
    sono:         "",
    restricoes:   [],
    comorbidades: [],
  });

  // Carrega dados ao montar / quando anamnese ou usuário mudam
  useEffect(() => {
    setForm({
      nomeCompleto: usuarioLogado?.nome     || "",
      telefone:     usuarioLogado?.telefone || "",
      peso:         anamnese?.peso          || "",
      altura:       anamnese?.altura        || "",
      objetivo:     anamnese?.objetivo      || "",
      atividade:    anamnese?.atividade     || "",
      sono:         anamnese?.sono          || "",
      restricoes:   strToList(anamnese?.restricoes),
      comorbidades: strToList(anamnese?.comorbidades),
    });
  }, [usuarioLogado, anamnese]);

  const [fotoValida, setFotoValida] = useState(false);

  // Verifica se a imagem existe no backend
  useEffect(() => {
    if (!usuarioLogado?.id) return;
    setFotoValida(false);
    apiFetch(`/usuarios/${usuarioLogado.id}/imagem`)
      .then(r => { if (r.ok) { setFotoUrl(`/usuarios/${usuarioLogado.id}/imagem?t=${Date.now()}`); setFotoValida(true); } })
      .catch(() => {});
  }, [usuarioLogado?.id]);

  const set = (field, value) => setForm(p => ({ ...p, [field]: value }));

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFotoUrl(URL.createObjectURL(file));
    setFotoValida(true);
    setFotoBlob(file);
  };

  const handleAtualizar = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    if (!form.peso || !form.altura) {
      toast.error("Peso e altura são obrigatórios.");
      return;
    }
    setSaving(true);
    try {
      // 1. Foto — sobrescreve a anterior (único VARBINARY no banco)
      if (fotoBlob) {
        const fd = new FormData();
        fd.append("file", fotoBlob);
        const r = await apiFetch(`/usuarios/${usuarioLogado?.id}/imagem`, { method: "POST", body: fd });
        if (r.ok) {
          setFotoUrl(`/usuarios/${usuarioLogado?.id}/imagem?t=${Date.now()}`);
          setFotoValida(true);
          setFotoBlob(null);
        } else {
          toast.error("Erro ao enviar foto.");
        }
      }

      // 2. Dados de cadastro
      await apiFetch(`/usuarios/${usuarioLogado?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeCompleto: form.nomeCompleto,
          telefone:     form.telefone || null,
        }),
      });

      // 3. Anamnese — usa salvarAnamnese do contexto (PUT se já existe, POST se não)
      if (anamnese?.id) {
        await apiFetch(`/anamnese/${anamnese.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            peso:         parseFloat(form.peso)   || null,
            altura:       parseFloat(form.altura)  || null,
            objetivo:     form.objetivo || null,
            atividade:    form.atividade  || null,
            sono:         parseInt(form.sono)     || null,
            restricoes:   form.restricoes.join(", ")   || null,
            comorbidades: form.comorbidades.join(", ") || null,
          }),
        });
      } else {
        await salvarAnamnese({
          ...form,
          restricoes:   form.restricoes.join(", "),
          comorbidades: form.comorbidades.join(", "),
        });
      }

      toast.success("Perfil atualizado com sucesso!");
      setEditing(false);
      // Força recarregamento da foto com novo cache-buster
      if (fotoBlob === null && usuarioLogado?.id) {
        setFotoUrl(`/usuarios/${usuarioLogado.id}/imagem?t=${Date.now()}`);
        setFotoValida(true);
      }
      // Recarrega dados do backend para manter contexto sincronizado
      if (usuarioLogado?.id) await recarregarDadosPaciente(usuarioLogado.id);
    } catch {
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Restaura form para os valores originais
    setForm({
      nomeCompleto: usuarioLogado?.nome     || "",
      telefone:     usuarioLogado?.telefone || "",
      peso:         anamnese?.peso          || "",
      altura:       anamnese?.altura        || "",
      objetivo:     anamnese?.objetivo      || "",
      atividade:    anamnese?.atividade     || "",
      sono:         anamnese?.sono          || "",
      restricoes:   strToList(anamnese?.restricoes),
      comorbidades: strToList(anamnese?.comorbidades),
    });
    setFotoBlob(null);
    // Restaura foto do backend
    if (usuarioLogado?.id) {
      apiFetch(`/usuarios/${usuarioLogado.id}/imagem`)
        .then(r => { if (r.ok) { setFotoUrl(`/usuarios/${usuarioLogado.id}/imagem?t=${Date.now()}`); setFotoValida(true); } else { setFotoValida(false); } })
        .catch(() => setFotoValida(false));
    }
    setEditing(false);
  };

  const initials = (form.nomeCompleto || usuarioLogado?.nome || "?")
    .split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

  const inputClass = editing
    ? ""
    : "bg-gray-50 cursor-not-allowed text-gray-500";

  return (
    <Layout userType="patient">
      <div className="p-8">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meu Perfil de Saúde</h1>
            <p className="text-gray-500">Suas informações de cadastro e anamnese</p>
          </div>
          <div className="flex gap-2">
            {!editing ? (
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleAtualizar}>
                <Edit2 className="w-4 h-4 mr-2" /> Atualizar
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={saving}>
                  Cancelar
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave} disabled={saving}>
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Coluna lateral */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-sm overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-green-500 to-green-600" />
              <CardContent className="p-6 -mt-12 text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                    {fotoValida
                      ? <AvatarImage src={fotoUrl} className="object-cover"
                          onError={() => setFotoValida(false)} />
                      : fotoUrl && fotoUrl.startsWith("blob:")
                        ? <AvatarImage src={fotoUrl} className="object-cover" />
                        : <AvatarFallback className="bg-green-100 text-green-700 text-2xl font-bold">
                            {initials}
                          </AvatarFallback>
                    }
                  </Avatar>
                  {editing && (
                    <label className="absolute bottom-0 right-0 p-1.5 bg-green-600 rounded-full text-white cursor-pointer hover:bg-green-700 border-2 border-white">
                      <Camera className="w-3 h-3" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
                    </label>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{form.nomeCompleto || "—"}</h2>
                <p className="text-sm text-gray-500 mb-4">{usuarioLogado?.email || "—"}</p>
                <div className="flex flex-col gap-2 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Telefone</span>
                    <span className="font-bold">{form.telefone || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Sexo</span>
                    <span className="font-bold">
                      {anamnese?.sexo === "M" ? "Masculino" : anamnese?.sexo === "F" ? "Feminino" : "—"}
                    </span>
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
                    <p className="text-sm font-bold text-gray-900">
                      {form.restricoes.length ? form.restricoes.join(", ") : "Nenhuma registrada"}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-400 font-bold uppercase">Comorbidades</p>
                    <p className="text-sm font-bold text-gray-900">
                      {form.comorbidades.length ? form.comorbidades.join(", ") : "Nenhuma registrada"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna principal */}
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
                    <Input
                      value={form.nomeCompleto}
                      onChange={e => set("nomeCompleto", e.target.value)}
                      readOnly={!editing}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input
                      value={usuarioLogado?.email || ""}
                      readOnly
                      className="bg-gray-50 cursor-not-allowed text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={form.telefone}
                      onChange={e => set("telefone", e.target.value)}
                      readOnly={!editing}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Idade</Label>
                    <Input
                      value={anamnese?.idade ? `${anamnese.idade} anos` : ""}
                      readOnly
                      className="bg-gray-50 cursor-not-allowed text-gray-500"
                    />
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
                    <Input
                      type="number"
                      value={form.peso}
                      onChange={e => set("peso", e.target.value)}
                      readOnly={!editing}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Altura (cm)</Label>
                    <Input
                      type="number"
                      value={form.altura}
                      onChange={e => set("altura", e.target.value)}
                      readOnly={!editing}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Objetivo</Label>
                    {editing ? (
                      <Select value={form.objetivo} onValueChange={v => set("objetivo", v)}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {OBJETIVOS.map(o => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={OBJETIVOS.find(o => o.value === form.objetivo)?.label || form.objetivo}
                        readOnly
                        className={inputClass}
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Nível de Atividade
                    </Label>
                    {editing ? (
                      <Select value={form.atividade} onValueChange={v => set("atividade", v)}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {ATIVIDADES.map(a => (
                            <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={ATIVIDADES.find(a => a.value === form.atividade)?.label || form.atividade}
                        readOnly
                        className={inputClass}
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Moon className="w-4 h-4" /> Horas de Sono
                    </Label>
                    {editing ? (
                      <Select value={String(form.sono)} onValueChange={v => set("sono", v)}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {HORAS_SONO.map(h => (
                            <SelectItem key={h} value={h}>{h} {h === "1" ? "hora" : "horas"}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={form.sono ? `${form.sono} horas` : ""}
                        readOnly
                        className={inputClass}
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Restrições e Alergias</Label>
                    {editing ? (
                      <div className="grid grid-cols-2 gap-2 p-3 border rounded-md">
                        {RESTRICOES.map(item => (
                          <div key={item} className="flex items-center gap-2">
                            <Checkbox
                              id={`res-${item}`}
                              checked={form.restricoes.includes(item)}
                              onCheckedChange={() => set("restricoes", toggleItem(form.restricoes, item))}
                            />
                            <label htmlFor={`res-${item}`} className="text-sm cursor-pointer">{item}</label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Input
                        value={form.restricoes.join(", ") || "Nenhuma registrada"}
                        readOnly
                        className={inputClass}
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Problemas de Saúde e Comorbidades</Label>
                    {editing ? (
                      <div className="grid grid-cols-2 gap-2 p-3 border rounded-md">
                        {COMORBIDADES.map(item => (
                          <div key={item} className="flex items-center gap-2">
                            <Checkbox
                              id={`com-${item}`}
                              checked={form.comorbidades.includes(item)}
                              onCheckedChange={() => set("comorbidades", toggleItem(form.comorbidades, item))}
                            />
                            <label htmlFor={`com-${item}`} className="text-sm cursor-pointer">{item}</label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Input
                        value={form.comorbidades.join(", ") || "Nenhuma registrada"}
                        readOnly
                        className={inputClass}
                      />
                    )}
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
