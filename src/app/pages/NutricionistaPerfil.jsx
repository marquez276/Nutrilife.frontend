import { Layout } from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Save, Plus, Trash2, DollarSign, Camera, Video, Instagram, Linkedin, Globe, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { toast } from "sonner";
import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function NutricionistaPerfil() {
  const { usuarioLogado } = useApp();

  const [prices, setPrices] = useState(
    usuarioLogado?.prices?.length > 0
      ? usuarioLogado.prices
      : [{ label: "Consulta Inicial", value: "" }]
  );
  const [nome, setNome] = useState(usuarioLogado?.nome || "");
  const [email, setEmail] = useState(usuarioLogado?.email || "");
  const [telefone, setTelefone] = useState(usuarioLogado?.telefone || "");
  const [specialty, setSpecialty] = useState(usuarioLogado?.specialty || "");
  const [bio, setBio] = useState(usuarioLogado?.bio || "");
  const [experience, setExperience] = useState(
    usuarioLogado?.experience?.join("\n") || ""
  );

  const initials = nome
    ? nome.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
    : "??";

  const handleSave = async () => {
    try {
      await fetch(`/usuarios/${usuarioLogado?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomeCompleto: nome, telefone, crn: usuarioLogado?.crn }),
      });
      toast.success("Perfil profissional atualizado com sucesso!");
    } catch {
      toast.error("Erro ao salvar. Tente novamente.");
    }
  };

  return (
    <Layout userType="nutritionist">
      <div className="p-8">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Perfil Profissional</h1>
            <p className="text-gray-500">Gerencie sua presença pública e informações clínicas</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" /> Salvar Perfil
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative group mb-4">
                    <Avatar className="w-32 h-32 border-4 border-green-50 shadow-md">
                      {usuarioLogado?.photo && <AvatarImage src={usuarioLogado.photo} className="object-cover" />}
                      <AvatarFallback className="bg-green-100 text-green-700 text-3xl font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-0 right-0 p-2 bg-green-600 rounded-full text-white cursor-pointer hover:bg-green-700 shadow-lg border-2 border-white transition-all">
                      <Camera className="w-4 h-4" />
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const form = new FormData();
                        form.append("file", file);
                        try {
                          await fetch(`/usuarios/${usuarioLogado?.id}/imagem`, { method: "POST", body: form });
                          toast.success("Foto atualizada!");
                        } catch {
                          toast.error("Erro ao enviar imagem.");
                        }
                      }} />
                    </label>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{nome || "—"}</h2>
                  <p className="text-green-600 font-medium mb-4">CRN {usuarioLogado?.crn || "—"}</p>
                  <div className="flex justify-center gap-3 mt-2">
                    <Button variant="outline" size="icon" className="text-pink-600 border-pink-100 hover:bg-pink-50"><Instagram className="w-4 h-4" /></Button>
                    <Button variant="outline" size="icon" className="text-blue-600 border-blue-100 hover:bg-blue-50"><Linkedin className="w-4 h-4" /></Button>
                    <Button variant="outline" size="icon" className="text-green-600 border-green-100 hover:bg-green-50"><Globe className="w-4 h-4" /></Button>
                    <Button variant="outline" size="icon" className="text-[#25D366] border-[#25D366]/20 hover:bg-green-50"><MessageCircle className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" /> Tabela de Preços
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {prices.map((price, idx) => (
                  <div key={idx} className="flex gap-3">
                    <Input
                      placeholder="Serviço"
                      value={price.label}
                      onChange={(e) => {
                        const updated = [...prices];
                        updated[idx] = { ...updated[idx], label: e.target.value };
                        setPrices(updated);
                      }}
                      className="flex-1"
                    />
                    <Input
                      placeholder="R$ 0,00"
                      value={price.value}
                      onChange={(e) => {
                        const updated = [...prices];
                        updated[idx] = { ...updated[idx], value: e.target.value };
                        setPrices(updated);
                      }}
                      className="w-28 text-right"
                    />
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => setPrices(prices.filter((_, i) => i !== idx))}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full text-xs mt-2" onClick={() => setPrices([...prices, { label: "", value: "" }])}>
                  <Plus className="w-3 h-3 mr-1" /> Adicionar Serviço
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>Informações Básicas</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome Público</Label>
                    <Input value={nome} onChange={e => setNome(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail Profissional</Label>
                    <Input value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone / WhatsApp</Label>
                    <Input value={telefone} onChange={e => setTelefone(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Especialidade</Label>
                    <Input value={specialty} onChange={e => setSpecialty(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Sobre Você</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Biografia Curta</Label>
                  <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="Descreva sua experiência e abordagem profissional..." />
                </div>
                <div className="space-y-2">
                  <Label>Experiência Profissional (uma por linha)</Label>
                  <Textarea value={experience} onChange={e => setExperience(e.target.value)} rows={4} placeholder="Ex: Clínica XYZ (2020 - Presente)" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Mídia (Fotos e Vídeos)</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="aspect-square bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-green-600 hover:border-green-300 transition-all cursor-pointer">
                    <Plus className="w-8 h-8 mb-2" />
                    <span className="text-xs font-bold uppercase tracking-wider">Adicionar</span>
                  </div>
                  {usuarioLogado?.portfolio?.map((img, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-xl relative overflow-hidden group">
                      <img src={img} className="w-full h-full object-cover" alt={`portfolio ${i + 1}`} />
                    </div>
                  ))}
                  {usuarioLogado?.videos?.map((vid, i) => (
                    <div key={i} className="aspect-square bg-gray-900 rounded-xl relative overflow-hidden group flex items-center justify-center">
                      <Video className="w-10 h-10 text-white opacity-40" />
                      <p className="absolute bottom-2 text-[10px] text-white font-bold truncate px-2">{vid}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400">Estes arquivos aparecerão no seu perfil público.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
