const API_BASE_URL = 'http://localhost:8081/floricultura';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string): Promise<T> {
    console.log(`🌐 Fazendo requisição GET para: ${this.baseUrl}${endpoint}`);
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include', // Importante para CORS
    });
    
    console.log(`📊 Status da resposta: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.error(`❌ Erro na requisição GET ${endpoint}:`, response.status);
      throw new Error(`Erro na requisição: ${response.status}`);
    }
    
    console.log('🔄 Convertendo resposta para JSON...');
    const data = await response.json();
    console.log('✅ JSON convertido:', data);
    
    return data;
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? data : JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    return response.json();
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const isFormData = data instanceof FormData;

    const headers: any = {};
    const authHeader = this.getAuthHeader();
    if (authHeader) headers['Authorization'] = authHeader;
    // NÃO setar Content-Type se for FormData

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers,
      body: isFormData ? data : JSON.stringify(data),
      credentials: 'include', // manter
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T | void> {
  const response = await fetch(`${this.baseUrl}${endpoint}`, {
    method: 'DELETE',
    headers: this.getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : undefined;
}

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': this.getAuthHeader(),
    };
  }

  private getAuthHeader(): string {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return `Bearer ${userData.token || ''}`;
    }
    return '';
  }
}

export const apiService = new ApiService();
