import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Check, Upload, Copy, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useApp } from "../context/AppContext";

const PIX_CHAVE = "11974702387";
const PIX_NOME  = "NutriLife Plataforma";

const PLANS = [
  { id: "monthly",      name: "Plano Mensal",   price: 100,  label: "R$ 100,00",   description: "Pagamento mês a mês" },
  { id: "annual",       name: "Plano Anual",    price: 1080, label: "R$ 1.080,00", description: "10% de desconto · pagamento único", highlight: true },
  { id: "installments", name: "Plano 12x",      price: 90,   label: "R$ 90,00/mês", description: "Compromisso de 12 meses" },
];

export default function NutricionistaPagamento() {
  const navigate = useNavigate();
  const { usuarioLogado } = useApp();
  const [selectedPlan, setSelectedPlan] = useState("annual");
  const [copiedKey, setCopiedKey] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [comprovanteBase64, setComprovanteBase64] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const inputRef = useRef(null);

  const plan = PLANS.find(p => p.id === selectedPlan);

  const copiarChave = () => {
    navigator.clipboard.writeText(PIX_CHAVE).then(() => {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(file.type)) {
      toast.error("Formato inválido. Use JPG, JPEG ou PNG.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviewUrl(ev.target.result);
      setComprovanteBase64(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoverImagem = () => {
    setPreviewUrl(null);
    setComprovanteBase64(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleEnviarComprovante = async () => {
    if (!comprovanteBase64) { toast.error("Anexe o comprovante de pagamento."); return; }
    if (!usuarioLogado?.id) { toast.error("Sessão expirada. Faça login novamente."); return; }

    setEnviando(true);
    try {
      const res = await fetch("/pagamentos/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nutricionista: { id: usuarioLogado.id },
          comprovanteUrl: comprovanteBase64,
          observacao: plan.name,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Comprovante enviado! Aguarde a aprovação do administrador.");
      navigate("/aguardando-aprovacao");
    } catch {
      toast.error("Erro ao enviar comprovante. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Seja um Profissional NutriLife</h1>
          <p className="text-gray-600">Escolha o plano e realize o pagamento via PIX</p>
        </div>

        {/* Seleção de plano */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {PLANS.map(p => (
            <Card
              key={p.id}
              className={`cursor-pointer transition-all border-2 ${selectedPlan === p.id ? "border-green-600 ring-4 ring-green-50" : "border-transparent"}`}
              onClick={() => setSelectedPlan(p.id)}
            >
              <CardHeader>
                <CardTitle>{p.name}</CardTitle>
                <CardDescription>{p.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-4">{p.label}</div>
                <ul className="space-y-2">
                  {["Gestão de pacientes", "Agenda integrada", "Perfil profissional"].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-600 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagamento PIX */}
        <Card className="max-w-xl mx-auto border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              Pagamento via PIX
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Valor */}
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-3xl font-bold text-green-700">{plan.label}</p>
              <p className="text-sm text-gray-500 mt-1">{plan.name}</p>
            </div>

            {/* Chave PIX */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Chave PIX (Telefone)</p>
              <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                <span className="flex-1 text-sm text-gray-800 font-mono">{PIX_CHAVE}</span>
                <Button variant="ghost" size="sm" onClick={copiarChave} className="shrink-0">
                  {copiedKey ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-400">Favorecido: {PIX_NOME}</p>
            </div>

            {/* Upload de comprovante */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Upload className="w-4 h-4" /> Comprovante de Pagamento
              </p>

              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview do comprovante"
                    className="w-full max-h-64 object-contain rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={handleRemoverImagem}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Clique para anexar o comprovante</span>
                  <span className="text-xs text-gray-400 mt-1">JPG, JPEG ou PNG</span>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
              <p className="text-xs text-gray-400">
                Após realizar o PIX, anexe o comprovante. O acesso será liberado após aprovação do administrador.
              </p>
            </div>

            <Button
              className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg"
              onClick={handleEnviarComprovante}
              disabled={enviando}
            >
              {enviando ? "Enviando..." : "Enviar Comprovante"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
