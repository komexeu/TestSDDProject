# 任務清單：建立訂單

**說明**：本清單由 `/speckit.tasks` 指令自動產生，依據 DDD 架構與 user story 分階段、分前綴、分區塊，所有任務皆可追蹤、可平行。

## 資料庫任務（Database Tasks）
- [ ] DB001 初始化 Prisma schema 於 prisma/schema.prisma
- [ ] DB002 設計訂單、商品、用戶資料表於 prisma/schema.prisma
- [ ] DB003 建立 migration 並套用至本地資料庫於 prisma/migrations/

## API 與服務任務
- [ ] M001 [P] [US1] 建立 Order Entity 於 src/domains/order/domain/entities/order.ts
- [ ] M002 [P] [US1] 建立 Order Repository 介面於 src/domains/order/domain/repositories/orderRepository.ts
- [ ] M003 [P] [US1] 建立 Order Service 於 src/domains/order/domain/services/orderService.ts
- [ ] M004 [P] [US1] 建立 CreateOrder Use Case 於 src/domains/order/application/use-cases/createOrderUseCase.ts
- [ ] M005 [P] [US1] 建立 Order Controller 於 src/interfaces/http/controllers/orderController.ts
- [ ] M006 [P] [US1] 設計建立訂單 API 路由於 src/interfaces/http/routes/orderRoutes.ts
- [ ] M007 [P] [US2] 設計訂單資料驗證邏輯於 src/models/productValidation.ts
- [ ] M008 [P] [US3] 設計訂單建立成功通知服務於 src/domains/order/domain/services/orderNotificationService.ts

## 測試任務

- [ ] T001 [P] [US1] 建立訂單單元測試於 (tests-vitest/order/orderCore.test.ts)
	- 驗證訂單建立時狀態、明細、金額正確
	- 驗證訂單狀態流轉（如：已點餐→已確認→製作中→可取餐→已取餐完成）
	- 驗證異常流程（如：狀態錯誤時拋出例外）

- [ ] T002 [P] [US2] 訂單資料驗證測試於 (tests-vitest/models/productValidation.test.ts)
	- 驗證商品名稱、數量、價格等欄位驗證規則
	- 驗證不合法資料時會正確拋出錯誤

- [ ] T003 [P] [US3] 訂單通知服務測試於 (tests-vitest/order/orderNotification.test.ts)
	- 驗證訂單建立後會正確發送通知
	- 驗證通知內容正確（如：訂單編號、狀態、用戶資訊）

- [ ] T004 [US1] 建立訂單時，資料會正確寫入資料庫，並可查詢驗證（含訂單主檔與明細）
- [ ] T005 [US1] 建立訂單 API 整合測試，驗證前後端串接流程與資料正確性

## 文件與同步任務
- [ ] D001 補充 API 文件於 specs/004-create-order/contracts/openapi.yaml
- [ ] D002 撰寫 quickstart 指南於 specs/004-create-order/quickstart.md
- [ ] D003 補充 data-model 文件於 specs/004-create-order/data-model.md

---

## 依賴關係
- DB001 → DB002
- DB002 → DB003
- DB003 → M001, M002, M003, M004, M005, M006, M007, M008
- M001, M002, M003, M004, M005, M006, M007, M008 → T001, T002, T003
- T001, T002, T003 → D001, D002, D003

## 平行執行建議
- API／服務與測試任務內 [P] 任務可平行

## MVP 範圍
- DB001-DB003, M001-M006, T001

## 實作策略
- 先完成 schema/migration 與 API 骨架，逐步補齊驗證、測試與文件
