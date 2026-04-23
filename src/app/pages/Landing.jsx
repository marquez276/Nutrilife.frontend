import { Link } from "react-router";
import { Check, Apple, TrendingUp, Users } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Landing() {
  const benefits = [
    "Acompanhamento personalizado de calorias",
    "Planos alimentares criados por nutricionistas",
    "Gráficos de evolução de peso",
    "Banco completo de alimentos",
    "Agendamento de consultas online",
  ];

  const features = [
    { icon: Apple, title: "Alimentação Balanceada", description: "Planos alimentares personalizados para seus objetivos" },
    { icon: TrendingUp, title: "Acompanhamento Contínuo", description: "Monitore seu progresso com gráficos detalhados" },
    { icon: Users, title: "Suporte Profissional", description: "Nutricionistas qualificados ao seu lado" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-green-600">NutriLife</h1>
            <p className="text-sm text-gray-500">Alimentação Saudável</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login?type=admin" className="text-sm font-medium text-gray-500 hover:text-green-600 mr-2">
              Área Admin
            </Link>
            <Link to="/login">
              <Button variant="outline">Entrar</Button>
            </Link>
            <Link to="/cadastro">
              <Button className="bg-green-600 hover:bg-green-700">Cadastrar</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Transforme sua relação com a{" "}
              <span className="text-green-600">alimentação</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Acompanhe suas refeições, atinja suas metas e conquiste uma vida mais saudável com o apoio de nutricionistas especializados.
            </p>
            <div className="flex gap-4 mb-8">
              <Link to="/cadastro">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">Começar Agora</Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">Já tenho conta</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800"
                alt="Alimentação saudável"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Por que escolher o NutriLife?</h3>
            <p className="text-xl text-gray-600">Tudo que você precisa para uma alimentação equilibrada</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h4>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600" alt="Vegetais frescos" className="w-full h-80 object-cover" />
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600" alt="Estilo de vida saudável" className="w-full h-80 object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-green-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">Pronto para começar sua jornada?</h3>
          <p className="text-xl text-green-50 mb-8">Junte-se a milhares de pessoas que já transformaram suas vidas</p>
          <Link to="/cadastro">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">Criar Conta Gratuita</Button>
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h4 className="text-2xl font-bold text-white mb-2">NutriLife</h4>
          <p className="text-sm">© 2026 NutriLife. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
