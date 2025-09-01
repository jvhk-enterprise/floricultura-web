import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { productService } from '@/services/productService';
import { Product } from '@/services/productService';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Heart, 
  ShoppingCart, 
  MessageCircle, 
  Sun, 
  CloudRain, 
  Home, 
  Skull,
  Plus,
  Minus 
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const productData = await productService.getById(id);
        setProduct(productData);
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
        toast({
          title: "Erro ao carregar produto",
          description: "Não foi possível carregar os detalhes do produto",
          variant: "destructive",
        });
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate, toast]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const getDiscountPrice = (price: number) => {
    return price * 0.9; // 10% de desconto
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_STOCK':
        return <Badge className="bg-success text-success-foreground">Disponível</Badge>;
      case 'LOW_STOCK':
        return <Badge className="bg-warning text-warning-foreground">Estoque Baixo</Badge>;
      case 'SOLD_OUT':
        return <Badge variant="secondary">Esgotado</Badge>;
      default:
        return <Badge variant="secondary">-</Badge>;
    }
  };

  const handleQuantityChange = (delta: number) => {
    if(quantity < product.amount){
      setQuantity(prev => Math.max(1, prev + delta));
    }    
  };

  const handleBuy = () => {
    toast({
      title: "Produto adicionado ao carrinho",
      description: `${quantity}x ${product?.popularName} adicionado(s) ao carrinho`,
    });
  };

  const handleContact = () => {
    const message = `Olá! Tenho interesse em ${quantity} unidades do produto: ${product?.popularName}.`;   
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <Layout currentPage="products">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando produto...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout currentPage="products">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Produto não encontrado</p>
          <Button 
            onClick={() => navigate('/products')} 
            className="mt-4"
            variant="outline"
          >
            Voltar aos produtos
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="products">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <button 
            onClick={() => navigate('/products')}
            className="hover:text-foreground transition-colors"
          >
            Produtos
          </button>
          <span>•</span>
          <span>{product.category}</span>
          <span>•</span>
          <span className="text-foreground">{product.popularName}</span>
        </div>

        {/* Botão Voltar */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/products')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        {/* Seção Principal do Produto */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Imagem do Produto */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src={product.imagePath}
                alt={product.imagePath}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>
          </div>

          {/* Informações do Produto */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  NOVIDADE
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">
                {product.popularName}
              </h1>
              
              {/* Avaliação e Status */}
              {/* <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground">0 de 5</span>
                  <div className="flex ml-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-muted-foreground">★</span>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground ml-2">(0)</span>
                </div>
              </div> */}

              {/* Condições ideais */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-amber-500" />
                  <span className="text-sm">Meia-sombra</span>
                </div>
                <div className="flex items-center gap-2">
                  <CloudRain className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">Moderada</span>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Interno ou Externo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Skull className="h-5 w-5 text-red-500" />
                  <span className="text-sm">Tóxica</span>
                </div>
              </div>
            </div>

            {/* Favorito */}
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
              className="w-fit"
            >
              <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              Adicionar favorito
            </Button> */}

            {/* Preços */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground line-through">
                {formatPrice(product.price)}
              </p>
              <p className="text-3xl font-bold text-foreground">
                {formatPrice(getDiscountPrice(product.price))}
              </p>
              <p className="text-sm text-success">à vista com desconto</p>
            </div>

            {/* Quantidade e Comprar */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Quantidade:</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="h-10 w-10 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(1)}
                      className="h-10 w-10 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleContact}
                  className="w-full h-12 text-base"
                  disabled={product.status === 'SOLD_OUT'}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Comprar
                </Button>
                
                {/* <Button 
                  onClick={handleContact}
                  variant="outline"
                  className="w-full h-12 text-base bg-success hover:bg-success/90 text-white border-success"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Fale com uma de nossos vendedores
                </Button> */}
              </div>
            </div>

            {/* Promoção */}
            {/* <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="text-sm text-center">
                  Compre R$50 para ganhar 50% de desconto no frete!
                </p>
              </CardContent>
            </Card> */}
          </div>
        </div>

        {/* Seção de Detalhes */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Descrição</TabsTrigger>
              <TabsTrigger value="characteristics">Características</TabsTrigger>
              <TabsTrigger value="payment">Formas de Pagamento</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  {product.popularName && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🌿</span>
                    <h3 className="text-xl font-semibold">
                      {product.popularName}
                    </h3>
                  </div>
                  )}
                  
                  {/* <p className="text-muted-foreground italic">
                    Uma coleção de tons naturais e calmantes para transformar seu espaço com elegância tropical.
                  </p> */}

                  <div className="space-y-4">
                    {product.description && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        Descrição do Produto
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                    )}

                    {/* <div>
                      <p className="text-sm text-muted-foreground">
                        Ao adquirir esse produto, você receberá <strong>uma variedade surpresa da linha Green Pastel</strong>, produzida no Brasil pela Estância Vitória. Todos os bulbos são entregues <strong>prontos para plantio</strong>, com <strong>alta taxa de brotação</strong> e padrão ornamental muito valorizado em projetos paisagísticos modernos.
                      </p>
                    </div> */}

                    {product.cultivationTips && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <span className="text-lg">💡</span>
                        Dica:
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {product.cultivationTips}  
                      </p>
                    </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="characteristics" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-xl">🌸</span>
                    Características Principais
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      {product.scientificName && (
                      <div className="flex items-start gap-2">
                        <span className="text-success">✅</span>
                        <div>
                          <strong>Nome científico:</strong> {product.scientificName}
                        </div>
                      </div>
                      )}
                      {product.popularName && (
                      <div className="flex items-start gap-2">
                        <span className="text-success">✅</span>
                        <div>
                          <strong>Nome popular:</strong>  {product.popularName}
                        </div>
                      </div>
                      )}
                      {product.origin && (
                      <div className="flex items-start gap-2">
                        <span className="text-success">✅</span>
                        <div>
                          <strong>Origem:</strong> {product.origin}
                        </div>
                      </div>
                      )}
                      {product.cycle && (
                      <div className="flex items-start gap-2">
                        <span className="text-success">✅</span>
                        <div>
                          <strong>Ciclo:</strong> {product.cycle}
                        </div>
                      </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {product.height && (
                      <div className="flex items-start gap-2">
                        <span className="text-success">✅</span>
                        <div>
                          <strong>Altura:</strong> {product.height}
                        </div>
                      </div>
                      )}
                      {product.idealEnvironment && (
                      <div className="flex items-start gap-2">
                        <span className="text-success">✅</span>
                        <div>
                          <strong>Ambiente ideal:</strong> {product.idealEnvironment}
                        </div>
                      </div>
                      )}
                      {product.idealEnvironment && (
                      <div className="flex items-start gap-2">
                        <span className="text-success">✅</span>
                        <div>
                          <strong>Dificuldade de cultivo:</strong> {product.cultivationDifficult}
                        </div>
                      </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payment" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Formas de Pagamento Aceitas</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">💳 Cartões de Crédito</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Visa</li>
                        <li>• Mastercard</li>
                        <li>• American Express</li>
                        <li>• Elo</li>
                        <li>• Hipercard</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">💰 Outras Formas</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• PIX (desconto de 10%)</li>
                        <li>• Boleto bancário</li>
                        <li>• Transferência bancária</li>
                        <li>• PayPal</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-success/10 rounded-lg">
                    <p className="text-sm text-success font-medium">
                      💡 Dica: Pagamentos via PIX recebem 10% de desconto automaticamente!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;