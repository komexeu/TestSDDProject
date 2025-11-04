import { describe, it, expect } from 'vitest';
// TODO: 根據實作引入 productValidation 模組

describe('訂單資料驗證', () => {
  it('應驗證商品名稱、數量、價格等欄位規則', () => {
    // Arrange
    // TODO: 準備合法商品資料

    // Act
    // TODO: 呼叫驗證方法

    // Assert
    // TODO: 驗證通過
    expect(true).toBe(true); // 佔位
  });

  it('不合法資料時應拋出錯誤', () => {
    // Arrange
    // TODO: 準備不合法商品資料

    // Act & Assert
    // TODO: 驗證拋出錯誤
    expect(true).toBe(true); // 佔位
  });
});
