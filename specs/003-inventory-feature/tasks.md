
# tasks.md

- [X] T001 建立/驗證 Prisma schema，新增 Product.stock 欄位與 InventoryLog 資料表（src/prisma/schema.prisma）
- [ ] T002 撰寫 migration 腳本，建立/更新資料表（prisma/migrations/）
- [ ] T003 [P] 實作查詢商品庫存 API (GET /api/inventory/{productId})（src/routes/inventory.ts）
- [ ] T004 [P] 實作查詢庫存異動紀錄 API (GET /api/inventory/{productId}/logs)（src/routes/inventory.ts）
- [ ] T005 [P] [US2] 實作手動調整商品庫存 API (POST /api/inventory/{productId}/adjust)（src/routes/inventory.ts）
- [ ] T006 [US3] 實作銷售自動扣庫存 API (POST /api/inventory/sale)（src/routes/inventory.ts）
- [ ] T007 [P] 撰寫庫存操作驗證邏輯（不可負數、異動必寫入 InventoryLog）（src/services/inventoryService.ts）
- [ ] T008 [P] 撰寫高併發防超賣測試（Jest）（tests/inventory-concurrency.test.ts）
- [ ] T009 撰寫 API 單元與整合測試（tests/inventory-api.test.ts）
- [ ] T010 文件補全與 quickstart.md 更新（specs/003-inventory-feature/quickstart.md）
- [ ] T011 撰寫查詢庫存 API 正常/異常單元測試（tests/inventory-stock.test.ts）
- [ ] T012 撰寫調整庫存 API 正常/異常單元測試（tests/inventory-adjust.test.ts）
- [ ] T013 撰寫異動紀錄 API 單元測試（tests/inventory-logs.test.ts）
- [ ] T014 撰寫銷售自動扣庫存 API 正常/異常/高併發測試（tests/inventory-sale.test.ts）
- [ ] T015 撰寫權限控管測試（tests/inventory-auth.test.ts）
- [ ] T016 撰寫 API 效能壓力測試（tests/inventory-performance.test.ts）
- [ ] T017 實作 API 權限驗證（src/middleware/auth.ts）
- [ ] T018 撰寫權限驗證單元測試（tests/inventory-auth.test.ts）

## 依賴關係
- T001 → T002
- T002 → T003, T004, T005, T006
- T003, T004, T005, T006 → T007, T008, T009
- T007, T008, T009 → T010

## 平行執行建議
- T003, T004, T005 可平行（不同 API）
- T007, T008, T009 可平行（測試/驗證）

## MVP 範圍
- T001-T006

## 實作策略
- 先完成 schema/migration 與 API 骨架，逐步補齊驗證、測試與文件
