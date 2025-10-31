---
---
# 任務清單：點餐系統流程
# Tasks: 001-order-system-flow
**說明**：本文件由 `/speckit.tasks` 指令自動產生，支援多前綴（DB/M/T/D）與分區塊。
所有任務皆可獨立追蹤、平行執行，並明確標註 user story、依賴、MVP 與實作策略。
**說明**：本清單依 speckit 多前綴分區塊模板自動產生，所有任務皆可獨立追蹤、平行執行，並明確標註 user story、依賴、MVP 與實作策略。

## Database Tasks
- [ ] DB001 設計與建立 User、Order、Item、Status 資料表（prisma/schema.prisma）
- [ ] DB002 撰寫 migration 建立初始 schema（prisma/migrations/）
- [ ] DB003 [P] 撰寫訂單狀態流轉驗證（src/models/orderStateMachine.ts）

## API 與服務 Tasks
- [ ] M001 [P] [US1] 實作用戶下單 API（src/routes/order.ts）
- [ ] M002 [P] [US2] 實作櫃檯確認訂單 API（src/routes/order.ts）
- [ ] M003 [P] [US3] 實作廚房接單與狀態推進 API（src/routes/order.ts）
- [ ] M004 [P] [US4] 實作訂單完成與取餐 API（src/routes/order.ts）
- [ ] M005 [P] [US1] 實作訂單狀態查詢 API（src/routes/order.ts）
- [ ] M006 [P] [US2] 實作訂單取消 API（src/routes/order.ts）
- [ ] M007 [P] [US3] 實作異常/失敗狀態處理（src/services/orderCore.ts）

## 測試 Tasks
- [ ] T001 [P] [US1] 撰寫用戶下單 API 單元測試（tests/orderCore.test.ts）
	- 驗證用戶下單時訂單狀態、明細、金額正確。
	- 驗證訂單建立後資料正確寫入資料庫。
	- 驗證異常下單流程會正確拋出例外。
- [ ] T002 [P] [US2] 撰寫櫃檯確認訂單 API 測試（tests/orderCore.test.ts）
	- 驗證櫃檯可正確確認訂單，狀態正確轉換。
	- 驗證確認失敗時會拋出例外。
- [ ] T003 [P] [US3] 撰寫廚房接單與狀態推進 API 測試（tests/orderCore.test.ts）
	- 驗證廚房可正確接單並推進訂單狀態。
	- 驗證狀態推進流程異常時會拋出例外。
- [ ] T004 [P] [US4] 撰寫訂單完成與取餐 API 測試（tests/orderCore.test.ts）
	- 驗證訂單完成與取餐流程正確。
	- 驗證取餐失敗時會拋出例外。
- [ ] T005 [P] 撰寫訂單狀態流轉與異常測試（tests/orderCore.test.ts）
	- 驗證訂單狀態流轉正確，異常狀態時會拋出例外。

## 文件與同步 Tasks
- [ ] D001 補充 data-model.md 與 API 文件（specs/001-order-system-flow/data-model.md, contracts/openapi.yaml）
- [ ] D002 補充 quickstart.md 測試流程（specs/001-order-system-flow/quickstart.md）
- [ ] D003 補充 research.md 決策紀錄（specs/001-order-system-flow/research.md）
- [ ] D004 補充 tasks.md 與任務追蹤（specs/001-order-system-flow/tasks.md）

---

## 依賴關係
- DB001 → DB002
- DB002 → DB003, M001-M007
- M001 → T001, M005 → T005
- M002 → T002
- M003 → T003, M007
- M004 → T004
- M006 → T005
- 所有 Txxx → D001, D002, D003, D004

## 平行執行建議
- DB003, M001-M007, T001-T005 皆可於 schema/migration 完成後平行開發
- 測試 Tasks 皆可平行

## MVP 範圍
- DB001-DB002, M001, T001, D001

## 實作策略
- 先完成 schema/migration 與下單/查詢 API 骨架，逐步補齊狀態流轉、異常處理、測試與文件

---
