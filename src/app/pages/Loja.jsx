import { Layout } from "../components/Layout";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { ShoppingCart, Heart, Star, Search, Plus, Minus, X, Filter } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

const PRODUCTS = [
  { id: 1, name: "Whey Protein Concentrado",   category: "Proteínas",  brand: "ProFit",    price: 89.90,  oldPrice: 119.90, rating: 4.8, reviews: 324, stock: 45,  description: "Whey protein de alta qualidade com 24g de proteína por dose.", image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&q=80" },
  { id: 2, name: "Creatina Monohidratada 300g", category: "Suplementos", brand: "MaxPower", price: 59.90,  oldPrice: 79.90,  rating: 4.9, reviews: 567, stock: 78,  description: "Creatina pura para aumento de força e performance nos treinos.", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80" },
  { id: 3, name: "Barra de Proteína Chocolate", category: "Lanches",    brand: "FitBar",    price: 6.90,   oldPrice: 9.90,   rating: 4.6, reviews: 189, stock: 156, description: "Barra proteica com 20g de proteína. Perfeita para lanches práticos.", image: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&q=80" },
  { id: 4, name: "Iogurte Proteico",            category: "Lanches",    brand: "YoPRO",     price: 4.50,   oldPrice: null,   rating: 4.7, reviews: 423, stock: 234, description: "Iogurte grego com alta proteína e zero lactose.", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80" },
  { id: 5, name: "Hipercalórico Mass Gainer",   category: "Suplementos", brand: "MegaMass", price: 119.90, oldPrice: 159.90, rating: 4.5, reviews: 267, stock: 32,  description: "Suplemento hipercalórico para ganho de massa. 1200 calorias por dose.", image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80" },
  { id: 6, name: "Mix de Castanhas Premium",    category: "Lanches",    brand: "NutriSnack",price: 24.90,  oldPrice: 32.90,  rating: 4.8, reviews: 512, stock: 89,  description: "Mix selecionado de castanhas, amêndoas e nozes. Rico em gorduras boas.", image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80" },
  { id: 7, name: "BCAA 2:1:1 - 120 cápsulas",  category: "Suplementos", brand: "AminoMax", price: 49.90,  oldPrice: 69.90,  rating: 4.7, reviews: 298, stock: 67,  description: "Aminoácidos essenciais para recuperação muscular.", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" },
  { id: 8, name: "Sanduíche Natural de Frango", category: "Lanches",    brand: "FreshLife", price: 12.90,  oldPrice: null,   rating: 4.4, reviews: 145, stock: 24,  description: "Sanduíche natural com frango desfiado em pão integral.", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80" },
];

export default function Loja() {
  const [searchTerm, setSearchTerm]         = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy]                 = useState("featured");
  const [favorites, setFavorites]           = useState([]);
  const [cart, setCart]                     = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = ["all", ...Array.from(new Set(PRODUCTS.map(p => p.category)))];

  const filtered = PRODUCTS
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === "all" || p.category === selectedCategory;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc")  return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating")     return b.rating - a.rating;
      return 0;
    });

  const toggleFavorite = (id) =>
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const addToCart = (product) =>
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });

  const updateQty = (id, delta) =>
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const Stars = ({ rating, size = "w-4 h-4" }) => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`${size} ${i <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
      ))}
    </div>
  );

  return (
    <Layout userType="patient">
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Loja NutriLife</h1>
            <p className="text-gray-500">Suplementos e lanches saudáveis</p>
          </div>
          <div className="flex gap-3">
            {/* Favoritos */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative">
                  <Heart className="w-5 h-5 mr-2" /> Favoritos
                  {favorites.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center p-0 rounded-full">{favorites.length}</Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader><SheetTitle>Favoritos</SheetTitle></SheetHeader>
                <div className="mt-6 space-y-3">
                  {PRODUCTS.filter(p => favorites.includes(p.id)).length === 0
                    ? <p className="text-center text-gray-400 py-8">Nenhum favorito.</p>
                    : PRODUCTS.filter(p => favorites.includes(p.id)).map(p => (
                      <div key={p.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                        <img src={p.image} alt={p.name} className="w-14 h-14 object-cover rounded-lg" />
                        <div>
                          <p className="font-medium text-sm">{p.name}</p>
                          <p className="text-green-600 font-bold">R$ {p.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </SheetContent>
            </Sheet>

            {/* Carrinho */}
            <Sheet>
              <SheetTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 relative">
                  <ShoppingCart className="w-5 h-5 mr-2" /> Carrinho
                  {cartCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center p-0 rounded-full">{cartCount}</Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="flex flex-col">
                <SheetHeader><SheetTitle>Carrinho</SheetTitle></SheetHeader>
                <div className="flex-1 overflow-y-auto mt-6 space-y-3">
                  {cart.length === 0
                    ? <p className="text-center text-gray-400 py-8">Carrinho vazio.</p>
                    : cart.map(item => (
                      <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium text-sm">{item.name}</p>
                            <button onClick={() => removeFromCart(item.id)}><X className="w-4 h-4 text-gray-400 hover:text-red-500" /></button>
                          </div>
                          <p className="text-green-600 font-bold">R$ {(item.price * item.qty).toFixed(2)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <button className="p-1 border rounded" onClick={() => updateQty(item.id, -1)}><Minus className="w-3 h-3" /></button>
                            <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                            <button className="p-1 border rounded" onClick={() => updateQty(item.id, 1)}><Plus className="w-3 h-3" /></button>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
                {cart.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between mb-4">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold text-green-600">R$ {cartTotal.toFixed(2)}</span>
                    </div>
                    <Button className="w-full bg-green-600 hover:bg-green-700">Finalizar Compra</Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Search + sort */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input placeholder="Buscar produtos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-12" />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Destaques</SelectItem>
              <SelectItem value="price-asc">Menor Preço</SelectItem>
              <SelectItem value="price-desc">Maior Preço</SelectItem>
              <SelectItem value="rating">Mais Avaliados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
          <TabsList>
            {categories.map(c => (
              <TabsTrigger key={c} value={c}>{c === "all" ? "Todos" : c}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Grid */}
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-16">Nenhum produto encontrado.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map(product => {
              const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
              const isFav = favorites.includes(product.id);
              return (
                <Card key={product.id} className="group hover:shadow-xl transition-shadow overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                      {discount > 0 && <Badge className="absolute top-3 left-3 bg-red-500 text-white">-{discount}%</Badge>}
                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className={`absolute top-3 right-3 p-1.5 bg-white rounded-full shadow ${isFav ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
                      </button>
                      <Badge className="absolute bottom-3 left-3 bg-white text-gray-800 text-xs">{product.stock} em estoque</Badge>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-400 mb-1">{product.brand}</p>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">{product.name}</h3>
                      <div className="flex items-center gap-1 mb-3">
                        <Stars rating={product.rating} />
                        <span className="text-xs text-gray-400">({product.reviews})</span>
                      </div>
                      <div className="mb-4">
                        {product.oldPrice && <p className="text-xs text-gray-400 line-through">R$ {product.oldPrice.toFixed(2)}</p>}
                        <p className="text-xl font-bold text-green-600">R$ {product.price.toFixed(2)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1 bg-green-600 hover:bg-green-700 text-sm h-9" onClick={() => addToCart(product)}>
                          <ShoppingCart className="w-3 h-3 mr-1" /> Adicionar
                        </Button>
                        <Button variant="outline" className="text-sm h-9 px-3" onClick={() => setSelectedProduct(product)}>
                          Ver
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Product detail modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedProduct(null)}>
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <CardContent className="p-6">
                <div className="flex justify-end mb-2">
                  <button onClick={() => setSelectedProduct(null)}><X className="w-5 h-5 text-gray-500 hover:text-gray-900" /></button>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full rounded-xl object-cover" />
                  <div>
                    <Badge className="mb-2">{selectedProduct.category}</Badge>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedProduct.name}</h2>
                    <p className="text-sm text-gray-400 mb-3">{selectedProduct.brand}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <Stars rating={selectedProduct.rating} />
                      <span className="text-sm text-gray-500">{selectedProduct.rating} ({selectedProduct.reviews})</span>
                    </div>
                    <div className="mb-4">
                      {selectedProduct.oldPrice && <p className="text-gray-400 line-through text-sm">R$ {selectedProduct.oldPrice.toFixed(2)}</p>}
                      <p className="text-3xl font-bold text-green-600">R$ {selectedProduct.price.toFixed(2)}</p>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{selectedProduct.description}</p>
                    <p className="text-xs text-gray-400 mb-4">{selectedProduct.stock} unidades em estoque</p>
                    <Button className="w-full bg-green-600 hover:bg-green-700 mb-2" onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>
                      <ShoppingCart className="w-4 h-4 mr-2" /> Adicionar ao Carrinho
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => { toggleFavorite(selectedProduct.id); }}>
                      <Heart className={`w-4 h-4 mr-2 ${favorites.includes(selectedProduct.id) ? "fill-current text-red-500" : ""}`} />
                      {favorites.includes(selectedProduct.id) ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
