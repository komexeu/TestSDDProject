# CQRS / 查詢分離（Command Query Responsibility Segregation）

## 目標
- 將寫入（Command）與查詢（Query）邏輯分離，提升可維護性與效能。
- 查詢可直接對資料庫或 Read Model，寫入則經過 UseCase/Domain Layer。

## 專案 CQRS/查詢分離資料夾結構

```
src/
  └─ domains/
      └─ order/
          ├─ application/
          │    ├─ use-cases/   # Command: 寫入/業務流程
          │    │    └─ create-order.usecase.ts
          │    └─ queries/     # Query: 查詢流程
          │         └─ get-order-detail.query.ts
          └─ ...
```

> Command（寫入）與 Query（查詢）建議分資料夾維護，利於職責分離與擴充。

---

## 架構說明
- Command：負責狀態改變（如建立、更新、刪除），必經 UseCase 與 Domain Layer，觸發事件。
- Query：僅查詢資料，不改變狀態，可直接查詢資料庫或 Read Model，回傳 DTO。

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

> 建議查詢與寫入分開維護，並於 docs/ 補充查詢/寫入流程圖與設計說明。