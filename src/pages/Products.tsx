import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import ProductFilters from '@/components/ProductFilters';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Product, productService, PageResponse } from '@/services/productService';
import { useToast } from '@/hooks/use-toast';
import { Grid3X3, List, Search } from 'lucide-react';

const Products = () => {
  const [productsPage, setProductsPage] = useState<PageResponse<Product> | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    categories: [] as string[],
    priceRanges: [] as string[]
  });
  const [currentPage, setCurrentPage] = useState(0);
  const { toast } = useToast();

  // Carregamento inicial e quando filtros ou página mudam
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        let pageData: PageResponse<Product>;

        // Se há filtros aplicados, usa a busca, senão carrega todos
        if (filters.categories.length > 0 || filters.priceRanges.length > 0) {
          pageData = await productService.search(filters, currentPage);
        } else {
          pageData = await productService.getAll(currentPage);
        }

        setProductsPage(pageData);
        setProducts(pageData.content);
        setFilteredProducts(pageData.content);

        toast({
          title: "Produtos carregados",
          description: `${pageData.totalElements} produtos encontrados no total`,
        });
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        toast({
          title: "Erro ao conectar com a API",
          description: "Verifique se a API está rodando em localhost:8081/floricultura",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [filters, currentPage, toast]);

  // Filtro local por termo de busca (não faz requisição ao backend)
  useEffect(() => {
    const filtered = products.filter(product =>
      product.popularName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm?.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [products, searchTerm]);

  const handleAddProduct = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A criação de produtos será implementada em breve.",
    });
  };

  const handleEditProduct = (product: Product) => {
    toast({
      title: "Editar produto",
      description: `Editando: ${product.popularName}`,
    });
  };

  const handleDeleteProduct = (productId: string) => {
    const product = products.find(p => p.uuid === productId);
    if (product) {
      setProducts(prev => prev.filter(p => p.uuid !== productId));
      toast({
        title: "Produto excluído",
        description: `${product.popularName} foi removido com sucesso.`,
      });
    }
  };

  // Função chamada quando filtros são aplicados (useCallback para evitar re-criação)
  const handleFiltersChange = useCallback((newFilters: { categories: string[]; priceRanges: string[] }) => {
    console.log('Products recebeu filtros:', newFilters);
    setFilters(newFilters);
    setCurrentPage(0); // Reset para primeira página quando filtros mudam
  }, []);

  const getStockSummary = () => {
    const total = products.length;
    const inStock = products.filter(p => p.status === 'IN_STOCK').length;
    const soldOut = products.filter(p => p.status === 'SOLD_OUT').length;
    const lowStock = products.filter(p => p.status === 'LOW_STOCK').length;

    return { total, inStock, soldOut, lowStock };
  };

  const { total, inStock, soldOut, lowStock } = getStockSummary();

  if (loading) {
    return (
      <Layout currentPage="products">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando produtos...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="products">
      <div className="flex">
        {/* Sidebar de Filtros */}
        <ProductFilters 
          key="product-filters" 
          onFiltersChange={handleFiltersChange} 
        />
        
        {/* Conteúdo Principal */}
        <div className="flex-1 p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold mb-2">Lista de produtos</h1>
            
            {/* Indicador de filtros aplicados */}
            {(filters.categories.length > 0 || filters.priceRanges.length > 0) && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">Filtros aplicados:</span>
                {filters.categories.length > 0 && (
                  <Badge variant="secondary">
                    {filters.categories.length} categoria(s)
                  </Badge>
                )}
                {filters.priceRanges.length > 0 && (
                  <Badge variant="secondary">
                    {filters.priceRanges.length} faixa(s) de preço
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10"
                />
              </div>            
            </div>

            <div className="flex items-center space-x-3">
              {/* View Mode */}
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>            
            </div>
          </div>

          {/* Products Grid */}
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-4'
            }
          `}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.uuid}
                product={product}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado.'}
              </p>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando: {filteredProducts.length} / {productsPage?.totalElements || 0}
            </p>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              >
                ←
              </Button>
              <Button variant="default" size="sm">
                {currentPage + 1}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={!productsPage?.last === false}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;