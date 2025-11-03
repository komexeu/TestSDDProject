# 測試（Testing）

## 專案測試資料夾結構

```
src/
  └─ domains/
      ├─ order/            # 訂單領域程式碼
      ├─ inventory/        # 庫存領域程式碼
      └─ product/          # 商品領域程式碼

tests-vitest/
  ├─ order/                # 對應 src/domains/order 的測試
  │    ├─ createOrderUseCase.test.ts
  │    ├─ orderCore.test.ts
  │    └─ ...
  ├─ inventory/            # 對應 src/domains/inventory 的測試
  │    ├─ inventory-api.test.ts
  │    └─ ...
  ├─ product/              # 對應 src/domains/product 的測試
  │    └─ ...
  ├─ vitest.setup.ts       # 測試初始化設定
  └─ testUtils.ts          # 共用測試工具
```

> 測試檔案以功能/領域分類，命名規則為 `xxx.test.ts`，並與 src/ 結構對應，利於維護與查找。

## 目標
確保各層邏輯正確、可維護，並能快速發現回歸錯誤。

## 分類
- 單元測試（Unit Test）：聚焦於單一 class/function，mock 其依賴。
- 整合測試（Integration Test）：測試多層協作（如 UseCase + Repository），可連接測試資料庫。
- 端對端測試（E2E）：模擬實際 API 請求，驗證整體流程。

## 範例：Order UseCase 單元測試
```ts
import { OrderUseCase } from '../../src/domains/order/application/use-cases/order-usecase';
import { mockOrderRepository } from '../mocks/mockOrderRepository';

describe('OrderUseCase', () => {
  it('should create order and publish event', async () => {
    const useCase = new OrderUseCase(mockOrderRepository, /* eventBus */);
    const result = await useCase.createOrder({ ... });
    expect(result).toHaveProperty('id');
    // 可驗證 eventBus 是否被呼叫
  });
});
```

---

# 文件與註解標準（Documentation & JSDoc）

## 目標
- 提升可讀性、維護性，降低溝通成本。
- 所有公開 class、method、DTO 必須加上 JSDoc。

## 範例
```ts
/**
 * 訂單聚合根
 * @class
 */
export class Order extends AggregateRoot<OrderProps> {
  /**
   * 新增商品到訂單
   * @param item 商品項目
   */
  addItem(item: OrderItem): void { ... }
}
```

---

# CQRS / 查詢分離（Command Query Responsibility Segregation）

## 目標
- 將寫入（Command）與查詢（Query）邏輯分離，提升可維護性與效能。
- 查詢可直接對資料庫或 Read Model，寫入則經過 UseCase/Domain Layer。

## 範例

### Command（寫入）
```ts
// src/domains/order/application/use-cases/create-order.usecase.ts
export class CreateOrderUseCase {
  async execute(input: CreateOrderInput): Promise<Order> {
    // ...商業邏輯、事件發佈
  }
}
```

### Query（查詢）
```ts
// src/domains/order/application/queries/get-order-detail.query.ts
export class GetOrderDetailQuery {
  async execute(orderId: string): Promise<OrderDetailDTO> {
    // 直接查詢資料庫或 Read Model
  }
}
```

---

> 各主題請依據專案需求擴充細節與範例。