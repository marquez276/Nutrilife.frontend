import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Clock, CheckCircle, XCircle, RefreshCw, LogOut } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useApp } from "../context/AppContext";

export default function AguardandoAprovacao() {
  const navigate = useNavigate();
  const { usuarioLogado, logout, atualizarUsuarioLogado } = useApp();
  const [status, setStatus] = useState("PENDENTE"); // PENDENTE | APROVADO | REJEITADO | SEM_PAGAMENTO
  const [verificando, setVerificando] = useState(true);

  const verificarStatus = async () => {
    if (!usuarioLogado?.id) return;
    setVerificando(true);
    try {
      // Check payment status
      const pagRes = await fetch(`/pagamentos/pix/status/${usuarioLogado.id}`);
      if (pagRes.ok) {
        const data = await pagRes.json();
        setStatus(data.status);
        if (data.status === "APROVADO") {
          // Re-fetch user to get updated codStatus, then redirect
          atualizarUsuarioLogado({ codStatus: true });
          setTimeout(() => navigate("/nutricionista-portal"), 1500);
        }
      } else {
        // No payment submitted yet
        setStatus("SEM_PAGAMENTO");
      }
    } catch {
      setStatus("PENDENTE");
    } finally {
      setVerificando(false);
    }
  };

  useEffect(() => {
    verificarStatus();
    // Poll every 30 seconds while on this screen
    const interval = setInterval(verificarStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-green-600">NutriLife</h1>
        </div>

        <Card className="border-none shadow-xl">
          <CardContent className="p-10 text-center space-y-6">
            {status === "PENDENTE" && (
              <>
                <div className="flex justify-center">
                  <div className="p-5 bg-amber-50 rounded-full">
                    <Clock className="w-14 h-14 text-amber-500" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Pagamento em análise</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Seu comprovante foi recebido. Nossa equipe está verificando se o pagamento PIX foi realizado corretamente.
                  </p>
                  <p className="text-gray-500 text-sm mt-3">
                    Você receberá acesso assim que o pagamento for confirmado pelo administrador.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    onClick={verificarStatus}
                    disabled={verificando}
                    className="gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${verificando ? "animate-spin" : ""}`} />
                    {verificando ? "Verificando..." : "Verificar status"}
                  </Button>
                </div>
              </>
            )}

            {status === "APROVADO" && (
              <>
                <div className="flex justify-center">
                  <div className="p-5 bg-green-50 rounded-full">
                    <CheckCircle className="w-14 h-14 text-green-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Pagamento aprovado!</h2>
                  <p className="text-gray-600">Sua conta foi liberada. Redirecionando para o portal...</p>
                </div>
              </>
            )}

            {status === "REJEITADO" && (
              <>
                <div className="flex justify-center">
                  <div className="p-5 bg-red-50 rounded-full">
                    <XCircle className="w-14 h-14 text-red-500" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Pagamento não confirmado</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Não foi possível confirmar seu pagamento. Por favor, realize o PIX novamente e envie um novo comprovante.
                  </p>
                </div>
                <Button
                  className="bg-green-600 hover:bg-green-700 w-full"
                  onClick={() => navigate("/nutricionista-pagamento")}
                >
                  Enviar novo comprovante
                </Button>
              </>
            )}

            {status === "SEM_PAGAMENTO" && (
              <>
                <div className="flex justify-center">
                  <div className="p-5 bg-gray-100 rounded-full">
                    <Clock className="w-14 h-14 text-gray-400" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Pagamento pendente</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Para ativar sua conta, realize o pagamento via PIX e envie o comprovante.
                  </p>
                </div>
                <Button
                  className="bg-green-600 hover:bg-green-700 w-full"
                  onClick={() => navigate("/nutricionista-pagamento")}
                >
                  Ir para pagamento
                </Button>
              </>
            )}

            <div className="pt-4 border-t">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mx-auto transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sair da conta
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
