import { createBrowserRouter, Navigate } from "react-router";
import React from "react";
import { useApp } from "./context/AppContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";
import PlanoAlimentar from "./pages/PlanoAlimentar";
import Calorias from "./pages/Calorias";
import Evolucao from "./pages/Evolucao";
import Alimentos from "./pages/Alimentos";
import Nutricionista from "./pages/Nutricionista";
import Agenda from "./pages/Agenda";
import AgendaNutricionista from "./pages/Agenda";
import Perfil from "./pages/Perfil";
import NutricionistasLista from "./pages/NutricionistasLista";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPerfil from "./pages/AdminPerfil";
import NutricionistaPerfil from "./pages/NutricionistaPerfil";
import GerenciarAlimentos from "./pages/GerenciarAlimentos";
import CadastroFuncionario from "./pages/CadastroFuncionario";
import FichaAnamnese from "./pages/FichaAnamnese";
import Consultas from "./pages/Consultas";
import Loja from "./pages/Loja";

const HOME = { patient: "/dashboard", nutritionist: "/nutricionista-portal", admin: "/admin" };

// Rota protegida: exige sessão e, quando informado, o tipo de usuário. A autorização real é do backend.
function Guard({ tipo, children }) {
  const { usuarioLogado } = useApp();
  if (!usuarioLogado) return <Navigate to="/login" replace />;
  if (tipo && usuarioLogado.tipo !== tipo) return <Navigate to={HOME[usuarioLogado.tipo] || "/"} replace />;
  return children;
}

const protegida = (path, element, tipo) => ({ path, element: <Guard tipo={tipo}>{element}</Guard> });

export const router = createBrowserRouter([
  { path: "/", Component: Landing },
  { path: "/login", Component: Login },
  { path: "/cadastro", Component: Cadastro },

  // paciente
  protegida("/anamnese", <FichaAnamnese />, "patient"),
  protegida("/dashboard", <Dashboard />, "patient"),
  protegida("/plano-alimentar", <PlanoAlimentar />, "patient"),
  protegida("/calorias", <Calorias />, "patient"),
  protegida("/evolucao", <Evolucao />, "patient"),
  protegida("/alimentos", <Alimentos />, "patient"),
  protegida("/nutricionistas", <NutricionistasLista />, "patient"),
  protegida("/agenda", <Agenda />, "patient"),
  protegida("/perfil", <Perfil />, "patient"),
  protegida("/consultas", <Consultas />, "patient"),
  protegida("/loja", <Loja />, "patient"),

  // nutricionista
  protegida("/nutricionista-portal", <Nutricionista />, "nutritionist"),
  protegida("/agenda-nutricionista", <AgendaNutricionista userType="nutritionist" />, "nutritionist"),
  protegida("/perfil-nutricionista", <NutricionistaPerfil />, "nutritionist"),

  // administrador
  protegida("/admin", <AdminDashboard />, "admin"),
  protegida("/gerenciar-alimentos", <GerenciarAlimentos />, "admin"),
  protegida("/cadastro-funcionario", <CadastroFuncionario />, "admin"),
  protegida("/perfil-admin", <AdminPerfil />, "admin"),
]);
