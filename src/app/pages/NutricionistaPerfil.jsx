import { Layout } from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Edit2, Save, X, Plus, Trash2, DollarSign, Camera, Video, Instagram, Linkedin, Globe, MessageCircle, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { apiFetch } from "../api";

export default function NutricionistaPerfil() {
  const { usuarioLogado, recarregarNutricionistas, atualizarUsuarioLogado } = useApp();
  const id = usuarioLogado?.id;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fotoValida, setFotoValida] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const photoInputRef = useRef(null);
  const mediaInputRef = useRef(null);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    specialty: "",
    bio: "",
    experience: "",
    whatsapp: "",
    instagram: "",
    linkedin: "",
    website: "",
    prices: [{ label: "Consulta Inicial", value: "" }],
    portfolio: [],
    videos: [],
  });

  // snapshot to restore on cancel
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    if (!id) return;
    apiFetch(`/usuarios/${id}/imagem`)
      .then(r => {
        if (r.ok) { setPhotoUrl(`/usuarios/${id}/imagem?t=${Date.now()}`); setFotoValida(true); }
        else setFotoValida(false);
      })
      .catch(() => setFotoValida(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    apiFetch(`/nutricionistas/${id}/perfil`)
      .then(r => r.ok ? r.json() : null)
      .then(p => {
        const base = {
          nome: usuarioLogado?.nome || usuarioLogado?.nomeCompleto || "",
          email: usuarioLogado?.email || "",
          telefone: usuarioLogado?.telefone || "",
          specialty: "",
          bio: "",
          experience: "",
          whatsapp: "",
          instagram: "",
          linkedin: "",
          website: "",
          prices: [{ label: "Consulta Inicial", value: "" }],
          portfolio: [],
          videos: [],
        };
        if (!p) { setForm(base); return; }
        const loaded = {
          ...base,
          specialty:  p.especialidade || "",
          bio:        p.bio           || "",
          experience: p.experiencia   || "",
          whatsapp:   p.whatsapp      || "",
          instagram:  p.instagram     || "",
          linkedin:   p.linkedin      || "",
          website:    p.website       || "",
          prices:     (() => { try { const parsed = JSON.parse(p.precos); return Array.isArray(parsed) ? parsed : base.prices; } catch { return base.prices; } })(),
          portfolio:  p.portfolio ? p.portfolio.split("\n").filter(Boolean) : base.portfolio,
          videos:     p.videos    ? p.videos.split("\n").filter(Boolean)    : base.videos,
        };
        if (p.nutricionista) {
          if (p.nutricionista.nomeCompleto) loaded.nome     = p.nutricionista.nomeCompleto;
          if (p.nutricionista.telefone)     loaded.telefone = p.nutricionista.telefone;
        }
        setForm(loaded);
      })
      .catch(() => {});
  }, [id]);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const initials = (form.nome || "??")
    .split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

  const inputClass = editing ? "" : "bg-gray-50 cursor-not-allowed text-gray-500";

  const handleAtualizar = () => {
    setSnapshot(form);
    setEditing(true);
  };

  const handleCancel = () => {
    if (snapshot) setForm(snapshot);
    setEditing(false);
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const [userRes, perfilRes] = await Promise.all([
        apiFetch(`/usuarios/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nomeCompleto: form.nome, telefone: form.telefone, crn: usuarioLogado?.crn }),
        }),
        apiFetch(`/nutricionistas/${id}/perfil`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            especialidade: form.specialty,
            bio:           form.bio,
            whatsapp:      form.whatsapp,
            instagram:     form.instagram,
            linkedin:      form.linkedin,
            website:       form.website,
            experiencia:   form.experience,
            precos:        JSON.stringify(form.prices),
            portfolio:     form.portfolio.join("\n"),
            videos:        form.videos.join("\n"),
          }),
        }),
      ]);
      if (!userRes.ok || !perfilRes.ok) throw new Error();
      atualizarUsuarioLogado({ nome: form.nome, nomeCompleto: form.nome, telefone: form.telefone });
      recarregarNutricionistas();
      toast.success("Perfil salvo com sucesso!");
      setEditing(false);
    } catch {
      toast.error("Erro ao salvar perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !id) return;
    setUploadingPhoto(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await apiFetch(`/usuarios/${id}/imagem`, { method: "POST", body: form });
      if (!res.ok) throw new Error();
      setPhotoUrl(`/usuarios/${id}/imagem?t=${Date.now()}`);
      setFotoValida(true);
      toast.success("Foto atualizada!");
    } catch {
      toast.error("Erro ao enviar foto.");
    } finally {
      if (photoInputRef.current) photoInputRef.current.value = "";
      setUploadingPhoto(false);
    }
  };

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !id) return;
    setUploadingMedia(true);
    const newImages = [];
    const newVideos = [];
    await Promise.all(files.map(file => new Promise(resolve => {
      if (file.type.startsWith("video/")) { newVideos.push(file.name); resolve(); }
      else {
        const reader = new FileReader();
        reader.onload = ev => { newImages.push(ev.target.result); resolve(); };
        reader.onerror = () => resolve();
        reader.readAsDataURL(file);
      }
    })));
    const updatedPortfolio = [...form.portfolio, ...newImages];
    const updatedVideos    = [...form.videos,    ...newVideos];
    setForm(prev => ({ ...prev, portfolio: updatedPortfolio, videos: updatedVideos }));
    await apiFetch(`/nutricionistas/${id}/perfil`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ portfolio: updatedPortfolio.join("\n"), videos: updatedVideos.join("\n") }),
    }).catch(() => {});
    toast.success(`${newImages.length + newVideos.length} arquivo(s) adicionado(s)!`);
    setUploadingMedia(false);
    if (mediaInputRef.current) mediaInputRef.current.value = "";
  };

  const removePortfolioItem = async (idx) => {
    const updated = form.portfolio.filter((_, i) => i !== idx);
    setForm(prev => ({ ...prev, portfolio: updated }));
    if (!id) return;
    await apiFetch(`/nutricionistas/${id}/perfil`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ portfolio: updated.join("\n"), videos: form.videos.join("\n") }),
    }).catch(() => {});
  };

  const removeVideoItem = async (idx) => {
    const updated = form.videos.filter((_, i) => i !== idx);
    setForm(prev => ({ ...prev, videos: updated }));
    if (!id) return;
    await apiFetch(`/nutricionistas/${id}/perfil`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ portfolio: form.portfolio.join("\n"), videos: updated.join("\n") }),
    }).catch(() => {});
  };

  return (
    <Layout userType="nutritionist">
      <div className="p-8">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Perfil Profissional</h1>
            <p className="text-gray-500">Gerencie sua presença pública e informações clínicas</p>
          </div>
          <div className="flex gap-2">
            {!editing ? (
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleAtualizar}>
                <Edit2 className="w-4 h-4 mr-2" /> Atualizar
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={saving}>
                  <X className="w-4 h-4 mr-2" /> Cancelar
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Left column ── */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative group mb-4">
                    <Avatar className="w-32 h-32 border-4 border-green-50 shadow-md">
                      {fotoValida && (
                        <AvatarImage src={photoUrl} className="object-cover" onError={() => setFotoValida(false)} />
                      )}
                      <AvatarFallback className="bg-green-100 text-green-700 text-3xl font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-0 right-0 p-2 bg-green-600 rounded-full text-white cursor-pointer hover:bg-green-700 shadow-lg border-2 border-white transition-all">
                      {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </label>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{form.nome || "—"}</h2>
                  <p className="text-green-600 font-medium mb-1">CRN {usuarioLogado?.crn || "—"}</p>
                  {form.specialty && <p className="text-sm text-gray-500 mb-4">{form.specialty}</p>}
                  <div className="flex justify-center gap-3 mt-2">
                    {form.instagram && (
                      <a href={`https://instagram.com/${form.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="icon" className="text-pink-600 border-pink-100 hover:bg-pink-50"><Instagram className="w-4 h-4" /></Button>
                      </a>
                    )}
                    {form.linkedin && (
                      <a href={`https://linkedin.com/in/${form.linkedin}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="icon" className="text-blue-600 border-blue-100 hover:bg-blue-50"><Linkedin className="w-4 h-4" /></Button>
                      </a>
                    )}
                    {form.website && (
                      <a href={form.website.startsWith("http") ? form.website : `https://${form.website}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="icon" className="text-green-600 border-green-100 hover:bg-green-50"><Globe className="w-4 h-4" /></Button>
                      </a>
                    )}
                    {form.whatsapp && (
                      <a href={`https://wa.me/${form.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="icon" className="text-[#25D366] border-[#25D366]/20 hover:bg-green-50"><MessageCircle className="w-4 h-4" /></Button>
                      </a>
                    )}
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
                {form.prices.map((price, idx) => (
                  <div key={idx} className="flex gap-3">
                    <Input
                      placeholder="Serviço"
                      value={price.label}
                      readOnly={!editing}
                      className={`flex-1 ${!editing ? inputClass : ""}`}
                      onChange={e => {
                        const updated = [...form.prices];
                        updated[idx] = { ...updated[idx], label: e.target.value };
                        set("prices", updated);
                      }}
                    />
                    <Input
                      placeholder="R$ 0,00"
                      value={price.value}
                      readOnly={!editing}
                      className={`w-28 text-right ${!editing ? inputClass : ""}`}
                      onChange={e => {
                        const updated = [...form.prices];
                        updated[idx] = { ...updated[idx], value: e.target.value };
                        set("prices", updated);
                      }}
                    />
                    {editing && (
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => set("prices", form.prices.filter((_, i) => i !== idx))}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {editing && (
                  <Button variant="outline" className="w-full text-xs mt-2" onClick={() => set("prices", [...form.prices, { label: "", value: "" }])}>
                    <Plus className="w-3 h-3 mr-1" /> Adicionar Serviço
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Right columns ── */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome Público</Label>
                    <Input value={form.nome} readOnly={!editing} className={inputClass} onChange={e => set("nome", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail Profissional</Label>
                    <Input value={form.email} readOnly className="bg-gray-50 cursor-not-allowed text-gray-500" />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input value={form.telefone} readOnly={!editing} className={inputClass} onChange={e => set("telefone", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Especialidade</Label>
                    <Input value={form.specialty} readOnly={!editing} className={inputClass} onChange={e => set("specialty", e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Redes Sociais</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><MessageCircle className="w-4 h-4 text-[#25D366]" /> WhatsApp</Label>
                    <Input placeholder="5511999999999" value={form.whatsapp} readOnly={!editing} className={inputClass} onChange={e => set("whatsapp", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Instagram className="w-4 h-4 text-pink-600" /> Instagram</Label>
                    <Input placeholder="@seuperfil" value={form.instagram} readOnly={!editing} className={inputClass} onChange={e => set("instagram", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Linkedin className="w-4 h-4 text-blue-600" /> LinkedIn</Label>
                    <Input placeholder="seu-perfil" value={form.linkedin} readOnly={!editing} className={inputClass} onChange={e => set("linkedin", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Globe className="w-4 h-4 text-green-600" /> Website</Label>
                    <Input placeholder="https://..." value={form.website} readOnly={!editing} className={inputClass} onChange={e => set("website", e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Sobre Você</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Biografia Curta</Label>
                  <Textarea
                    value={form.bio}
                    readOnly={!editing}
                    className={inputClass}
                    rows={4}
                    placeholder={editing ? "Descreva sua experiência e abordagem profissional..." : ""}
                    onChange={e => set("bio", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Experiência Profissional (uma por linha)</Label>
                  <Textarea
                    value={form.experience}
                    readOnly={!editing}
                    className={inputClass}
                    rows={4}
                    placeholder={editing ? "Ex: Clínica XYZ (2020 - Presente)" : ""}
                    onChange={e => set("experience", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Mídia (Fotos)</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {editing && (
                    <label className="aspect-square bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-green-600 hover:border-green-300 transition-all cursor-pointer">
                      {uploadingMedia
                        ? <Loader2 className="w-8 h-8 mb-2 animate-spin text-green-600" />
                        : <Plus className="w-8 h-8 mb-2" />}
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {uploadingMedia ? "Enviando..." : "Adicionar"}
                      </span>
                      <input ref={mediaInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleMediaUpload} />
                    </label>
                  )}

                  {form.portfolio.map((img, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-xl relative overflow-hidden group">
                      <img src={img} className="w-full h-full object-cover" alt={`portfolio ${i + 1}`} />
                      {editing && (
                        <button
                          onClick={() => removePortfolioItem(i)}
                          className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}

                  {form.videos.map((vid, i) => (
                    <div key={i} className="aspect-square bg-gray-900 rounded-xl relative overflow-hidden group flex items-center justify-center">
                      <Video className="w-10 h-10 text-white opacity-40" />
                      <p className="absolute bottom-2 text-[10px] text-white font-bold truncate px-2">{vid}</p>
                      {editing && (
                        <button
                          onClick={() => removeVideoItem(i)}
                          className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}

                  {!editing && form.portfolio.length === 0 && form.videos.length === 0 && (
                    <p className="text-sm text-gray-400 col-span-3 py-4">Nenhuma mídia adicionada.</p>
                  )}
                </div>
                <p className="text-xs text-gray-400">Estas fotos aparecerão no seu perfil público para os clientes.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
