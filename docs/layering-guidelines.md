src/
├── app.ts, index.ts, server.ts
├── core/
├── domains/
│   ├── inventory/
│   ├── order/
│   │   ├── application/
│   │   │   ├── service/         → 依賴 domain/repositories、(可依賴 domain/services)
│   │   │   └── use-cases/       → 依賴 application/service、shared/domain/events
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── events/
│   │   │   ├── repositories/    → 被 application/service、infrastructure/repositories 實作依賴
│   │   │   └── value-objects/
│   │   └── infrastructure/
│   │       └── repositories/    → 實作 domain/repositories
│   └── product/
├── interfaces/
│   └── http/
│       ├── controllers/         → 依賴 application/use-cases
│       ├── middleware/
│       └── routes/
├── models/
└── shared/

# 分層設計與檔案結構指引（2025）

   - repositories/：Repository 介面，僅定義 CRUD 與查詢，回傳/接收 domain entity
   - services/：Domain Service，純商業規則，無基礎設施依賴

2. **Application Layer**（應用層）
   - service/：Application Service，協調聚合根、Repository、組裝 input/output DTO，處理跨聚合協作
   - use-cases/：用例層，負責單一業務流程（如狀態轉換），驗證、呼叫 service、儲存、發佈事件
   - dto/：用例/服務專屬 DTO，命名規則明確（Request/Response/Input/Output）

3. **Infrastructure Layer**（基礎設施層）
   - repositories/：Repository 實作（如 Prisma），只負責資料存取，回傳/接收 domain entity

4. **Interface Layer**（介面層）
   - http/controllers/：Controller，僅負責接收/回傳資料，呼叫 use case，不處理業務邏輯

5. **Shared**
   - 共用型別、例外、事件發佈器等

---

## 2. 事件流與責任分工

- **聚合根（Order）**：狀態變更時呼叫 `addDomainEvent` 暫存事件
- **Application Service**：執行業務邏輯、儲存聚合根，回傳聚合根（不直接發佈事件）
- **Use Case 層**：呼叫 service，儲存後統一發佈所有事件並清空
- **EventBus/EventPublisher**：由 use case 注入，負責事件發佈

> 推薦事件發佈責任在 use case 層，確保資料儲存與事件一致性，便於交易控制

---

## 3. 命名與型別規範

- Service input/output：`Input`/`Output` 結尾
- Use case request/response：`Request`/`Response` 結尾
- DTO 檔案：`{use-case}.dto.ts`，每個 use case 專屬
- 所有層皆嚴格型別，不可用 any
- 不同層 DTO 不可混用

---

## 4. 依賴與資料夾結構

src/
├── domains/
│       ├── application/
## 測試（Testing）

### 原則
- 每個 Domain Entity、Use Case、Service 都應有對應的單元測試。
- Infrastructure 層可用整合測試驗證與外部系統（如 DB）互動。
- 測試命名與目錄結構應與原始碼對應。

### 範例：Order Aggregate 單元測試

```ts
// tests-vitest/order/orderCore.test.ts
import { Order } from '../../src/domains/order/domain/entities/order';

describe('Order Aggregate', () => {
  it('建立訂單時，狀態應為 CREATED', () => {
    const order = Order.create({ /* ...必要參數... */ });
    expect(order.status).toBe('CREATED');
  });
});
```

---

## 文件與註解標準（Documentation & JSDoc）

### 原則
- 所有公開類別、方法、DTO 必須加上 JSDoc。
- 註解需說明用途、參數、回傳值、例外狀況。
- 文件需同步維護於 `/docs`，並與程式碼一致。

### 範例：JSDoc 註解

```ts
/**
 * 訂單聚合根
 * @class
 */
export class Order {
  /**
   * 建立訂單
   * @param input 建立訂單所需參數
   * @returns Order 實例
   */
  static create(input: CreateOrderInput): Order {
    // ...實作...
  }
}
```

---

## CQRS / 查詢分離

### 原則
- Command（寫入）與 Query（查詢）責任分離。
- Command handler 處理業務邏輯與事件，Query handler 專注於資料查詢與組裝。
- Query handler 可直接存取資料庫或 View Model，無需經過 Domain Layer。

### 範例：Order 查詢 UseCase

```ts
// src/domains/order/application/use-cases/get-order-detail.ts
/**
 * 查詢訂單明細 UseCase
 */
export class GetOrderDetailUseCase {
  constructor(private readonly orderQueryRepo: OrderQueryRepository) {}

  async execute(orderId: string): Promise<OrderDetailDto> {
    return this.orderQueryRepo.findDetailById(orderId);
  }
}
```

---
│       │   ├── service/         # Application Service
│       │   ├── use-cases/       # Use Case
│       │   └── dto/             # DTO
│       ├── domain/
│       │   ├── entities/
│       │   ├── value-objects/
│       │   ├── events/
│       │   ├── repositories/
│       │   └── services/
│       └── infrastructure/
│           └── repositories/
├── interfaces/
│   └── http/
│       └── controllers/
└── shared/

依賴方向：
controllers → use-cases → service → domain/repositories (interface) ← infrastructure/repositories
use-cases 也可依賴 shared/domain/events

---

## 5. 補充 DDD 實踐重點

- **Repository 只 expose domain entity，不 expose ORM model**
- **事件發佈統一在 use case 層**，確保交易一致性
- **所有業務方法、DTO、use case 都需 JSDoc 註解**
- **驗證、轉換、錯誤處理皆抽成 private method，便於測試與維護**
- **跨聚合協作由 Application Service 協調多個 use case/repository**

---

## 6. 範例

**Application Service 範例**
```typescript
export class OrderAppService {
  constructor(private readonly orderRepository: OrderRepository) {}
  async cancelOrder(orderId: string, cancelledBy: 'user' | 'counter') {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new Error('Order not found');
    order.cancel(cancelledBy);
    await this.orderRepository.edit(order);
    return order;
  }
}
```

**Use Case 層發佈事件範例**
```typescript
export class CancelOrderUseCase {
  constructor(
    private readonly orderAppService: OrderAppService,
    private readonly eventBus: EventBus
  ) {}
  async execute(orderId: string, cancelledBy: 'user' | 'counter') {
    const order = await this.orderAppService.cancelOrder(orderId, cancelledBy);
    for (const event of order.getDomainEvents()) {
      await this.eventBus.publish(event);
    }
    order.clearDomainEvents();
  }
}
```

**Domain Service 範例**
```typescript
export class OrderDiscountService {
  calculateDiscount(order: Order): number {
    // ...純商業規則，不存取 DB
  }
}
```
