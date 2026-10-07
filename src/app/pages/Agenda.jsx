import { Layout } from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calendar, Clock, Video, Plus, Edit2, Trash2, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useApp } from "../context/AppContext";

function hoje() {
  return format(new Date(), "yyyy-MM-dd");
}

function isoParaDisplay(iso) {
  if (!iso) return "";
  const d = String(iso).split("T")[0];
  const [y, m, dia] = d.split("-");
  if (!y || !m || !dia) return iso;
  return `${dia}/${m}/${y}`;
}

function normDate(a) {
  return (a.date || "").split("T")[0];
}

export default function Agenda({ userType = "patient" }) {
  const { agendamentos, adicionarAgendamento, editarAgendamento, removerAgendamento, nutricionistas, vinculos } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const FORM_VAZIO = { nutritionist: "", paciente: "", date: hoje(), time: "09:00", videoLink: "", observations: "" };
  const [formData, setFormData] = useState(FORM_VAZIO);
  const set = (field, value) => setFormData(p => ({ ...p, [field]: value }));

  const handleOpenDialog = (ag) => {
    if (ag) {
      setEditingId(ag.id);
      setFormData({
        nutritionist: ag.nutritionist || ag.nutricionistaNome || "",
        paciente: ag.paciente || ag.pacienteNome || "",
        date: ag.date || hoje(),
        time: ag.time || "09:00",
        videoLink: ag.videoLink || "",
        observations: ag.observations || "",
      });
    } else {
      setEditingId(null);
      setFormData({ ...FORM_VAZIO, date: format(selectedDate, "yyyy-MM-dd") });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.date || !formData.time) { toast.error("Preencha a data e o horário."); return; }
    if (editingId) {
      editarAgendamento(editingId, formData);
      toast.success("Agendamento atualizado!");
    } else {
      adicionarAgendamento(formData);
      toast.success("Consulta agendada!");
    }
    setIsDialogOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const monthStart = startOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(monthStart), { weekStartsOn: 0 }),
  });

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const todayStr = hoje();

  const selectedAppointments = agendamentos.filter(a => normDate(a) === selectedDateStr);

  const nomesNutricionistas = nutricionistas.map(n => n.nome).filter(Boolean);
  const nomesPacientes = vinculos.filter(v => v.status === "ATIVO").map(v => v.clienteNome).filter(Boolean);

  return (
    <Layout userType={userType}>
      <div className="p-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {userType === "nutritionist" ? "Agenda de Pacientes" : "Minha Agenda"}
            </h1>
            <p className="text-gray-500">Acompanhe seus horários de forma visual e intuitiva</p>
          </div>
          <Button onClick={() => handleOpenDialog(null)} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> Novo Agendamento
          </Button>
        </div>

        {/* Calendário */}
        <Card className="mb-8 border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-green-600 text-white p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl capitalize text-white">
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-green-700 h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-green-700 h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(d => (
                <div key={d} className="text-center text-xs font-bold text-gray-400 py-2 uppercase tracking-wider">{d}</div>
              ))}
              {calendarDays.map((day, i) => {
                const dayStr = format(day, "yyyy-MM-dd");
                const hasAppointment = agendamentos.some(a => normDate(a) === dayStr);
                const isSelected = dayStr === selectedDateStr;
                const isToday = dayStr === todayStr;
                const isCurrentMonth = isSameMonth(day, monthStart);
                return (
                  <div key={i} onClick={() => setSelectedDate(day)}
                    className={`relative h-14 sm:h-20 flex flex-col items-center justify-center cursor-pointer rounded-xl transition-all
                      ${!isCurrentMonth ? "opacity-30" : "opacity-100"}
                      ${isSelected ? "bg-green-600 text-white shadow-lg" : "hover:bg-green-50 text-gray-700"}
                      ${isToday && !isSelected ? "border-2 border-green-600" : ""}`}>
                    <span className={`text-sm sm:text-lg font-bold ${isSelected ? "text-white" : isToday ? "text-green-600" : "text-gray-900"}`}>
                      {format(day, "d")}
                    </span>
                    {hasAppointment && (
                      <div className={`mt-1 h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-green-600"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {selectedDateStr === todayStr
              ? "Consultas para Hoje"
              : `Consultas para ${isoParaDisplay(selectedDateStr)}`}
          </h2>
        </div>

        <div className="grid gap-6">
          {selectedAppointments.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-2 bg-gray-50/50">
              <div className="flex flex-col items-center">
                <Calendar className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Nenhum agendamento para este dia</h3>
                <p className="text-gray-500 mt-2">Clique em "Novo Agendamento" para agendar uma consulta.</p>
              </div>
            </Card>
          ) : (
            selectedAppointments.map(ag => {
              const nomeExibido = userType === "nutritionist"
                ? (ag.paciente || ag.pacienteNome || "Paciente não informado")
                : (ag.nutritionist || ag.nutricionistaNome || "Sem nutricionista");
              return (
                <Card key={ag.id} className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-14 h-14 border-2 border-green-100">
                          <AvatarFallback className="bg-green-50 text-green-700 font-bold text-lg">
                            {getInitials(nomeExibido)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{nomeExibido}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="bg-green-50 text-green-700 border-none">
                              {userType === "nutritionist" ? "Paciente" : "Nutricionista"}
                            </Badge>
                            <span className="text-sm text-gray-400">{isoParaDisplay(ag.date)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{ag.time}</span>
                        </div>
                        {ag.videoLink && (
                          <div className="flex items-center gap-3 text-gray-600">
                            <Video className="w-4 h-4 text-blue-600" />
                            <a href={ag.videoLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline flex items-center gap-1">
                              Link da Chamada <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                        {ag.observations && (
                          <p className="text-sm text-gray-500 italic">"{ag.observations}"</p>
                        )}
                      </div>
                      <div className="flex flex-row md:flex-col gap-2">
                        <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50" onClick={() => handleOpenDialog(ag)}>
                          <Edit2 className="w-4 h-4 mr-2" /> Editar
                        </Button>
                        <Button variant="outline" size="sm" className="border-red-100 text-red-600 hover:bg-red-50"
                          onClick={() => { removerAgendamento(ag.id); toast.success("Agendamento removido."); }}>
                          <Trash2 className="w-4 h-4 mr-2" /> Excluir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
              <DialogDescription>{editingId ? "Faça as alterações necessárias." : "Preencha os dados do agendamento."}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {userType === "patient" ? (
                <div className="space-y-2">
                  <Label>Nutricionista (opcional)</Label>
                  <Input
                    placeholder="Nome do nutricionista"
                    value={formData.nutritionist}
                    onChange={e => set("nutritionist", e.target.value)}
                    list="nutri-list"
                  />
                  <datalist id="nutri-list">
                    {nomesNutricionistas.map(n => <option key={n} value={n} />)}
                  </datalist>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Paciente</Label>
                  <Input
                    placeholder="Nome do paciente"
                    value={formData.paciente}
                    onChange={e => set("paciente", e.target.value)}
                    list="pac-list"
                  />
                  <datalist id="pac-list">
                    {nomesPacientes.map(n => <option key={n} value={n} />)}
                  </datalist>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" value={formData.date} onChange={e => set("date", e.target.value)} />
                  {formData.date && <p className="text-xs text-gray-400">{isoParaDisplay(formData.date)}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Input type="time" value={formData.time} onChange={e => set("time", e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Link para videochamada</Label>
                <Input placeholder="https://meet.google.com/..." value={formData.videoLink} onChange={e => set("videoLink", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea placeholder="Ex: Trazer exames recentes..." value={formData.observations} onChange={e => set("observations", e.target.value)} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                {editingId ? "Salvar Alterações" : "Criar Agendamento"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
