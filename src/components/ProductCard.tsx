import { Product } from '@/services/productService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onWhatsAppClick?: (product: Product, message: string) => void;
  whatsappNumber?: string;
  whatsappMessage?: string;
}

const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
  const navigate = useNavigate();
  const getStatusBadge = () => {
    switch (product.status) {
      case 'SOLD_OUT':
        return <Badge variant="destructive">Índisponível</Badge>;
      case 'IN_STOCK':
        return <Badge className="bg-success text-success-foreground">Em estoque</Badge>;
      case 'LOW_STOCK':
        return <Badge className="bg-warning text-warning-foreground">Últimas unidades</Badge>;
      default:
        return null;
    }
  };

  const handleWhatsAppClick = () => {
    const defaultMessage = `Olá! Tenho interesse no produto: ${product.popularName} - ${formatPrice(product.price)}`;
    const encodedMessage = encodeURIComponent(defaultMessage);
    const whatsappUrl = `https://wa.me/${`+5511999999999`}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };  

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        {/* Product Image */}        
        <div 
          className="aspect-square mb-4 bg-muted rounded-lg overflow-hidden cursor-pointer relative"
          onClick={() => navigate(`/products/${product.uuid}`)}
        >
          <img
            src={product.imagePath}
            alt={product.popularName}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 
              ${product.status === 'SOLD_OUT' ? 'opacity-50 grayscale' : ''}`}
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </div>

        {/* Product Info */}
        
        <div className="space-y-3">
          {product.status !== 'SOLD_OUT' && (
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                  {product.popularName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {product.category}
                </p>
              </div>
              <Button
                variant="ghost" 
                size="sm"
                className="h-8 px-3 flex items-center gap-2 hover:bg-[#54b751] hover:text-white"
                onClick={handleWhatsAppClick}
              >
                <img src="/whatsapp-logo.svg" alt="WhatsApp" className="h-4 w-4" />
                Possuo interesse
              </Button>            
            </div>
          )}

          {/* Price and Status */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">
              {formatPrice(product.price)}
            </span>
            {getStatusBadge()}
          </div>          
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;