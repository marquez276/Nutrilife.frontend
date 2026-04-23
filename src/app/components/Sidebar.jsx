import { Link, useLocation, useNavigate } from "react-router";
import { Home, UtensilsCrossed, Scale, TrendingUp, Database, Calendar, User, LogOut, ShieldCheck, Stethoscope } from "lucide-react";
import { cn } from "./ui/utils";
import { useApp } from "../context/AppContext";

export function Sidebar({ userType }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useApp();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const patientLinks = [
    { to: "/dashboard", icon: Home, label: "Minha Jornada" },
    { to: "/plano-alimentar", icon: UtensilsCrossed, label: "Plano Alimentar" },
    { to: "/calorias", icon: Scale, label: "Controle de Calorias" },
    { to: "/evolucao", icon: TrendingUp, label: "Evolução de Peso" },
    { to: "/alimentos", icon: Database, label: "Banco de Alimentos" },
    { to: "/nutricionistas", icon: Stethoscope, label: "Nutricionistas" },
    { to: "/agenda", icon: Calendar, label: "Minha Agenda" },
    { to: "/perfil", icon: User, label: "Meu Perfil" },
  ];

  const nutritionistLinks = [
    { to: "/nutricionista-portal", icon: Home, label: "Painel Profissional" },
    { to: "/agenda-nutricionista", icon: Calendar, label: "Agenda de Pacientes" },
    { to: "/perfil-nutricionista", icon: User, label: "Perfil Profissional" },
  ];

  const adminLinks = [
    { to: "/admin", icon: ShieldCheck, label: "Painel Admin" },
    { to: "/gerenciar-alimentos", icon: Database, label: "Gerenciar Alimentos" },
    { to: "/perfil-admin", icon: User, label: "Perfil Admin" },
  ];

  const links =
    userType === "admin" ? adminLinks :
    userType === "nutritionist" ? nutritionistLinks :
    patientLinks;

  return (
    <div className="flex flex-col h-screen w-64 bg-white border-r border-gray-200 sticky top-0">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-green-600">NutriLife</h1>
        <p className="text-sm text-gray-500">Alimentação Saudável</p>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-green-50 text-green-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors w-full">
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}
