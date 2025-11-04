# 測試（Testing）

## 專案測試資料夾結構（對應架構分層）

```
src/
  └─ domains/
      ├─ order/            # 訂單領域程式碼
      ├─ inventory/        # 庫存領域程式碼
      └─ product/          # 商品領域程式碼

tests-vitest/
  ├─ order/
  │    ├─ application/     # Use Case / Application Service 單元 & 整合測試
  │    ├─ entity/          # 聚合根 / 實體 測試（純 domain 邏輯）
  │    ├─ service/         # Domain Service 測試（商業規則）
  │    └─ ...
  ├─ inventory/            # 依領域劃分，相同模式
  ├─ product/              # 依領域劃分，相同模式
  ├─ models/               # 共用驗證或獨立 model 測試
  ├─ vitest.setup.ts       # 全域測試初始化（環境參數 / 擴充 matcher）
  └─ README.md             # 測試目錄使用說明
```

> 測試檔案以功能/領域分類，命名規則為 `xxx.test.ts`，並與 src/ 結構對應，利於維護與查找。

## 目標
確保各層邏輯正確、可維護，並能快速發現回歸錯誤。

## 測試類型與範圍
| 類型 | 目標 | 依賴處理 | 範例 | 何時失敗代表? |
|------|------|----------|------|----------------|
| Unit | 單一類別/函式純邏輯 | 全部 mock / stub | Domain Entity 狀態轉換 | 商業規則或不變條件被破壞 |
| Integration | 應用流程協作 | 真實 Repository + in-memory/mock 事件 | Use Case 執行（CreateOrder）| 流程中斷或資料持久化異常 |
| Contract（選配） | 介面對外約定 | 用錄製的範例/Schema 驗證 | OpenAPI Response 驗證 | 對外格式改變造成相容性問題 |
| E2E（未來加入） | 全流程（HTTP/API） | 真實 DB + 啟動 Web | 下單 -> 查詢 -> 狀態改變 | 使用者路徑壞掉 |

> 目前專案聚焦 Unit + Integration；E2E 可於後期加入 Playwright / Supertest。

### Use Case 測試準則
1. 不測 ORM 細節（交給 Integration）
2. 驗證：輸入合法性、狀態轉換、副作用（事件、Repository 呼叫次數）
3. Mock 只限：`EventBus`、跨服務呼叫、外部 API

### Domain Entity 測試準則
1. 僅測行為（方法）與不變條件（Invariant）
2. 不存取資料庫、不依賴外部服務

### Repository 測試（Integration）
1. 使用 Docker PostgreSQL + Prisma schema
2. 針對 CRUD 與查詢語意（過濾、排序）

## Docker + 資料庫測試策略
專案使用 `docker-compose.yml` 啟動兩個 PostgreSQL：
```
postgres       → 本地開發資料庫（:5432）
postgres-test  → 測試隔離資料庫（:5433）
```

建議流程：
1. 啟動容器：`docker compose up -d postgres-test`
2. 設定測試環境變數（於 `.env.test` 指向 `postgres-test` 連線）
3. 在測試前執行：`npx prisma migrate deploy`（已包含於 `npm test` 腳本）
4. 測試過程：每個測試檔案可透過 transaction 或 fixtures 控制資料隔離
5. 若需重置：`npm run resetDb`（注意會清空資料）

### 資料重置建議
- 單元測試：不需 DB，使用 in-memory
- 整合測試：測試檔 `beforeEach` 清理使用的資料表（避免全庫 truncate 影響效能）
- 可建立共用 helper：`clearTables(['orders','order_items'])`

## 命名規範
- 測試檔尾碼：`*.test.ts`
- Use Case：`createOrderUseCase.test.ts`（動詞 + 目標 + UseCase）
- Domain Entity：`order.entity.test.ts`
- Service：`orderDiscountService.test.ts`
- 若測試分類多層：`<domain>/<layer>/<target>.test.ts`

## Mock 原則
- 僅針對不可控或成本高的依賴（外部 API、事件匯流排、第三方 SDK）
- 不 mock 自己的 domain entity / value object
- Repository 在 Unit 測試階段可用簡易 stub（回傳預期聚合根），Integration 則用真實實作

## 執行與指令
`package.json` scripts：
| 指令 | 說明 |
|------|------|
| `npm test` | 以 `.env.test` 啟動，部署 migration，執行全部測試（非 watch）|
| `npm run test:watch` | 開啟 watch 模式，適合開發迭代 |
| `npm run test:ui` | 啟動 Vitest UI（瀏覽器視覺化）|
| `npm run resetDb` | 重置資料庫（慎用）|

### 建議新增（後續可考慮）
| 指令 | 功能 |
|------|------|
| `npm run test:integration` | 僅執行整合測試（可用檔名規則過濾）|
| `npm run test:unit` | 僅執行單元測試 |

## 快速檢查清單（Review Checklist）
- 測試是否僅有一個明確斷言主題（Arrange-Act-Assert 清晰）
- 是否避免過度 mock（mock 數量 >3 需檢視設計）
- 是否覆蓋主要狀態轉換與錯誤情境（例：建立訂單、重複建立、無效輸入）
- DB 整合測試是否僅驗證持久化與查詢語意，不測 Domain 細節

## Coverage 策略
目標：關鍵領域（訂單流程）行為邏輯 >85%，基礎結構（repository plumbing）適度即可。避免為追求數字而編寫低價值測試。

---

## 範例：Order UseCase 單元測試
```ts
// 範例：CreateOrder Use Case 單元測試（只展示核心 Arrange/Act/Assert）
// tests-vitest/order/application/createOrderUseCase.test.ts
import { CreateOrderUseCase } from '@/domains/order/application/use-cases/createOrderUseCase';
import { InMemoryOrderRepository } from '../doubles/inMemoryOrderRepository';
import { FakeEventBus } from '../doubles/fakeEventBus';

describe('CreateOrderUseCase', () => {
  it('建立訂單成功時應發佈 OrderCreated 事件', async () => {
    const repo = new InMemoryOrderRepository();
    const eventBus = new FakeEventBus();
    const useCase = new CreateOrderUseCase(repo, eventBus);
    const input = { customerId: 'c1', items: [{ productId: 'p1', qty: 2 }] };
    const order = await useCase.execute(input);
    expect(order.id).toBeTruthy();
    expect(eventBus.published).toContainEqual(expect.objectContaining({ type: 'OrderCreated' }));
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