import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ImageUpload } from '@/components/ImageUpload';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { productService } from '@/services/productService';

interface ProductFormData {
  scientificName: string;
  popularName: string;
  origin: string;
  cycle: string;
  height: string;
  idealEnvironment: string;
  cultivationDifficult: string;
  description: string;
  price: string;
  cultivationTips: string;
  image: string;
  amount: number;
}

const RegisterProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState('');
  const [priceValue, setPriceValue] = useState('');
  
  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ProductFormData>({
    defaultValues: {
      scientificName: '',
      popularName: '',
      origin: '',
      cycle: '',
      height: '',
      idealEnvironment: '',
      cultivationDifficult: '',
      description: '',
      price: '',
      cultivationTips: '',
      image: '',
      amount: 0
    }
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  // Função para formatar o valor como moeda
  const formatCurrency = (value: string) => {
    if (!value) return 'R$ 0,00';
    
    // Remove tudo que não for número
    const numericValue = value.replace(/\D/g, '');
    
    if (numericValue === '') return 'R$ 0,00';
    
    // Converte para número e divide por 100 (centavos)
    const numberValue = parseInt(numericValue) / 100;
    
    // Formata como moeda brasileira
    return numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Função para lidar com a mudança no input de preço
  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    let value = event.target.value;
    
    // Remove tudo que não for número
    const numericValue = value.replace(/\D/g, '');
    
    // Limita a 8 dígitos (999999,99)
    if (numericValue.length > 8) {
      return;
    }
    
    // Atualiza o estado local para formatação visual
    setPriceValue(numericValue);
    
    // Converte para valor decimal e envia para o form
    const decimalValue = numericValue ? (parseInt(numericValue) / 100).toString() : '';
    onChange(decimalValue);
  };

  // Função para lidar com teclas especiais
  const handlePriceKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { key } = event;
    
    // Permite: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
        // Permite: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
        (key === 'a' && event.ctrlKey === true) ||
        (key === 'c' && event.ctrlKey === true) ||
        (key === 'v' && event.ctrlKey === true) ||
        (key === 'x' && event.ctrlKey === true) ||
        (key === 'z' && event.ctrlKey === true)) {
      return;
    }
    
    // Para backspace, remove o último dígito
    if (key === 'Backspace') {
      event.preventDefault();
      const newValue = priceValue.slice(0, -1);
      setPriceValue(newValue);
      
      const decimalValue = newValue ? (parseInt(newValue) / 100).toString() : '';
      setValue('price', decimalValue);
      return;
    }
    
    // Garante que apenas números são digitados
    if (key < '0' || key > '9') {
      event.preventDefault();
      return;
    }
  };

  

  const onSubmit = async (data: ProductFormData) => {
    try {
        if (!imageFile) {
        toast({ title: "Imagem obrigatória", description: "Selecione uma imagem para o produto.", variant: "destructive" });
        return;
        }

        await productService.create(data, imageFile);

        toast({ title: "Produto cadastrado", description: "O produto foi cadastrado com sucesso!" });
        navigate('/inventory-management');
    } catch (e) {
        console.error(e);
        toast({ title: "Erro ao cadastrar", description: "Não foi possível cadastrar o produto", variant: "destructive" });
    }
  };

  const handleBack = () => {
    navigate('/inventory-management');
  };

  const handleImageChange = (fileOrUrl: File | string) => {
    console.log("image change")
    if (fileOrUrl instanceof File) {
        setImageFile(fileOrUrl);
        setImageUrl(URL.createObjectURL(fileOrUrl)); // preview local
    } else {
        setImageFile(null);
        setImageUrl(fileOrUrl); // URL direta
    }
    };

  return (
    <Layout currentPage="products">
      <SidebarProvider className='mt-4'>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-12 flex items-center border-b bg-background px-4">
              <SidebarTrigger />
              <div className="ml-4 flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
                <h1 className="text-lg font-semibold text-foreground">Cadastrar Novo Produto</h1>
              </div>
            </header>
            
            <main className="flex-1 p-6 bg-background">
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do Produto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      {/* Linha 1 - Nome científico e popular */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="scientificName">Nome Científico</Label>
                          <Input
                            id="scientificName"
                            {...register('scientificName', { required: 'Nome científico é obrigatório' })}
                            placeholder="Ex: Rosa damascena"
                            className={errors.scientificName ? 'border-destructive' : ''}
                          />
                          {errors.scientificName && (
                            <p className="text-sm text-destructive">{errors.scientificName.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="popularName">Nome Popular</Label>
                          <Input
                            id="popularName"
                            {...register('popularName', { required: 'Nome popular é obrigatório' })}
                            placeholder="Ex: Rosa"
                            className={errors.popularName ? 'border-destructive' : ''}
                          />
                          {errors.popularName && (
                            <p className="text-sm text-destructive">{errors.popularName.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Linha 2 - Origem e Ciclo */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="origin">Origem</Label>
                          <Input
                            id="origin"
                            {...register('origin', { required: 'Origem é obrigatória' })}
                            placeholder="Ex: Mediterrâneo"
                            className={errors.origin ? 'border-destructive' : ''}
                          />
                          {errors.origin && (
                            <p className="text-sm text-destructive">{errors.origin.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cycle">Ciclo</Label>
                          <Input
                            id="cycle"
                            {...register('cycle', { required: 'Ciclo é obrigatório' })}
                            placeholder="Ex: Perene, Anual, Bienal"
                            className={errors.cycle ? 'border-destructive' : ''}
                          />
                          {errors.cycle && (
                            <p className="text-sm text-destructive">{errors.cycle.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Linha 3 - Altura, Ambiente e Dificuldade */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="height">Altura (cm)</Label>
                          <Input
                            id="height"
                            type="number"
                            {...register('height', { required: 'Altura é obrigatória' })}
                            placeholder="Ex: 150"
                            className={errors.height ? 'border-destructive' : ''}
                          />
                          {errors.height && (
                            <p className="text-sm text-destructive">{errors.height.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="idealEnvironment">Ambiente Ideal</Label>
                          <Input
                            id="idealEnvironment"
                            {...register('idealEnvironment', { required: 'Ambiente ideal é obrigatório' })}
                            placeholder="Ex: Sol pleno, Meia sombra"
                            className={errors.idealEnvironment ? 'border-destructive' : ''}
                          />
                          {errors.idealEnvironment && (
                            <p className="text-sm text-destructive">{errors.idealEnvironment.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="difficulty">Dificuldade de Cultivo</Label>
                          <Input
                            id="difficulty"
                            {...register('cultivationDifficult', { required: 'Dificuldade é obrigatória' })}
                            placeholder="Ex: Fácil, Médio, Difícil"
                            className={errors.cultivationDifficult ? 'border-destructive' : ''}
                          />
                          {errors.cultivationDifficult && (
                            <p className="text-sm text-destructive">{errors.cultivationDifficult.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Preço com máscara personalizada */}
                      <div className="space-y-2">
                        <Label htmlFor="price">Preço</Label>
                        <Controller
                          name="price"
                          control={control}
                          rules={{ required: 'Preço é obrigatório' }}
                          render={({ field }) => (
                            <Input
                              id="price"
                              value={formatCurrency(priceValue)}
                              onChange={(e) => handlePriceChange(e, field.onChange)}
                              onKeyDown={handlePriceKeyDown}
                              placeholder="R$ 0,00"
                              className={errors.price ? 'border-destructive' : ''}
                            />
                          )}
                        />
                        {errors.price && (
                          <p className="text-sm text-destructive">{errors.price.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="height">Quantidade</Label>
                          <Input
                            id="amount"
                            type="number"
                            {...register('height', { required: 'Quantidade é obrigatória' })}
                            placeholder="Ex: 150"
                            className={errors.amount ? 'border-destructive' : ''}
                          />
                          {errors.amount && (
                            <p className="text-sm text-destructive">{errors.amount.message}</p>
                          )}
                      </div>

                      {/* Descrição */}
                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          {...register('description', { required: 'Descrição é obrigatória' })}
                          placeholder="Descreva o produto, suas características e benefícios..."
                          rows={4}
                          className={errors.description ? 'border-destructive' : ''}
                        />
                        {errors.description && (
                          <p className="text-sm text-destructive">{errors.description.message}</p>
                        )}
                      </div>                   

                      {/* Dicas de Cultivo */}
                      <div className="space-y-2">
                        <Label htmlFor="cultivationTips">Dicas de Cultivo</Label>
                        <Textarea
                          id="cultivationTips"
                          {...register('cultivationTips', { required: 'Dicas de cultivo são obrigatórias' })}
                          placeholder="Forneça dicas importantes para o cultivo desta planta..."
                          rows={4}
                          className={errors.cultivationTips ? 'border-destructive' : ''}
                        />
                        {errors.cultivationTips && (
                          <p className="text-sm text-destructive">{errors.cultivationTips.message}</p>
                        )}
                      </div>

                      {/* Upload da Imagem */}
                      <div className="space-y-2">
                        <ImageUpload
                            value={imageFile ?? imageUrl}
                            onChange={handleImageChange}
                            label="Imagem do Produto"
                        />
                      </div>

                      {/* Botões de ação */}
                      <div className="flex items-center justify-end gap-4 pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleBack}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="gap-2"
                        >
                          <Save className="h-4 w-4" />
                          {isSubmitting ? 'Salvando...' : 'Salvar Produto'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </Layout>
  );
};

export default RegisterProduct;