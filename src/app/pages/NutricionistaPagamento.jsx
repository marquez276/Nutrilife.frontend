import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Check, CreditCard, QrCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";

export default function NutricionistaPagamento() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("annual");
  const [paymentMethod, setPaymentMethod] = useState("credit");

  const plans = [
    { id: "monthly", name: "Plano Mensal", price: "R$ 100", description: "Pagamento mês a mês" },
    { id: "annual", name: "Plano Anual", price: "R$ 1.080", discount: "10% de desconto", description: "Pagamento único anual" },
    { id: "installments", name: "Plano Parcelado", price: "R$ 90", sub: "x 12 meses", description: "Compromisso de 1 ano" },
  ];

  const handlePayment = () => {
    toast.success("Pagamento processado com sucesso!");
    navigate("/nutricionista-portal");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Seja um Profissional NutriLife</h1>
          <p className="text-gray-600">Escolha o plano que melhor se adapta à sua clínica</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`cursor-pointer transition-all border-2 ${selectedPlan === plan.id ? 'border-green-600 ring-4 ring-green-50' : 'border-transparent'}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-1">{plan.price}</div>
                {plan.sub && <div className="text-sm text-gray-500">{plan.sub}</div>}
                {plan.discount && <div className="text-xs font-bold text-green-600 uppercase mt-1">{plan.discount}</div>}
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center gap-2 text-sm text-gray-600"><Check className="w-4 h-4 text-green-600" /> Gestão de pacientes</li>
                  <li className="flex items-center gap-2 text-sm text-gray-600"><Check className="w-4 h-4 text-green-600" /> Agenda compartilhada</li>
                  <li className="flex items-center gap-2 text-sm text-gray-600"><Check className="w-4 h-4 text-green-600" /> Perfil profissional</li>
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="max-w-xl mx-auto border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Método de Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup defaultValue="credit" onValueChange={setPaymentMethod}>
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="credit" id="credit" />
                  <Label htmlFor="credit" className="font-bold flex items-center gap-2 cursor-pointer">
                    <CreditCard className="w-4 h-4" /> Cartão de Crédito / Débito
                  </Label>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="pix" id="pix" />
                  <Label htmlFor="pix" className="font-bold flex items-center gap-2 cursor-pointer">
                    <QrCode className="w-4 h-4" /> PIX
                  </Label>
                </div>
              </div>
            </RadioGroup>

            {paymentMethod === "credit" && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Número do Cartão</Label>
                  <Input placeholder="0000 0000 0000 0000" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Validade</Label>
                    <Input placeholder="MM/AA" />
                  </div>
                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <Input placeholder="123" />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "pix" && (
              <div className="text-center py-4 bg-gray-50 rounded-xl space-y-3">
                <QrCode className="w-32 h-32 mx-auto text-gray-900" />
                <p className="text-sm text-gray-600">O código PIX será gerado após clicar em pagar.</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg" onClick={handlePayment}>
              Confirmar e Assinar Agora
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
