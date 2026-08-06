import { Layout } from "../components/Layout";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calendar, Clock, Video, Plus, CheckCircle2 } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router";

function isoParaDisplay(iso) {
  if (!iso) return "";
  const d = String(iso).split("T")[0];
  const [y, m, dia] = d.split("-");
  return `${dia}/${m}/${y}`;
}

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
}

export default function Consultas() {
  const { agendamentos } = useApp();
  const navigate = useNavigate();

  const hoje = new Date().toISOString().split("T")[0];
  const upcoming = agendamentos.filter(a => (a.date || "").split("T")[0] >= hoje);
  const past = agendamentos.filter(a => (a.date || "").split("T")[0] < hoje);

  return (
    <Layout userType="patient">
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Consultas</h1>
            <p className="text-gray-500">Gerencie seus agendamentos com nutricionista</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => navigate("/agenda")}>
            <Plus className="w-4 h-4 mr-2" />
            Agendar Consulta
          </Button>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Próximas Consultas</h2>
          {upcoming.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhuma consulta agendada.</p>
          ) : (
            <div className="space-y-4">
              {upcoming.map((ag) => (
                <Card key={ag.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                          {getInitials(ag.nutritionist || ag.nutricionistaNome)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg mb-1">
                              {ag.nutritionist || ag.nutricionistaNome || "Nutricionista"}
                            </h3>
                            <p className="text-sm text-gray-600">{ag.observations || "Consulta"}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Confirmada
                            </Badge>
                            {ag.videoLink && (
                              <Badge className="bg-blue-100 text-blue-700">
                                <Video className="w-3 h-3 mr-1" />
                                Online
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">{isoParaDisplay(ag.date)}</span>
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">{ag.time}</span>
                          </div>
                        </div>
                        {ag.videoLink && (
                          <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                            <a href={ag.videoLink} target="_blank" rel="noopener noreferrer">
                              <Video className="w-4 h-4 mr-2" /> Entrar na Videochamada
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Histórico de Consultas</h2>
          {past.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhuma consulta anterior.</p>
          ) : (
            <div className="space-y-4">
              {past.map((ag) => (
                <Card key={ag.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gray-100 text-gray-700 font-semibold">
                          {getInitials(ag.nutritionist || ag.nutricionistaNome)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {ag.nutritionist || ag.nutricionistaNome || "Nutricionista"}
                            </h3>
                          </div>
                          <Badge className="bg-gray-100 text-gray-700">Concluída</Badge>
                        </div>
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{isoParaDisplay(ag.date)}</span>
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{ag.time}</span>
                          </div>
                        </div>
                        {ag.observations && (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-1">Anotações:</p>
                            <p className="text-sm text-gray-600">{ag.observations}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Card className="mt-8 bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="p-3 bg-green-100 rounded-lg self-start">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Agende sua próxima consulta</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Mantenha seu acompanhamento em dia. Consultas regulares ajudam a alcançar seus objetivos mais rapidamente.
                </p>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => navigate("/agenda")}>
                  Ver Horários Disponíveis
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
