import { Layout } from "../components/Layout";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Plus, Edit2, Trash2, Database } from "lucide-react";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Label } from "../components/ui/label";

const EMPTY = { nome: "", calorias: "", proteina: "", carboidrato: "", gordura: "" };

export default function GerenciarAlimentos() {
  const [foods, setFoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = novo, objeto = edição
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    fetch("/admin/alimentos")
      .then(r => r.json())
      .then(data => setFoods(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Erro ao carregar alimentos."));
  }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (f) => { setEditing(f); setForm({ nome: f.nome, calorias: f.calorias, proteina: f.proteina, carboidrato: f.carboidrato, gordura: f.gordura }); setDialogOpen(true); };

  const handleSave = () => {
    const body = {
      nome: form.nome,
      calorias: parseFloat(form.calorias) || 0,
      proteina: parseFloat(form.proteina) || 0,
      carboidrato: parseFloat(form.carboidrato) || 0,
      gordura: parseFloat(form.gordura) || 0,
    };
    const url = editing ? `/admin/alimentos/${editing.id}` : "/admin/alimentos";
    const method = editing ? "PUT" : "POST";
    fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(saved => {
        setFoods(prev => editing ? prev.map(f => f.id === saved.id ? saved : f) : [...prev, saved]);
        toast.success(editing ? "Alimento atualizado!" : "Alimento adicionado!");
        setDialogOpen(false);
      })
      .catch(() => toast.error("Erro ao salvar alimento."));
  };

  const handleDelete = (id) => {
    fetch(`/admin/alimentos/${id}`, { method: "DELETE" })
      .then(r => r.ok ? null : Promise.reject())
      .then(() => { setFoods(prev => prev.filter(f => f.id !== id)); toast.error("Alimento removido."); })
      .catch(() => toast.error("Erro ao remover alimento."));
  };

  const filtered = foods.filter(f => f.nome?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <Layout userType="admin">
      <div className="p-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Banco de Alimentos</h1>
            <p className="text-gray-500">Controle total sobre a base nutricional do sistema</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700" onClick={openNew}>
            <Plus className="w-4 h-4 mr-2" /> Adicionar Novo Item
          </Button>
        </div>

        <Card className="mb-8 border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50 border-b">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar na base de dados..." className="pl-10 h-11 bg-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <p className="text-center text-gray-400 py-10">{foods.length === 0 ? "Nenhum alimento cadastrado." : "Nenhum resultado encontrado."}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alimento</TableHead>
                    <TableHead>Calorias</TableHead>
                    <TableHead>Prot / Carb / Gord</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(f => (
                    <TableRow key={f.id}>
                      <TableCell className="font-bold text-gray-900">{f.nome}</TableCell>
                      <TableCell className="font-bold">{f.calorias} kcal</TableCell>
                      <TableCell className="text-gray-500">{f.proteina}g / {f.carboidrato}g / {f.gordura}g</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => openEdit(f)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(f.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="border-none shadow-sm bg-blue-600 text-white rounded-xl">
            <div className="p-6 flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase opacity-80">Itens Totais</p>
                <h3 className="text-2xl font-bold">{foods.length}</h3>
              </div>
            </div>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Alimento" : "Novo Alimento"}</DialogTitle>
              <DialogDescription>{editing ? "Atualize os dados do alimento." : "Adicione um novo alimento à base de dados."}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {[
                { id: "nome", label: "Nome", type: "text" },
                { id: "calorias", label: "Calorias (kcal)", type: "number" },
                { id: "proteina", label: "Proteína (g)", type: "number" },
                { id: "carboidrato", label: "Carboidrato (g)", type: "number" },
                { id: "gordura", label: "Gordura (g)", type: "number" },
              ].map(({ id, label, type }) => (
                <div key={id} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={id} className="text-right">{label}</Label>
                  <Input id={id} type={type} className="col-span-3" value={form[id]} onChange={e => setForm(p => ({ ...p, [id]: e.target.value }))} />
                </div>
              ))}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
