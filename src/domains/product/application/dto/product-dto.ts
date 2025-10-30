// 產品管理相關 DTO
export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  code?: string;
}

export interface CreateProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  code?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface GetProductRequest {
  productId: string;
}

export interface GetProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  code?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProductRequest {
  productId: string;
  name?: string;
  description?: string;
  price?: number;
  code?: string;
}

export interface UpdateProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  code?: string;
  isActive: boolean;
  updatedAt: Date;
}

export interface ListProductsRequest {
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface ListProductsResponse {
  products: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    code?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
  total: number;
}