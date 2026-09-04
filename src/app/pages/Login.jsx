import { Link, useNavigate, useSearchParams } from "react-router";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState(searchParams.get("type") || "patient");

  const handleLogin = async (e) => {
    e.preventDefault();
    const resultado = await login(email, password, userType);
    if (!resultado.ok) {
      toast.error(resultado.erro);
      return;
    }
    toast.success("Bem-vindo!");
    if (userType === "admin") navigate("/admin");
    else if (userType === "nutritionist") navigate("/nutricionista-portal");
    else navigate(resultado.hasAnamnese ? "/dashboard" : "/anamnese");
  };

  // Ao trocar de aba, limpa os campos
  const handleTabChange = (val) => {
    setUserType(val);
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">NutriLife</h1>
          <p className="text-gray-600">Acesse sua conta para continuar sua jornada</p>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-gray-900">
              Entrar na Plataforma
            </CardTitle>
            {userType === "admin" && (
              <CardDescription className="text-center flex items-center justify-center gap-2 text-amber-600 font-medium">
                <ShieldAlert className="w-4 h-4" /> Restrito a funcionários autorizados
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <Tabs value={userType} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="patient">Paciente</TabsTrigger>
                <TabsTrigger value="nutritionist">Nutricionista</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {userType === "admin" ? "E-mail Corporativo" : "E-mail"}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={userType === "admin" ? "admin@nutrilife.com" : "seu@email.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded-xl border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    {userType !== "admin" && (
                      <Link to="#" className="text-xs text-green-600 hover:underline">Esqueceu a senha?</Link>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-xl border-gray-200"
                  />
                </div>

                {userType === "admin" && (
                  <p className="text-xs text-gray-400 text-center">
                    Credenciais: admin@nutrilife.com / 123456
                  </p>
                )}
                {userType === "nutritionist" && (
                  <p className="text-xs text-gray-400 text-center">
                    Ex: maria@nutrilife.com / 123456
                  </p>
                )}

                <Button
                  type="submit"
                  className={`w-full h-11 rounded-xl font-bold ${userType === "admin" ? "bg-gray-900 hover:bg-gray-800" : "bg-green-600 hover:bg-green-700"}`}
                >
                  {userType === "patient" && "Entrar como Paciente"}
                  {userType === "nutritionist" && "Entrar como Nutricionista"}
                  {userType === "admin" && "Validar Acesso Admin"}
                </Button>
              </form>
            </Tabs>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Ainda não tem conta?{" "}
                <Link to="/cadastro" className="text-green-600 hover:underline font-bold">Cadastre-se aqui</Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Link to="/" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
            ← Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
