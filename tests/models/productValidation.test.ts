import { validateProductInput } from '../../src/models/productValidation';

describe('validateProductInput', () => {
  it('應通過正確資料', () => {
    const errors = validateProductInput({
      name: '珍奶',
      price: 60,
      description: '經典台灣飲品',
    });
    expect(errors).toHaveLength(0);
  });

  it('名稱不得為空', () => {
    const errors = validateProductInput({
      name: '',
      price: 60,
      description: '經典台灣飲品',
    });
    expect(errors).toContain('商品名稱不得為空');
  });

  it('售價必須為大於 0 的整數', () => {
    const errors = validateProductInput({
      name: '珍奶',
      price: -10,
      description: '經典台灣飲品',
    });
    expect(errors).toContain('售價必須為大於 0 的整數（新台幣元）');
  });

  it('描述不得為空', () => {
    const errors = validateProductInput({
      name: '珍奶',
      price: 60,
      description: '',
    });
    expect(errors).toContain('商品描述不得為空');
  });
});
