# tasks.md

---
description: "Task list for 003-inventory-feature (多前綴分區塊)"
---

## 任務清單：庫存功能

**說明**：本清單依 speckit 多前綴分區塊模板自動產生，所有任務皆可獨立追蹤、平行執行，並明確標註 user story、依賴、MVP 與實作策略。
**說明**：本文件由 `/speckit.tasks` 指令自動產生，支援多前綴（DB/M/T/D）與分區塊。

## Database Tasks
- [ ] DB001 設計與建立 Product 資料表（prisma/schema.prisma）
- [ ] DB002 設計與建立 InventoryLog 資料表（prisma/schema.prisma）
- [ ] DB003 撰寫 migration 建立初始 schema（prisma/migrations/）
- [ ] DB004 [P] 撰寫商品資料唯一性驗證（src/models/productValidation.ts）

## API 與服務 Tasks
- [ ] M001 [P] [US1] 實作查詢商品庫存 API（src/routes/inventory.ts）
- [ ] M002 [P] [US2] 實作手動調整庫存 API（src/routes/inventory.ts）
- [ ] M003 [P] [US3] 實作銷售自動扣庫存 API（src/routes/inventory.ts）
- [ ] M004 [P] [US1] 實作查詢庫存異動紀錄 API（src/routes/inventory.ts）
- [ ] M005 [P] [US3] 實作高併發下庫存原子扣減邏輯（src/services/inventoryService.ts）
- [ ] M006 [P] [US2] 實作庫存調整權限驗證（src/middleware/auth.ts）
- [ ] M007 [P] [US3] 實作超賣防護與錯誤處理（src/services/inventoryService.ts）

## 測試 Tasks
- [ ] T001 [P] [US1] 撰寫商品庫存查詢 API 單元測試（tests/inventory/inventory-stock.test.ts）
- [ ] T002 [P] [US2] 撰寫庫存調整 API 單元測試（tests/inventory/inventory-adjust.test.ts）
- [ ] T003 [P] [US3] 撰寫銷售自動扣庫存 API 單元測試（tests/inventory/inventory-sale.test.ts）
- [ ] T004 [P] [US3] 撰寫高併發下超賣防護測試（tests/inventory/inventory-concurrency.test.ts）
- [ ] T005 [P] [US3] 撰寫庫存異常錯誤處理測試（tests/inventory/inventory-stock.test.ts）
- [ ] T006 [P] [US1] 撰寫庫存異動紀錄查詢 API 測試（tests/inventory/inventory-logs.test.ts）

## 文件與同步 Tasks
- [ ] D001 補充 data-model.md 與 API 文件（specs/003-inventory-feature/data-model.md, contracts/openapi.yaml）
- [ ] D002 補充 quickstart.md 測試流程（specs/003-inventory-feature/quickstart.md）
- [ ] D003 補充 research.md 決策紀錄（specs/003-inventory-feature/research.md）
- [ ] D004 補充 tasks.md 與任務追蹤（specs/003-inventory-feature/tasks.md）

---

## 依賴關係
- DB001 → DB002 → DB003
- DB003 → DB004, M001, M002, M003, M004
- M001 → T001, M004 → T006
- M002 → T002, M006
- M003 → T003, M005, M007
- M005, M007 → T004, T005
- 所有 Txxx → D001, D002, D003, D004

## 平行執行建議
- DB004, M001-M007, T001-T006 皆可於 schema/migration 完成後平行開發
- 測試 Tasks 皆可平行

## MVP 範圍
- DB001-DB003, M001, T001, D001

## 實作策略
- 先完成 schema/migration 與查詢 API 骨架，逐步補齊調整、銷售、異動紀錄、權限與高併發防護，最後補齊測試與文件

---
