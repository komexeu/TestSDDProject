// 商品輸入驗證函式，回傳錯誤訊息陣列
export function validateProductInput(input: any): string[] {
  const errors: string[] = [];
  if (!input) {
    errors.push('商品資料不得為空');
    return errors;
  }
  if (typeof input.name !== 'string' || input.name.trim() === '') {
    errors.push('商品名稱不得為空');
  }
  if (typeof input.price !== 'number' || !Number.isInteger(input.price) || input.price < 0) {
    errors.push('售價必須為大於 0 的整數（新台幣元）');
  }
  if (typeof input.description !== 'string' || input.description.trim() === '') {
    errors.push('商品描述不得為空');
  }
  // 可根據需求擴充更多欄位驗證
  return errors;
}
