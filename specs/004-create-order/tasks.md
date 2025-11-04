# 任務清單：建立訂單

**說明**：本清單由 `/speckit.tasks` 指令自動產生，依據 DDD 架構與 user story 分階段、分前綴、分區塊，所有任務皆可追蹤、可平行。

## 資料庫任務（Database Tasks）
- [ ] DB001 初始化 Prisma schema 於 prisma/schema.prisma
- [ ] DB002 設計訂單、商品、用戶資料表於 prisma/schema.prisma
- [ ] DB003 建立 migration 並套用至本地資料庫於 prisma/migrations/

## API 與服務任務
- [ ] M005 [P] [US1] 訂單 API 介面約定（OpenAPI）於 specs/004-create-order/contracts/openapi.yaml
- [ ] M006 [P] [US1] 設計建立訂單 API 路由約定於 specs/004-create-order/contracts/openapi.yaml

## 測試任務

- [ ] T001 [P] [US1] 訂單 Entity 單元測試於 (tests-vitest/order/entity/order.entity.test.ts)
	- 驗證 OrderItem 欄位（id、productId、name、quantity、price）皆不可為空或不合法，否則拋出正確錯誤訊息
	- 驗證 OrderItem 的 totalPrice 計算正確
	- 訂單建立時必須有至少一項餐點，否則拋出 BusinessRuleError
	- 驗證訂單總金額計算正確
	- 驗證 setConfirm/setStartPreparation/setMarkReadyForPickup/setComplete/setFail/cancel 等狀態流轉正確，且僅允許合法狀態轉換，否則拋出 BusinessRuleError
	- 驗證 canBeCancelled 與 isInProgress 行為正確

- [ ] T002 [P] [US2] 訂單資料驗證測試於 (tests-vitest/models/productValidation.test.ts)
	- 驗證商品名稱、數量、價格等欄位驗證規則（如必填、型別、範圍）
	- 驗證不合法資料時會正確拋出錯誤

- [ ] T003 [P] [US3] 訂單通知服務測試於 (tests-vitest/order/service/orderNotificationService.test.ts)
	- 呼叫 sendOrderNotification 時，會正確呼叫 notify 並帶入訂單資訊
	- 驗證通知 payload 內容包含訂單 id、userId、狀態、items（含明細、數量、價格、totalPrice）

- [ ] T004 [US1] 訂單 UseCase 與資料庫整合測試於 (tests-vitest/order/application/createOrderUseCase.test.ts)
	- 建立訂單成功時，資料正確寫入資料庫
	- userId 為空時應丟出 'User ID is required' 錯誤
	- items 為空時應丟出 'Order must have at least one item' 錯誤

- [ ] T005 [US1] 訂單 UseCase 與資料庫整合測試於 (tests-vitest/order/application/completeOrderUseCase.test.ts)
	- 狀態流轉至可取餐後，執行完成訂單，狀態應為 '已取餐完成'

- [ ] T006 [US1] 訂單 UseCase 與資料庫整合測試於 (tests-vitest/order/application/confirmOrderUseCase.test.ts)
	- 執行確認訂單後，狀態應為 '已確認訂單'

- [ ] T007 [US1] 訂單 UseCase 與資料庫整合測試於 (tests-vitest/order/application/failOrderUseCase.test.ts)
	- 狀態為製作中時可標記失敗，狀態應為 '製作失敗'，並驗證 errorMessage

- [ ] T008 [US1] 訂單 UseCase 與資料庫整合測試於 (tests-vitest/order/application/markReadyForPickupUseCase.test.ts)
	- 狀態為製作中時可標記可取餐，狀態應為 '可取餐'

- [ ] T009 [US1] 訂單 UseCase 與資料庫整合測試於 (tests-vitest/order/application/startPreparationUseCase.test.ts)
	- 狀態為已確認訂單時可開始製作，狀態應為 '製作中'

- [ ] T010 [US1] 訂單 UseCase 與資料庫整合測試於 (tests-vitest/order/application/cancelOrderUseCase.test.ts)
	- 狀態為已點餐/已確認訂單時可取消，狀態應為 '已取消'，cancelledBy 正確

- [ ] T011 [US1] 訂單 UseCase 與資料庫整合測試於 (tests-vitest/order/application/getOrderDetailQuery.test.ts)
	- 建立後可查詢訂單明細，驗證 orderId、items、totalAmount 等欄位正確
	- 查詢不存在訂單時回傳 null

- [ ] T012 [US1] 訂單服務層測試於 (tests-vitest/order/service/orderService.test.ts)
	- AppService 建立訂單時，userId 或 items 不合法會拋出正確錯誤
	- 建立訂單時 repository.create 會被呼叫，資料正確

- [ ] T013 [US1] 狀態機服務測試於 (tests-vitest/order/service/orderStateMachineService.test.ts)
	- 驗證所有合法狀態轉換皆可通過
	- 驗證所有非法狀態轉換皆會拋出 BusinessRuleError
	- 驗證 getAvailableTransitions 回傳正確下一步
	- 驗證 canBeCancelled 只允許特定狀態
	- 驗證 isInProgress 判斷正確

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
