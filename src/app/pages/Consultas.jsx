import { Layout } from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calendar, Clock, Video, Plus, CheckCircle2 } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";

export default function Consultas() {
  const upcomingAppointments = [
    {
      id: 1,
      nutritionist: "Dra. Maria Santos",
      date: "15/03/2026",
      time: "14:00",
      type: "Consulta de Acompanhamento",
      status: "confirmed",
      mode: "online",
    },
    {
      id: 2,
      nutritionist: "Dr. Ricardo Lima",
      date: "22/03/2026",
      time: "10:00",
      type: "Revisão de Plano Alimentar",
      status: "confirmed",
      mode: "presencial",
    },
  ];

  const pastAppointments = [
    {
      id: 3,
      nutritionist: "Dra. Maria Santos",
      date: "08/03/2026",
      time: "09:00",
      type: "Consulta Inicial",
      notes: "Plano alimentar criado. Meta: perder 5kg em 3 meses.",
    },
    {
      id: 4,
      nutritionist: "Dra. Maria Santos",
      date: "01/03/2026",
      time: "15:00",
      type: "Avaliação Nutricional",
      notes: "Primeira avaliação realizada. Exames solicitados.",
    },
  ];

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <Layout userType="patient">
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Consultas</h1>
            <p className="text-gray-500">Gerencie seus agendamentos com nutricionista</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Agendar Consulta
          </Button>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Próximas Consultas</h2>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <Card key={appointment.id} className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                        {getInitials(appointment.nutritionist)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">{appointment.nutritionist}</h3>
                          <p className="text-sm text-gray-600">{appointment.type}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Confirmada
                          </Badge>
                          {appointment.mode === "online" ? (
                            <Badge className="bg-blue-100 text-blue-700">
                              <Video className="w-3 h-3 mr-1" />
                              Online
                            </Badge>
                          ) : (
                            <Badge className="bg-purple-100 text-purple-700">Presencial</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-6 mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm font-medium">{appointment.date}</span>
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">{appointment.time}</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        {appointment.mode === "online" && (
                          <Button className="bg-blue-600 hover:bg-blue-700">
                            <Video className="w-4 h-4 mr-2" />
                            Entrar na Videochamada
                          </Button>
                        )}
                        <Button variant="outline">Detalhes</Button>
                        <Button variant="outline" className="text-red-600 hover:text-red-700">Cancelar</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Histórico de Consultas</h2>
          <div className="space-y-4">
            {pastAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gray-100 text-gray-700 font-semibold">
                        {getInitials(appointment.nutritionist)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{appointment.nutritionist}</h3>
                          <p className="text-sm text-gray-600">{appointment.type}</p>
                        </div>
                        <Badge className="bg-gray-100 text-gray-700">Concluída</Badge>
                      </div>
                      <div className="flex items-center gap-6 mb-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{appointment.date}</span>
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{appointment.time}</span>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1">Anotações:</p>
                        <p className="text-sm text-gray-600">{appointment.notes}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="mt-8 bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Agende sua próxima consulta</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Mantenha seu acompanhamento em dia. Consultas regulares ajudam a alcançar seus objetivos mais rapidamente.
                </p>
                <Button className="bg-green-600 hover:bg-green-700">Ver Horários Disponíveis</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
