import { useState, useEffect } from 'react';
import { Product, productService, PageResponse } from '@/services/productService';
import { AppSidebar } from '@/components/AppSidebar';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Search, Plus, Filter, MoreHorizontal, Edit, Trash2, Download } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const InventoryManagement = () => {
    interface EditFormData {
      name: string;
      category: string;
      price: number;
      status: string;
      image: File | string;
    }
    const [productsPage, setProductsPage] = useState<PageResponse<Product> | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editForm, setEditForm] = useState<EditFormData>({
      name: '',
      category: '',
      price: 0,
      status: '',
      image: ''
    });
    const { toast } = useToast();
    const [currentPage, setCurrentPage] = useState(0); // página atual   
    const navigate = useNavigate(); 

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const pageData = await productService.getAll(currentPage);
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
  }, [toast, currentPage]); // carrega quando a página muda

  const filterProducts = () => {
    if (!searchTerm) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_STOCK':
        return <Badge className="bg-success text-success-foreground">Possui estoque</Badge>;
      case 'LOW_STOCK':
        return <Badge className="bg-warning text-warning-foreground">Estoque Baixo</Badge>;
      case 'SOLD_OUT':
        return <Badge variant="secondary">Sem estoque</Badge>;
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
    setEditingProduct(product);
    setEditForm({
      name: product.popularName,
      category: product.category,
      price: product.price,
      status: product.status,
      image: product.imagePath
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    try {
      const formData = new FormData();
      formData.append("uuid", editingProduct.uuid);
      formData.append("name", editForm.name);
      formData.append("category", editForm.category);
      formData.append("price", String(editForm.price));
      formData.append("status", editForm.status);

      // Só adiciona a imagem se for um File (novo arquivo)
      if (editForm.image && editForm.image instanceof File) {
        formData.append("imagem", editForm.image);
      }

      await productService.update(formData);
      
      // Atualiza lista local
      const updatedProducts = products.map(p => {
        if (p.uuid !== editingProduct.uuid) return p;

        const imageUrl: string = editForm.image instanceof File
          ? URL.createObjectURL(editForm.image)
          : editForm.image;

        return { ...p, ...editForm, image: imageUrl };
      });

      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
      setEditModalOpen(false);
      setEditingProduct(null);

      toast({
        title: "Produto atualizado",
        description: "O produto foi editado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast({
        title: "Erro ao atualizar produto",
        description: "Não foi possível salvar as alterações",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditModalOpen(false);
    setEditingProduct(null);
    setEditForm({
      name: '',
      category: '',
      price: 0,
      status: '',
      image: ''
    });
  };

  const handleDelete = async (productId: string) => {
    try {
      await productService.delete(productId);

      // Remove da lista local
      const updatedProducts = products.filter(p => p.uuid !== productId);
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);

      toast({
        title: "Produto excluído",
        description: "O produto foi removido com sucesso",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast({
        title: "Erro ao excluir produto",
        description: "Não foi possível excluir o produto",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Layout currentPage="products">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando produtos...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="products">
      <SidebarProvider className='mt-4'>
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
                    <Button size="sm" onClick={() => navigate('/register-product')}>
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
                        <TableHead className="font-medium text-foreground">Nome</TableHead>
                        <TableHead className="font-medium text-foreground">Categoria</TableHead>
                        <TableHead className="font-medium text-foreground">Preço</TableHead>
                        <TableHead className="font-medium text-foreground">Status</TableHead>
                        {/* <TableHead className="font-medium text-foreground">Status</TableHead> */}
                        <TableHead className="font-medium text-foreground w-20">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.uuid} className="border-border hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={product.imagePath}
                                alt={product.popularName}
                                className="h-10 w-10 rounded-md object-cover bg-muted"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                              <div>
                                <div className="font-medium text-foreground">{product.popularName}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {product.category}
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

                  {filteredProducts.length === 0 && (
                    <div className="p-8 text-center">
                      <div className="text-muted-foreground">
                        {searchTerm ? 'Nenhum produto encontrado para sua busca.' : 'Nenhum produto cadastrado.'}
                      </div>
                    </div>
                  )}
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

        {/* Modal de Edição */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Produto</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  placeholder="Nome do produto"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  placeholder="Categoria do produto"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Preço</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={editForm.price}
                  onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={editForm.status} onValueChange={(value) => setEditForm({...editForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN_STOCK">Tem estoque</SelectItem>
                    <SelectItem value="LOW_STOCK">Estoque Baixo</SelectItem>
                    <SelectItem value="SOLD_OUT">Sem estoque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <ImageUpload
                value={editForm.image instanceof File ? URL.createObjectURL(editForm.image) : editForm.image}
                onChange={(fileOrUrl) => setEditForm({ ...editForm, image: fileOrUrl })}
                label="Imagem do Produto"
              />
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </SidebarProvider>
    </Layout>
  );
};

export default InventoryManagement;