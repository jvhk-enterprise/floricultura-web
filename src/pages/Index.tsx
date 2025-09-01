import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Product, productService } from '@/services/productService';
import { ShoppingCart, Star, Leaf, Heart, ArrowRight, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoImage from '@/assets/noBgBlack.png';

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0); // página atual   
      const navigate = useNavigate(); 

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const pageData = await productService.getReleaseProducts();
        const products = pageData;        
        setFeaturedProducts(products);
        setBestSellers(products);
        console.log("feat: ", featuredProducts);
        console.log("feat: ", bestSellers);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoading(false);
        console.log("feat: ", featuredProducts);
        console.log("feat: ", bestSellers);
      }
    };

    loadProducts();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 h-40">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center space-x-2">
              {/* <Leaf className="h-8 w-8 text-primary" /> */}
              <img src={logoImage} className="h-30 w-40 object-contain shrink-0"/>
              {/* <h1 className="text-2xl font-bold text-foreground">Flora Viveiro</h1> */}
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              {/* <Link to="/products" className="text-muted-foreground hover:text-foreground transition-colors">
              Catálogo
              </Link> */}
              <Link to="/products" className="text-muted-foreground hover:text-foreground transition-colors">
              Plantas
              </Link>
              {/* <Link to="/products" className="text-muted-foreground hover:text-foreground transition-colors">
              Cuidados
              </Link> */}
              {/* <Button variant="outline" size="sm">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Carrinho
              </Button> */}
            </nav>
          </div>
        </div>
   </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Leaf className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
                Viveiro PlantArt
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Transforme seu espaço com plantas selecionadas e cuidados especiais
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" asChild>
                <Link to="/products">
                  Explorar Catálogo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                Saiba Mais
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Lançamentos</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Descubra nossas plantas mais recentes, cuidadosamente selecionadas para trazer vida ao seu ambiente
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-6 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              featuredProducts.map((product) => (
                <Card key={product.uuid} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="relative overflow-hidden">
                    <img
                      src={product.imagePath}
                      alt={product.imagePath}
                      className="aspect-square mb-4 bg-muted rounded-lg overflow-hidden cursor-pointer relative"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
                      Novo
                    </Badge>
                    <button className="absolute top-2 left-2 p-2 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{product.popularName}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-current text-warning" />
                        <span className="text-sm text-muted-foreground ml-1">4.8</span>
                      </div>
                    </div>
                    <Button className="w-full mt-3" size="sm" asChild>
                      <Link to={`/products/${product.uuid}`}>Ver Detalhes</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Mais Vendidos</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              As plantas favoritas dos nossos clientes, com qualidade comprovada e cuidados especiais
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-6 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              bestSellers.map((product) => (
                <Card key={product.uuid} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="relative overflow-hidden">
                    <img
                      src={product.imagePath}
                      alt={product.popularName}
                      className="aspect-square mb-4 bg-muted rounded-lg overflow-hidden cursor-pointer relative"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <Badge className="absolute top-2 right-2 bg-warning text-warning-foreground">
                      Best Seller
                    </Badge>
                    <button className="absolute top-2 left-2 p-2 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{product.popularName}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-current text-warning" />
                        <span className="text-sm text-muted-foreground ml-1">4.9</span>
                      </div>
                    </div>
                    <Button className="w-full mt-3" size="sm" asChild>
                      <Link to={`/products/${product.uuid}`}>Ver Detalhes</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <CardTitle className="text-2xl">Cadastre-se na nossa Newsletter</CardTitle>
              <CardDescription>
                Receba dicas de cultivo e novidades diretamente no seu e-mail
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 max-w-md mx-auto">
                <div className="flex-1">
                  <Input placeholder="Seu melhor e-mail" type="email" />
                </div>
                <Button>
                  <Mail className="h-4 w-4 mr-2" />
                  Inscrever
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold text-foreground">Flora Viveiro</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Transformando espaços com plantas de qualidade e cuidados especiais desde 2020.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Institucional</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="#" className="hover:text-foreground transition-colors">Sobre nós</Link></li>
                <li><Link to="#" className="hover:text-foreground transition-colors">Nossa história</Link></li>
                <li><Link to="#" className="hover:text-foreground transition-colors">Sustentabilidade</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Atendimento</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="#" className="hover:text-foreground transition-colors">Central de ajuda</Link></li>
                <li><Link to="#" className="hover:text-foreground transition-colors">Política de privacidade</Link></li>
                <li><Link to="#" className="hover:text-foreground transition-colors">Termos de uso</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Contato</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>contato@viveiroplantart.com</li>
                <li>(11) 99999-9999</li>
                <li>Bambuí, MG</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Viveiro PlantArt. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;