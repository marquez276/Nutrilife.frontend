import { Layout } from "../components/Layout";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Search, 
  Filter,
  Plus,
  Minus,
  X
} from "lucide-react";
import { useState } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Slider } from "../components/ui/slider";

export default function Loja() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const products: Product[] = [
    {
      id: 1,
      name: "Whey Protein Concentrado",
      category: "Proteínas",
      price: 89.90,
      oldPrice: 119.90,
      image: "https://images.unsplash.com/photo-1693996045899-7cf0ac0229c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGV5JTIwcHJvdGVpbiUyMGNvbnRhaW5lciUyMHN1cHBsZW1lbnR8ZW58MXx8fHwxNzczNjk5NDgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
      rating: 4.8,
      reviews: 324,
      description: "Whey protein de alta qualidade com 24g de proteína por dose. Ideal para ganho de massa muscular.",
      stock: 45,
      brand: "ProFit",
    },
      id: 2,
      name: "Creatina Monohidratada 300g",
      category: "Suplementos",
      price: 59.90,
      oldPrice: 79.90,
      image: "https://images.unsplash.com/photo-1763757933292-d8290692edde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGluZSUyMHBvd2RlciUyMGNvbnRhaW5lcnxlbnwxfHx8fDE3NzM2OTk0ODB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      rating: 4.9,
      reviews: 567,
      description: "Creatina pura para aumento de força e performance nos treinos. 100% monohidratada.",
      stock: 78,
      brand: "MaxPower",
      id: 3,
      name: "Barra de Proteína Chocolate",
      category: "Lanches",
      price: 6.90,
      oldPrice: 9.90,
      image: "https://images.unsplash.com/photo-1646168932800-e48f378d37bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBwcm90ZWluJTIwYmFyJTIwcGFja2FnaW5nfGVufDF8fHx8MTc3MzY5OTQ4MXww&ixlib=rb-4.1.0&q=80&w=1080",
      rating: 4.6,
      reviews: 189,
      description: "Barra proteica deliciosa com 20g de proteína. Perfeita para lanches práticos.",
      stock: 156,
      brand: "FitBar",
      id: 4,
      name: "YoPRO Iogurte Proteico",
      price: 4.50,
      image: "https://images.unsplash.com/photo-1691043795570-9478750e7fd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlayUyMHlvZ3VydCUyMGN1cCUyMHByb3RlaW58ZW58MXx8fHwxNzczNjk5NDgxfDA&ixlib=rb-4.1.0&q=80&w=1080",
      rating: 4.7,
      reviews: 423,
      description: "Iogurte grego com alta proteína, zero lactose e baixo carboidrato. Sabor morango.",
      stock: 234,
      brand: "YoPRO",
      id: 5,
      name: "Hipercalórico Mass Gainer",
      price: 119.90,
      oldPrice: 159.90,
      image: "https://images.unsplash.com/photo-1729708273852-b63222c8b35d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXNzJTIwZ2FpbmVyJTIwc3VwcGxlbWVudCUyMGNvbnRhaW5lcnxlbnwxfHx8fDE3NzM2OTk0ODF8MA&ixlib=rb-4.1.0&q=80&w=1080",
      rating: 4.5,
      reviews: 267,
      description: "Suplemento hipercalórico para ganho de massa. 1200 calorias por dose.",
      stock: 32,
      brand: "MegaMass",
      id: 6,
      name: "Mix de Castanhas Premium",
      price: 24.90,
      oldPrice: 32.90,
      image: "https://images.unsplash.com/photo-1671981200629-014c03829abb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaXhlZCUyMG51dHMlMjBib3dsJTIwaGVhbHRoeXxlbnwxfHx8fDE3NzM2OTk0ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      reviews: 512,
      description: "Mix selecionado de castanhas, amêndoas e nozes. Rico em gorduras boas.",
      stock: 89,
      brand: "NutriSnack",
      id: 7,
      name: "BCAA 2:1:1 - 120 cápsulas",
      price: 49.90,
      oldPrice: 69.90,
      image: "https://images.unsplash.com/photo-1763668331599-487470fb85b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXBwbGVtZW50JTIwY2Fwc3VsZXMlMjBib3R0bGV8ZW58MXx8fHwxNzczNjk5NDgyfDA&ixlib=rb-4.1.0&q=80&w=1080",
      reviews: 298,
      description: "Aminoácidos essenciais para recuperação muscular e redução de fadiga.",
      stock: 67,
      brand: "AminoMax",
      id: 8,
      name: "Sanduíche Natural de Frango",
      price: 12.90,
      image: "https://images.unsplash.com/photo-1666819615040-eff5e52c778a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwc2FuZHdpY2glMjBoZWFsdGh5JTIwd3JhcHxlbnwxfHx8fDE3NzM2OTk0ODN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      rating: 4.4,
      reviews: 145,
      description: "Sanduíche natural com frango desfiado, alface e tomate em pão integral.",
      stock: 24,
      brand: "FreshLife",
  ];
  const categories = ["all", ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesRating = product.rating >= minRating;
      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "reviews":
          return b.reviews - a.reviews;
        default:
          return 0;
      }
    });
  const toggleFavorite = (productId) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      return [...prev, { ...product, quantity: 1 }];
  const updateCartQuantity = (productId, delta) => {
    setCart(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      ).filter(item => item.quantity > 0)
  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const favoriteProducts = products.filter(p => favorites.includes(p.id));
  return (
    <Layout userType="patient">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Loja NutriLife</h1>
            <p className="text-gray-500">Suplementos e lanches saudáveis com os melhores preços</p>
          </div>
          <div className="flex gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative">
                  <Heart className="w-5 h-5 mr-2" />
                  Favoritos
                  {favorites.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                      {favorites.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Produtos Favoritos</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {favoriteProducts.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Nenhum favorito ainda</p>
                  ) : (
                    favoriteProducts.map(product => (
                      <Card key={product.id}>
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{product.name}</h4>
                              <p className="text-lg font-bold text-green-600">
                                R$ {product.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                </div>
              </SheetContent>
            </Sheet>
                <Button className="bg-green-600 hover:bg-green-700 relative">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Carrinho
                  {cartItemsCount > 0 && (
                      {cartItemsCount}
                  <SheetTitle>Carrinho de Compras</SheetTitle>
                <div className="mt-6 space-y-4 flex-1 overflow-y-auto">
                  {cart.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Carrinho vazio</p>
                    <>
                      {cart.map(item => (
                        <Card key={item.id}>
                          <CardContent className="p-4">
                            <div className="flex gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-sm">{item.name}</h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFromCart(item.id)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                                <p className="text-lg font-bold text-green-600 mb-2">
                                  R$ {(item.price * item.quantity).toFixed(2)}
                                </p>
                                <div className="flex items-center gap-2">
                                    variant="outline"
                                    onClick={() => updateCartQuantity(item.id, -1)}
                                    <Minus className="w-3 h-3" />
                                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                                    onClick={() => updateCartQuantity(item.id, 1)}
                                    <Plus className="w-3 h-3" />
                              </div>
                          </CardContent>
                        </Card>
                      ))}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-lg font-semibold">Total:</span>
                          <span className="text-2xl font-bold text-green-600">
                            R$ {cartTotal.toFixed(2)}
                          </span>
                        </div>
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          Finalizar Compra
                        </Button>
                      </div>
                    </>
        </div>
        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Destaques</SelectItem>
                  <SelectItem value="price-asc">Menor Preço</SelectItem>
                  <SelectItem value="price-desc">Maior Preço</SelectItem>
                  <SelectItem value="rating">Mais Avaliados</SelectItem>
                  <SelectItem value="reviews">Mais Comentados</SelectItem>
                </SelectContent>
              </Select>
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent className="px-6">
                  <SheetHeader className="mb-8">
                    <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-8 px-2">
                    {/* Price Range Filter */}
                    <div>
                      <Label className="text-base font-semibold mb-4 block">
                        Faixa de Preço
                      </Label>
                      <div className="space-y-4 px-2">
                        <Slider
                          value={priceRange}
                          onValueChange={(value) => setPriceRange(value}
                          min={0}
                          max={200}
                          step={5}
                          className="mb-2"
                        />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            R$ {priceRange[0].toFixed(2)}
                            R$ {priceRange[1].toFixed(2)}
                    </div>
                    {/* Rating Filter */}
                        Avaliação Mínima
                      <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setMinRating(rating === minRating ? 0 : rating)}
                            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
                              minRating === rating
                                ? "bg-green-50 border-2 border-green-600"
                                : "hover:bg-gray-50 border-2 border-transparent"
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            <span className="text-sm text-gray-600">
                              {rating === 5 ? "e acima" : `${rating}+ estrelas`}
                            </span>
                          </button>
                        ))}
                    {/* Reset Filters */}
                    <Button
                      variant="outline"
                      className="w-full mt-8"
                      onClick={() => {
                        setPriceRange([0, 200]);
                        setMinRating(0);
                        setSortBy("featured");
                      }}
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </CardContent>
        </Card>
        {/* Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="Proteínas">Proteínas</TabsTrigger>
            <TabsTrigger value="Suplementos">Suplementos</TabsTrigger>
            <TabsTrigger value="Lanches">Lanches Saudáveis</TabsTrigger>
          </TabsList>
        </Tabs>
        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const isFavorite = favorites.includes(product.id);
            const discount = product.oldPrice
              ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
              : 0;
            return (
              <Card key={product.id} className="group hover:shadow-xl transition-shadow">
                <CardContent className="p-0">
                  <div className="relative">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {discount > 0 && (
                      <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                        -{discount}%
                      </Badge>
                    )}
                      size="sm"
                      variant="ghost"
                      className={`absolute top-3 right-3 ${isFavorite ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 bg-white`}
                      onClick={() => toggleFavorite(product.id)}
                      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                    <Badge className="absolute bottom-3 left-3 bg-white text-gray-900">
                      {product.stock} em estoque
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                      <span className="text-xs text-gray-500 ml-1">
                        ({product.reviews})
                      </span>
                    <div className="mb-4">
                      {product.oldPrice && (
                        <p className="text-sm text-gray-400 line-through">
                          R$ {product.oldPrice.toFixed(2)}
                        </p>
                      )}
                      <p className="text-2xl font-bold text-green-600">
                        R$ {product.price.toFixed(2)}
                      </p>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => addToCart(product)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                        variant="outline"
                        onClick={() => setSelectedProduct(product)}
                        Detalhes
                </CardContent>
              </Card>
            );
          })}
        {/* Product Details Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <CardContent className="p-6">
                <div className="flex justify-end mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedProduct(null)}
                  >
                    <X className="w-5 h-5" />
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full rounded-lg"
                    <Badge className="mb-3">{selectedProduct.category}</Badge>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {selectedProduct.name}
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">{selectedProduct.brand}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(selectedProduct.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                          />
                      <span className="text-sm text-gray-600">
                        {selectedProduct.rating} ({selectedProduct.reviews} avaliações)
                    <div className="mb-6">
                      {selectedProduct.oldPrice && (
                        <p className="text-lg text-gray-400 line-through">
                          R$ {selectedProduct.oldPrice.toFixed(2)}
                      <p className="text-4xl font-bold text-green-600">
                        R$ {selectedProduct.price.toFixed(2)}
                    <p className="text-gray-700 mb-6">{selectedProduct.description}</p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Disponível:</span> {selectedProduct.stock} unidades
                      className="w-full bg-green-600 hover:bg-green-700 mb-3"
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Adicionar ao Carrinho
                      className="w-full"
                      onClick={() => toggleFavorite(selectedProduct.id)}
                      <Heart className={`w-5 h-5 mr-2 ${favorites.includes(selectedProduct.id) ? 'fill-current text-red-500' : ''}`} />
                      {favorites.includes(selectedProduct.id) ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
              </CardContent>
            </Card>
        )}
      </div>
    </Layout>
  );
}
