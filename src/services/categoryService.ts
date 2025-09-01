import { apiService } from './api';

export interface CategoryResponse {
  uuid: string;
  name: string;
}

export const categoryService = {
    getAll: () => {        
        return apiService.get<CategoryResponse>(`/category`);
    },
}