import { apiService } from './api';

export interface Product {
  uuid: string;
  popularName: string;
  price: number;
  imagePath: string;
  category: string;  
  cycle: string;
  amount: number;
  status: string;
  scientificName: string;
  origin?: string;
  height?: number;
  idealEnvironment?: string;
  cultivationDifficult?: string;
  description?: string;
  cultivationTips?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  pageable?: any;
  last?: boolean;
  first?: boolean;
  numberOfElements?: number;
  empty?: boolean;
}

export interface ProductFormData {
  scientificName: string;
  popularName: string;
  origin: string;
  cycle: string;
  height: string; // vem como string do form
  idealEnvironment: string;
  cultivationDifficult: string;
  description: string;
  price: string; // também string no form
  cultivationTips: string;
}

export const productService = {
  // Corrigido: página opcional com valor padrão
  getAll: (page: number = 0) => {
    console.log(`📋 productService.getAll chamado - página ${page}`);
    return apiService.get<PageResponse<Product>>(`/products?page=${page}`);
  },

  getReleaseProducts: () => {
    return apiService.get<Array<Product>>(`/products/release`);
  },

  getById: (id: string) => {
    console.log(`Carregando produto ${id}`);
    return apiService.get<Product>(`/products/${id}`);
  },

  create: (data: ProductFormData, imageFile: File) => {
    console.log('Criando produto:', data.popularName);
    
    const fd = new FormData();
    fd.append('scientificName', data.scientificName);
    fd.append('popularName', data.popularName);
    fd.append('origin', data.origin);
    fd.append('cycle', data.cycle);
    fd.append('height', data.height);
    fd.append('idealEnvironment', data.idealEnvironment);
    fd.append('cultivationDifficult', data.cultivationDifficult);
    fd.append('description', data.description);
    fd.append('price', data.price.replace(',', '.'));
    fd.append('cultivationTips', data.cultivationTips);
    
    // Nome do campo deve corresponder ao backend
    fd.append('imagem', imageFile);

    return apiService.post<Product>('/products', fd);
  },

  delete: (id: string) => {
    console.log(`Excluindo produto ${id}`);
    return apiService.delete(`/products/${id}`);
  },

  update: (data: FormData) => {
    console.log('Atualizando produto');
    return apiService.put<Product>('/products', data);
  },

  search: (
    filters: { categories: string[]; priceRanges: string[] },
    page: number
  ): Promise<PageResponse<Product>> => {
    // converte os priceRanges selecionados em intervalos numéricos
    const priceIntervals = filters.priceRanges.map((id) => {
      switch (id) {
        case 'under-100':
          return { min: 0, max: 100 };
        case '100-300':
          return { min: 100, max: 300 };
        case 'above-300':
          return { min: 300, max: null };
        default:
          return null;
      }
    }).filter(Boolean);

    return apiService.post<PageResponse<Product>>(
      `/products/search?page=${page}`,
      {
        categories: filters.categories,
        priceIntervals
      }
    );
  },
};