import { useState, useEffect, useCallback, useRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { categoryService, CategoryResponse } from "@/services/categoryService.ts";

interface ProductFiltersProps {
  onFiltersChange: (filters: {
    categories: string[];
    priceRanges: string[];
  }) => void;
}

// Estado global para persistir os filtros mesmo com re-montagem
let globalFilterState = {
  selectedCategories: [] as string[],
  selectedPriceRanges: [] as string[],
  appliedCategories: [] as string[],
  appliedPriceRanges: [] as string[]
};

const ProductFilters = ({ onFiltersChange }: ProductFiltersProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(globalFilterState.selectedCategories);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>(globalFilterState.selectedPriceRanges);
  const [appliedCategories, setAppliedCategories] = useState<string[]>(globalFilterState.appliedCategories);
  const [appliedPriceRanges, setAppliedPriceRanges] = useState<string[]>(globalFilterState.appliedPriceRanges);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  
  const isFirstRender = useRef(true);

  // Sincroniza o estado local com o estado global sempre que houver mudanças
  useEffect(() => {
    globalFilterState = {
      selectedCategories,
      selectedPriceRanges,
      appliedCategories,
      appliedPriceRanges
    };
  }, [selectedCategories, selectedPriceRanges, appliedCategories, appliedPriceRanges]);

  // Debug: log do estado atual
  console.log('ProductFilters render:', {
    selectedCategories,
    selectedPriceRanges,
    appliedCategories,
    appliedPriceRanges
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAll();
        setCategories(data);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    };

    fetchCategories();
  }, []);

  const priceRanges = [
    { id: 'under-100', label: 'Até R$ 100,00', min: 0, max: 100 },
    { id: '100-300', label: 'De R$ 100,00 a R$ 300,00', min: 100, max: 300 },    
    { id: 'above-300', label: 'Acima de R$ 300,00', min: 300, max: Infinity },
  ];

  const handleCategoryChange = useCallback((categoryId: string, checked: boolean) => {
    console.log('Mudança categoria:', categoryId, checked);
    setSelectedCategories(prev => {
      const updatedCategories = checked 
        ? [...prev, categoryId]
        : prev.filter(id => id !== categoryId);
      
      console.log('Categorias atualizadas:', updatedCategories);
      return updatedCategories;
    });
  }, []);

  const handlePriceRangeChange = useCallback((priceRangeId: string, checked: boolean) => {
    console.log('Mudança preço:', priceRangeId, checked);
    setSelectedPriceRanges(prev => {
      const updatedPriceRanges = checked 
        ? [...prev, priceRangeId]
        : prev.filter(id => id !== priceRangeId);
      
      console.log('Faixas de preço atualizadas:', updatedPriceRanges);
      return updatedPriceRanges;
    });
  }, []);

  // Função para aplicar os filtros (chamada apenas no clique do botão)
  const applyFilters = useCallback(() => {
    console.log('Aplicando filtros:', {
      categories: selectedCategories,
      priceRanges: selectedPriceRanges
    });
    
    // Atualiza os filtros aplicados para controle interno
    setAppliedCategories([...selectedCategories]);
    setAppliedPriceRanges([...selectedPriceRanges]);
    
    // Atualiza o estado global também
    globalFilterState.appliedCategories = [...selectedCategories];
    globalFilterState.appliedPriceRanges = [...selectedPriceRanges];
    
    // Envia os filtros para o componente pai
    onFiltersChange({
      categories: [...selectedCategories],
      priceRanges: [...selectedPriceRanges]
    });
  }, [selectedCategories, selectedPriceRanges, onFiltersChange]);

  const clearFilters = useCallback(() => {
    console.log('Limpando filtros');
    
    // Limpa todos os estados
    setSelectedCategories([]);
    setSelectedPriceRanges([]);
    setAppliedCategories([]);
    setAppliedPriceRanges([]);
    
    // Limpa o estado global também
    globalFilterState = {
      selectedCategories: [],
      selectedPriceRanges: [],
      appliedCategories: [],
      appliedPriceRanges: []
    };
    
    // Notifica o componente pai para remover os filtros
    onFiltersChange({
      categories: [],
      priceRanges: []
    });
  }, [onFiltersChange]);
 

  return (
    <div className="w-64 p-4 border-r border-border bg-card">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Filtros</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-xs"
          >
            Limpar
          </Button>
        </div>

        {/* Categorias */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Categorias</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.uuid} className="flex items-center space-x-2">
                <Checkbox
                  id={category.uuid}
                  checked={selectedCategories.includes(category.uuid)}
                  onCheckedChange={(checked) => 
                    handleCategoryChange(category.uuid, checked as boolean)
                  }
                />
                <label 
                  htmlFor={category.uuid} 
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {category.name}
                </label>                
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Preços */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Preços</h4>
          <div className="space-y-2">
            {priceRanges.map((range) => (
              <div key={range.id} className="flex items-center space-x-2">
                <Checkbox
                  id={range.id}
                  checked={selectedPriceRanges.includes(range.id)}
                  onCheckedChange={(checked) => 
                    handlePriceRangeChange(range.id, checked as boolean)
                  }
                />
                <label 
                  htmlFor={range.id} 
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {range.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Aplicar Filtros Button */}
        <Button 
          className="w-full" 
          size="sm"
          onClick={applyFilters}
        >
          FILTRAR
        </Button>
        
        {/* Indicador visual de filtros aplicados */}
        {(appliedCategories.length > 0 || appliedPriceRanges.length > 0) && (
          <div className="text-xs text-muted-foreground">
            {appliedCategories.length > 0 && (
              <div>Categorias: {appliedCategories.length}</div>
            )}
            {appliedPriceRanges.length > 0 && (
              <div>Faixas de preço: {appliedPriceRanges.length}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFilters;