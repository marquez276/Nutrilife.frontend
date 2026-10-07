import { Layout } from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Star, Search, MessageCircle, Instagram, Globe, Linkedin, Video, Award, TrendingUp, DollarSign, Send, UserPlus, Check, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

export default function NutricionistasLista() {
  const { nutricionistas, adicionarAvaliacao, usuarioLogado, recarregarNutricionistas, vinculos, solicitarVinculo, resgatarConvite } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNutri, setSelectedNutri] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [enviando, setEnviando] = useState(false);
  const [solicitando, setSolicitando] = useState(false);
  const [convitePaciente, setConvitePaciente] = useState("");
  const [resgatando, setResgatando] = useState(false);
  const [dialogConviteAberto, setDialogConviteAberto] = useState(false);

  useEffect(() => { recarregarNutricionistas(); }, []);

  const filteredNutris = nutricionistas.filter(n =>
    (n.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (n.specialty || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitReview = async () => {
    if (!newReview.comment.trim()) { toast.error("Escreva um comentário."); return; }
    if (!usuarioLogado?.id) { toast.error("Você precisa estar logado."); return; }
    setEnviando(true);
    await adicionarAvaliacao(selectedNutri.id, { rating: newReview.rating, comment: newReview.comment });
    setSelectedNutri(prev => {
      const updated = nutricionistas.find(n => n.id === prev.id);
      return updated ? { ...updated } : prev;
    });
    toast.success("Avaliação enviada!");
    setNewReview({ rating: 5, comment: "" });
    setEnviando(false);
  };

  const vinculoCom = (nutricionistaId) => vinculos.find(v => v.nutricionistaId === nutricionistaId);

  const handleSolicitar = async (nutricionistaId) => {
    setSolicitando(true);
    await solicitarVinculo(nutricionistaId);
    setSolicitando(false);
  };

  const handleResgatarConvite = async () => {
    if (!convitePaciente.trim()) { toast.error("Informe o código de convite."); return; }
    setResgatando(true);
    const { ok } = await resgatarConvite(convitePaciente.trim().toUpperCase());
    setResgatando(false);
    if (ok) { setConvitePaciente(""); setDialogConviteAberto(false); }
  };

  const mediaRating = (reviews) => {
    if (!reviews?.length) return null;
    return (reviews.reduce((s, r) => s + (r.rating ?? r.nota ?? 0), 0) / reviews.length).toFixed(1);
  };

  return (
    <Layout userType="patient">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Encontre seu Nutricionista</h1>
          <p className="text-gray-500">Especialistas prontos para te ajudar em sua jornada de saúde</p>
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-4">
          <div className="relative max-w-2xl flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input placeholder="Buscar por nome ou especialidade..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-12 h-12 text-lg shadow-sm border-gray-200" />
          </div>
          <Dialog open={dialogConviteAberto} onOpenChange={setDialogConviteAberto}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Já tenho um código de convite</DialogTitle>
                <DialogDescription>Informe o código que seu nutricionista compartilhou com você.</DialogDescription>
              </DialogHeader>
              <Input placeholder="NUTRI-XXXXXX" value={convitePaciente} onChange={e => setConvitePaciente(e.target.value)} />
              <Button className="bg-green-600 hover:bg-green-700 w-full" onClick={handleResgatarConvite} disabled={resgatando}>
                {resgatando ? "Validando..." : "Vincular"}
              </Button>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="h-12" onClick={() => setDialogConviteAberto(true)}>Tenho um código de convite</Button>
        </div>

        {filteredNutris.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-gray-400">
            {nutricionistas.length === 0
              ? "No momento não há nutricionistas disponíveis."
              : "Nenhum nutricionista encontrado."}
          </CardContent></Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNutris.map(nutri => {
              const rating = mediaRating(nutri.reviews) ?? (nutri.rating > 0 ? nutri.rating.toFixed(1) : null);
              return (
                <Card key={nutri.id} className="hover:shadow-xl transition-all group overflow-hidden border-none shadow-sm">
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    {nutri.fotoUrl ? (
                      <img src={nutri.fotoUrl} alt={nutri.nome}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={e => { e.target.style.display = "none"; }}
                      />
                    ) : null}
                    <div className={`absolute inset-0 w-full h-full flex items-center justify-center text-6xl font-bold text-gray-300 bg-gray-100 ${nutri.fotoUrl ? "opacity-0" : "opacity-100"}`}>
                      {(nutri.nome || "?").charAt(0)}
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-white/95 text-green-700 border-none px-3 py-1 text-sm font-bold">
                        <Star className="w-4 h-4 fill-green-600 text-green-600 mr-1" />
                        {rating ?? "Novo"}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl group-hover:text-green-600 transition-colors">{nutri.nome}</CardTitle>
                    <p className="text-green-600 font-bold uppercase tracking-wider text-xs">{nutri.specialty}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-6">{nutri.bio || "Sem descrição."}</p>
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-green-600 hover:bg-green-700 h-11" onClick={() => setSelectedNutri(nutri)}>
                        Ver Perfil Completo
                      </Button>
                      {nutri.whatsapp && (
                        <Button variant="outline" className="text-[#25D366] border-[#25D366] hover:bg-green-50 h-11"
                          onClick={() => window.open(`https://wa.me/${nutri.whatsapp.replace(/\D/g, "")}`)}>
                          <MessageCircle className="w-5 h-5" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={!!selectedNutri} onOpenChange={open => !open && setSelectedNutri(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none">
            {selectedNutri && (
              <div className="flex flex-col">
                <DialogHeader className="sr-only">
                  <DialogTitle>Perfil de {selectedNutri.nome}</DialogTitle>
                  <DialogDescription>Informações detalhadas sobre o nutricionista.</DialogDescription>
                </DialogHeader>
                <div className="relative h-64 bg-gray-200">
                  {selectedNutri.fotoUrl ? (
                    <img src={selectedNutri.fotoUrl} className="w-full h-full object-cover" alt={selectedNutri.nome}
                      onError={e => { e.target.style.display = "none"; }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-8 text-white">
                    {selectedNutri.specialty && <Badge className="mb-2 bg-green-500 border-none text-white">{selectedNutri.specialty}</Badge>}
                    <h2 className="text-4xl font-bold">{selectedNutri.nome}</h2>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Lateral */}
                    <div className="w-full md:w-1/3 space-y-6">
                      <Card className="border-none shadow-sm bg-gray-50">
                        <CardContent className="p-4 space-y-3">
                          {(() => {
                            const v = vinculoCom(selectedNutri.id);
                            if (v?.status === "ATIVO") {
                              return (
                                <Button disabled className="w-full h-12 bg-green-100 text-green-700 border-none">
                                  <Check className="w-5 h-5 mr-2" /> Vinculado
                                </Button>
                              );
                            }
                            if (v?.status === "PENDENTE") {
                              return (
                                <Button disabled className="w-full h-12 bg-amber-100 text-amber-700 border-none">
                                  <Clock className="w-5 h-5 mr-2" /> Solicitação enviada
                                </Button>
                              );
                            }
                            return (
                              <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-12"
                                onClick={() => handleSolicitar(selectedNutri.id)} disabled={solicitando}>
                                <UserPlus className="w-5 h-5 mr-2" /> {solicitando ? "Enviando..." : "Solicitar acompanhamento"}
                              </Button>
                            );
                          })()}
                          {selectedNutri.whatsapp && (
                            <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white h-12"
                              onClick={() => window.open(`https://wa.me/${selectedNutri.whatsapp.replace(/\D/g, "")}`)}>
                              <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp
                            </Button>
                          )}
                          <div className="flex justify-center gap-3 flex-wrap">
                            {selectedNutri.instagram && (
                              <a href={`https://instagram.com/${selectedNutri.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                                className="p-2 bg-white rounded-lg shadow-sm text-gray-600 hover:text-pink-600">
                                <Instagram className="w-5 h-5" />
                              </a>
                            )}
                            {selectedNutri.linkedin && (
                              <a href={`https://linkedin.com/in/${selectedNutri.linkedin}`} target="_blank" rel="noopener noreferrer"
                                className="p-2 bg-white rounded-lg shadow-sm text-gray-600 hover:text-blue-600">
                                <Linkedin className="w-5 h-5" />
                              </a>
                            )}
                            {selectedNutri.website && (
                              <a href={selectedNutri.website.startsWith("http") ? selectedNutri.website : `https://${selectedNutri.website}`}
                                target="_blank" rel="noopener noreferrer"
                                className="p-2 bg-white rounded-lg shadow-sm text-gray-600 hover:text-green-600">
                                <Globe className="w-5 h-5" />
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {selectedNutri.precos?.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" /> Tabela de Preços
                          </h4>
                          {selectedNutri.precos.map((p, i) => (
                            <div key={i} className="flex justify-between p-3 bg-white border rounded-xl text-sm">
                              <span className="text-gray-600">{p.label}</span>
                              <span className="font-bold text-green-700">{p.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1">
                      <Tabs defaultValue="sobre" className="w-full">
                        <TabsList className="mb-6 h-12 w-full p-1 bg-gray-100 rounded-xl">
                          <TabsTrigger value="sobre" className="flex-1 rounded-lg">Sobre</TabsTrigger>
                          <TabsTrigger value="portfolio" className="flex-1 rounded-lg">Fotos/Vídeos</TabsTrigger>
                          <TabsTrigger value="avaliacoes" className="flex-1 rounded-lg">
                            Avaliações ({selectedNutri.reviews?.length || 0})
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="sobre" className="space-y-6">
                          {selectedNutri.bio && (
                            <div>
                              <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                                <Award className="w-4 h-4 text-green-600" /> Biografia
                              </h4>
                              <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl italic">"{selectedNutri.bio}"</p>
                            </div>
                          )}
                          {selectedNutri.experiencia?.length > 0 && (
                            <div>
                              <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                                <TrendingUp className="w-4 h-4 text-green-600" /> Experiência
                              </h4>
                              <div className="space-y-2">
                                {selectedNutri.experiencia.map((exp, i) => (
                                  <div key={i} className="flex gap-3 text-gray-600 items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                                    <span>{exp}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="portfolio">
                          <div className="grid grid-cols-2 gap-4">
                            {selectedNutri.portfolio?.map((img, i) => (
                              <div key={i} className="relative aspect-video rounded-xl overflow-hidden shadow-sm">
                                <img src={img} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                            {selectedNutri.videos?.map((vid, i) => (
                              <div key={i} className="relative aspect-video rounded-xl overflow-hidden shadow-sm bg-gray-900 flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
                                  <Video className="w-5 h-5 ml-0.5" />
                                </div>
                                <p className="absolute bottom-2 left-2 right-2 text-[10px] text-white font-bold truncate">{vid}</p>
                              </div>
                            ))}
                            {!selectedNutri.portfolio?.length && !selectedNutri.videos?.length && (
                              <p className="col-span-2 text-center text-gray-400 py-12">Nenhum arquivo disponível.</p>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="avaliacoes" className="space-y-4">
                          <Card className="border-2 border-dashed border-green-200 bg-green-50/30">
                            <CardContent className="p-4">
                              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Send className="w-4 h-4 text-green-600" /> Escrever Avaliação
                              </h4>
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">Nota:</span>
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(star => (
                                      <button key={star} onClick={() => setNewReview(p => ({ ...p, rating: star }))}>
                                        <Star className={`w-5 h-5 cursor-pointer ${star <= newReview.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <Textarea placeholder="Compartilhe sua experiência..." value={newReview.comment}
                                  onChange={e => setNewReview(p => ({ ...p, comment: e.target.value }))} rows={3} className="resize-none" />
                                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleSubmitReview} disabled={enviando}>
                                  <Send className="w-4 h-4 mr-2" /> {enviando ? "Enviando..." : "Enviar Avaliação"}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>

                          {selectedNutri.reviews?.length === 0 && (
                            <p className="text-center text-gray-400 py-4">Nenhuma avaliação ainda.</p>
                          )}
                          {selectedNutri.reviews?.map((rev, i) => (
                            <div key={rev.id ?? i} className="p-4 bg-gray-50 rounded-2xl">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-gray-900">{rev.userName || "Paciente"}</span>
                                <div className="flex gap-0.5">
                                  {[...Array(5)].map((_, j) => (
                                    <Star key={j} className={`w-3 h-3 ${j < (rev.rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">"{rev.comment}"</p>
                              <span className="text-[10px] text-gray-400 block mt-2">{rev.date}</span>
                            </div>
                          ))}
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
