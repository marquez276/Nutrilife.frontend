import { createBrowserRouter } from "react-router";
import React from "react";
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
import FichaAnamnese from "./pages/FichaAnamnese";
import NutricionistaPagamento from "./pages/NutricionistaPagamento";
import AguardandoAprovacao from "./pages/AguardandoAprovacao";
import Consultas from "./pages/Consultas";
import Loja from "./pages/Loja";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/cadastro",
    Component: Cadastro,
  },
  {
    path: "/anamnese",
    Component: FichaAnamnese,
  },
  {
    path: "/nutricionista-pagamento",
    Component: NutricionistaPagamento,
  },
  {
    path: "/aguardando-aprovacao",
    Component: AguardandoAprovacao,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/plano-alimentar",
    Component: PlanoAlimentar,
  },
  {
    path: "/calorias",
    Component: Calorias,
  },
  {
    path: "/evolucao",
    Component: Evolucao,
  },
  {
    path: "/alimentos",
    Component: Alimentos,
  },
  {
    path: "/gerenciar-alimentos",
    Component: GerenciarAlimentos,
  },
  {
    path: "/nutricionistas",
    Component: NutricionistasLista,
  },
  {
    path: "/nutricionista-portal",
    Component: Nutricionista,
  },
  {
    path: "/agenda",
    Component: Agenda,
  },
  {
    path: "/agenda-nutricionista",
    element: <AgendaNutricionista userType="nutritionist" />,
  },
  {
    path: "/perfil",
    Component: Perfil,
  },
  {
    path: "/perfil-admin",
    Component: AdminPerfil,
  },
  {
    path: "/perfil-nutricionista",
    Component: NutricionistaPerfil,
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
  {
    path: "/consultas",
    Component: Consultas,
  },
  {
    path: "/loja",
    Component: Loja,
  },
]);
