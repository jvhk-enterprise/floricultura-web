import { useState, useEffect } from 'react';
import { Product, productService, PageResponse } from '@/services/productService';
import Layout from '@/components/Layout';
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Search, Plus, Filter, MoreHorizontal, Edit, Trash2, Download, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProductsList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Agora funciona corretamente com o parâmetro opcional
      const response = await productService.getAll(0);
      
      console.log('Resposta da API:', response);
      
      if (response && response.content) {
        setProducts(response.content);
        console.log(`${response.content.length} produtos carregados`);
      } else {
        console.warn('Resposta da API não contém content:', response);
        setProducts([]);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos. Verifique sua conexão.",
        variant: "destructive",
      });
      
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (!searchTerm) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product =>
      product.popularName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.scientificName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_STOCK':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Em Estoque</Badge>;
      case 'LOW_STOCK':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Estoque Baixo</Badge>;
      case 'SOLD_OUT':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Sem Estoque</Badge>;
      default:
        return <Badge variant="secondary">-</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const handleEdit = (product: Product) => {
    toast({
      title: "Editar Produto",
      description: `Editando ${product.popularName}`,
    });
  };

  const handleDelete = async (productId: string) => {
    try {
      await productService.delete(productId);
      toast({
        title: "Produto excluído",
        description: "Produto excluído com sucesso",
      });
      // Recarregar lista
      loadProducts();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir produto",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Layout currentPage="products">
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              <main className="flex-1 flex items-center justify-center">
                <div className="text-muted-foreground">Carregando produtos...</div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout currentPage="products">
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              <main className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-destructive mb-4">Erro ao carregar produtos</div>
                  <Button onClick={loadProducts}>Tentar novamente</Button>
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </Layout>
    );
  }

  return (
    <Layout currentPage="products">
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-12 flex items-center border-b bg-background px-4">
              <SidebarTrigger />
              <div className="ml-4">
                <h1 className="text-lg font-semibold text-foreground">Gerenciamento de Produtos</h1>
              </div>
            </header>
            
            <main className="flex-1 p-6 bg-background">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
                    <p className="text-sm text-muted-foreground">
                      Gerencie todos os produtos da sua floricultura
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Produto
                    </Button>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                </div>

                {/* Products Table */}
                <div className="border border-border rounded-lg bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="font-medium text-foreground">Produto</TableHead>
                        <TableHead className="font-medium text-foreground">Categoria</TableHead>
                        <TableHead className="font-medium text-foreground">Preço</TableHead>
                        <TableHead className="font-medium text-foreground">Status</TableHead>
                        <TableHead className="font-medium text-foreground w-20">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.uuid} className="border-border hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted border">
                                {product.imagePath ? (
                                  <img
                                    src={product.imagePath}
                                    alt={product.popularName || 'Produto'}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      console.log('Erro ao carregar imagem:', product.imagePath);
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const placeholder = target.nextElementSibling as HTMLElement;
                                      if (placeholder) placeholder.style.display = 'flex';
                                    }}
                                    onLoad={() => {
                                      console.log('Imagem carregada com sucesso:', product.imagePath);
                                    }}
                                  />
                                ) : null}
                                <div 
                                  className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-muted"
                                  style={{ display: product.imagePath ? 'none' : 'flex' }}
                                >
                                  <Package className="h-5 w-5" />
                                </div>
                              </div>
                              <div>
                                <div className="font-medium text-foreground">
                                  {product.popularName || 'Nome não informado'}
                                </div>
                                {product.scientificName && (
                                  <div className="text-sm text-muted-foreground italic">
                                    {product.scientificName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {product.category || '-'}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {formatPrice(product.price)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(product.status)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => handleEdit(product)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(product.uuid)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {filteredProducts.length === 0 && !loading && (
                    <div className="p-8 text-center">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <div className="text-muted-foreground">
                        {searchTerm ? 'Nenhum produto encontrado para sua busca.' : 'Nenhum produto cadastrado.'}
                      </div>
                      {!searchTerm && (
                        <Button className="mt-4" size="sm" onClick={() => window.location.href = '/products/new'}>
                          <Plus className="h-4 w-4 mr-2" />
                          Cadastrar primeiro produto
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Debug Info - Remover em produção */}
                <div className="text-xs text-muted-foreground">
                  Debug: {products.length} produtos carregados, {filteredProducts.length} produtos filtrados
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {filteredProducts.length} de {products.length} produtos
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled>
                      Anterior
                    </Button>
                    <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                      1
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      Próximo
                    </Button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </Layout>
  );
};

export default ProductsList;