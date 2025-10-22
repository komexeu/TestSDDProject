// 商品資料驗證邏輯
import { Product } from './productTypes';

export function validateProductInput(input: Partial<Product>): string[] {
    const errors: string[] = [];
    if (!input.name || typeof input.name !== 'string' || input.name.trim() === '') {
        errors.push('商品名稱不得為空');
    }
    if (typeof input.price !== 'number' || !Number.isInteger(input.price) || input.price <= 0) {
        errors.push('售價必須為大於 0 的整數（新台幣元）');
    }
    if (!input.description || typeof input.description !== 'string') {
        errors.push('商品描述不得為空');
    }
    return errors;
}
