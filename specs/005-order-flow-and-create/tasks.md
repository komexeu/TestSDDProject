
# 任務清單：點餐流程與建立訂單（合併 001/004 樣式）

**說明**：本清單整合 001/004 任務格式，分區塊、前綴、可追蹤、明確 user story 與依賴。

## Database Tasks
- [ ] DB001 設計與建立 User、Order、Item、Status 資料表（prisma/schema.prisma）
- [ ] DB002 撰寫 migration 建立初始 schema（prisma/migrations/）
- [ ] DB003 設計訂單狀態流轉驗證（src/models/orderStateMachine.ts）
- [ ] DB004 設計商品庫存同步與驗證（src/models/product.ts）

## API 與服務 Tasks
- [ ] M001 [US1] 實作用戶下單 API（src/routes/order.ts）
- [ ] M002 [US2] 實作櫃檯確認訂單 API（src/routes/order.ts）
- [ ] M003 [US3] 實作廚房接單與狀態推進 API（src/routes/order.ts）
- [ ] M004 [US4] 實作訂單完成與取餐 API（src/routes/order.ts）
- [ ] M005 [US1] 訂單 API 介面約定（OpenAPI）（contracts/openapi.yaml）
- [ ] M006 [US1] 設計建立訂單 API 路由約定（contracts/openapi.yaml）
- [ ] M007 [US2] 訂單資料驗證與異常處理（src/models/orderValidation.ts）
- [ ] M008 [US3] 訂單建立成功後通知服務（src/services/orderNotificationService.ts）
- [ ] M009 [US4] 付款失敗與重複送單處理（src/services/orderService.ts）

## 測試 Tasks
- [ ] T001 [US1] 訂單 Entity 單元測試（tests-vitest/order/entity/order.entity.test.ts）
- 驗證重點：
	- OrderItem 欄位（id、productId、name、quantity、price）皆不可為空或不合法，否則拋出正確錯誤訊息
	- OrderItem 的 totalPrice 計算正確
	- 訂單建立時必須有至少一項餐點，否則拋出 BusinessRuleError
	- 訂單總金額計算正確
	- 狀態流轉 setConfirm/setStartPreparation/setMarkReadyForPickup/setComplete/setFail/cancel 僅允許合法轉換
	- canBeCancelled 與 isInProgress 行為正確
- [ ] T002 [US2] 訂單資料驗證測試（tests-vitest/models/productValidation.test.ts）
- 驗證重點：
	- 商品名稱、數量、價格等欄位驗證規則（如必填、型別、範圍）
	- 不合法資料時正確拋出錯誤
- [ ] T003 [US3] 訂單通知服務測試（tests-vitest/order/service/orderNotificationService.test.ts）
- 驗證重點：
	- 呼叫 sendOrderNotification 時，會正確呼叫 notify 並帶入訂單資訊
	- 通知 payload 內容包含訂單 id、userId、狀態、items（含明細、數量、價格、totalPrice）
- [ ] T004 [US1] 訂單 UseCase 與資料庫整合測試（tests-vitest/order/application/createOrderUseCase.test.ts）
- 驗證重點：
	- 建立訂單成功時，資料正確寫入資料庫
	- userId 為空時應丟出 'User ID is required' 錯誤
	- items 為空時應丟出 'Order must have at least one item' 錯誤
- [ ] T005 [US1] 訂單 UseCase 與資料庫整合測試（tests-vitest/order/application/completeOrderUseCase.test.ts）
- 驗證重點：
	- 狀態流轉至可取餐後，執行完成訂單，狀態應為 '已取餐完成'
- [ ] T006 [US1] 訂單 UseCase 與資料庫整合測試（tests-vitest/order/application/confirmOrderUseCase.test.ts）
- 驗證重點：
	- 執行確認訂單後，狀態應為 '已確認訂單'
- [ ] T007 [US1] 訂單 UseCase 與資料庫整合測試（tests-vitest/order/application/failOrderUseCase.test.ts）
- 驗證重點：
	- 狀態為製作中時可標記失敗，狀態應為 '製作失敗'，並驗證 errorMessage
- [ ] T008 [US1] 訂單 UseCase 與資料庫整合測試（tests-vitest/order/application/markReadyForPickupUseCase.test.ts）
- 驗證重點：
	- 狀態為製作中時可標記可取餐，狀態應為 '可取餐'
- [ ] T009 [US1] 訂單 UseCase 與資料庫整合測試（tests-vitest/order/application/startPreparationUseCase.test.ts）
- 驗證重點：
	- 狀態為已確認訂單時可開始製作，狀態應為 '製作中'
- [ ] T010 [US1] 訂單 UseCase 與資料庫整合測試（tests-vitest/order/application/cancelOrderUseCase.test.ts）
- 驗證重點：
	- 狀態為已點餐/已確認訂單時可取消，狀態應為 '已取消'，cancelledBy 正確
- [ ] T011 [US1] 訂單 UseCase 與資料庫整合測試（tests-vitest/order/application/getOrderDetailQuery.test.ts）
- 驗證重點：
	- 建立後可查詢訂單明細，驗證 orderId、items、totalAmount 等欄位正確
	- 查詢不存在訂單時回傳 null
- [ ] T012 [US1] 訂單服務層測試（tests-vitest/order/service/orderService.test.ts）
- 驗證重點：
	- AppService 建立訂單時，userId 或 items 不合法會拋出正確錯誤

# API 整合測試
- [ ] T013 [API] 訂單 API 全流程整合測試（tests-vitest/order/routes/order-api.test.ts）
	- 驗證下單、查詢、狀態流轉、取消、異常等 API 行為
	- 驗證回傳格式、HTTP 狀態碼、錯誤訊息

# 權限測試
- [ ] T014 [權限] 訂單 API 權限測試（tests-vitest/order/routes/order-auth.test.ts）
	- 驗證不同角色（用戶/櫃檯/廚房/未登入）對 API 的存取權限
	- 權限不足時應回傳 403

# 高併發/效能/邊界測試
- [ ] T015 [高併發] 訂單高併發測試（tests-vitest/order/concurrency/order-concurrency.test.ts）
	- 多用戶同時下單、同時取消，驗證資料一致性與無競態
- [ ] T016 [效能] 訂單效能測試（tests-vitest/order/performance/order-performance.test.ts）
	- 大量下單/查詢/狀態流轉，驗證 5 秒內完成
- [ ] T017 [邊界] 訂單邊界條件測試（tests-vitest/order/edge-cases/order-edge-cases.test.ts）
	- 商品庫存為 0、金額超上限、資料缺漏、重複送單、付款失敗等

# E2E 測試
- [ ] T018 [E2E] 訂單端對端測試（tests-vitest/e2e/order-e2e.test.ts）
	- 模擬用戶從下單到取餐全流程，驗證所有狀態與通知

# 錯誤/異常/安全性測試
- [ ] T019 [異常] 訂單 API 錯誤與異常測試（tests-vitest/order/routes/order-error.test.ts）
	- 非法請求、資料庫錯誤、系統異常時的回應與日誌
- [ ] T020 [安全] 訂單 API 安全性測試（tests-vitest/order/routes/order-security.test.ts）
	- SQL injection、XSS、未授權存取等安全情境

## 文件與同步 Tasks
- [ ] D001 補充 data-model.md 與 API 文件（data-model.md, contracts/openapi.yaml）
- [ ] D002 補充 quickstart.md 測試流程（quickstart.md）
- [ ] D003 補充 research.md 決策紀錄（research.md）
- [ ] D004 補充 tasks.md 與任務追蹤（tasks.md）

---

## 依賴關係
- DB001 → DB002
- DB002 → DB003, DB004, M001-M009
- M001 → T001, T004, M005 → T011
- M002 → T002, M003 → T003, M009
- M004 → T005
- M006 → T010
- 所有 Txxx → D001, D002, D003, D004

## 平行執行建議
- DB003, DB004, M001-M009, T001-T012 皆可於 schema/migration 完成後平行開發
- 測試 Tasks 皆可平行

---

> 本文件為 005 合併規格之任務清單，依 001/004 樣式整理，請依實際需求補充。
