---
---
# 任務清單：後台商品管理
# Tasks: 002-admin-product-management
**說明**：本文件由 `/speckit.tasks` 指令自動產生，支援多前綴（DB/M/T/D）與分區塊。
所有任務皆可獨立追蹤、平行執行，並明確標註 user story、依賴、MVP、策略。
**說明**：本清單依 speckit 多前綴分區塊模板自動產生，所有任務皆可獨立追蹤、平行執行，並明確標註 user story、依賴、MVP 與實作策略。

## Database Tasks
- [ ] DB001 設計與建立 Product 資料表（prisma/schema.prisma）
- [ ] DB002 撰寫 migration 建立初始 schema（prisma/migrations/）
- [ ] DB003 [P] 撰寫商品名稱唯一性驗證（src/models/productValidation.ts）

## API 與服務 Tasks
- [ ] M001 [P] [US1] 實作商品新增 API（src/routes/product.ts）
- [ ] M002 [P] [US2] 實作商品編輯 API（src/routes/product.ts）
- [ ] M003 [P] [US3] 實作商品刪除 API（src/routes/product.ts）
- [ ] M004 [P] [US4] 實作商品查詢/排序/篩選 API（src/routes/product.ts）
- [ ] M005 [P] [US1] 實作商品資料驗證（src/models/productValidation.ts）
- [ ] M006 [P] [US1] 實作商品權限驗證（src/middleware/auth.ts）

## 測試 Tasks
- [ ] T001 [P] [US1] 撰寫商品新增 API 單元測試（tests/models/productValidation.test.ts）
- [ ] T002 [P] [US2] 撰寫商品編輯 API 測試（tests/models/productValidation.test.ts）
- [ ] T003 [P] [US3] 撰寫商品刪除 API 測試（tests/models/productValidation.test.ts）
- [ ] T004 [P] [US4] 撰寫商品查詢/排序/篩選 API 測試（tests/models/productValidation.test.ts）
- [ ] T005 [P] 撰寫商品資料驗證與權限測試（tests/models/productValidation.test.ts）

## 文件與同步 Tasks
- [ ] D001 補充 data-model.md 與 API 文件（specs/002-admin-product-management/data-model.md, contracts/openapi.yaml）
- [ ] D002 補充 quickstart.md 測試流程（specs/002-admin-product-management/quickstart.md）
- [ ] D003 補充 research.md 決策紀錄（specs/002-admin-product-management/research.md）
- [ ] D004 補充 tasks.md 與任務追蹤（specs/002-admin-product-management/tasks.md）

---

## 依賴關係
- DB001 → DB002
- DB002 → DB003, M001-M006
- M001 → T001, M005 → T005
- M002 → T002
- M003 → T003
- M004 → T004
- M006 → T005
- 所有 Txxx → D001, D002, D003, D004

## 平行執行建議
- DB003, M001-M006, T001-T005 皆可於 schema/migration 完成後平行開發
- 測試 Tasks 皆可平行

## MVP 範圍
- DB001-DB002, M001, T001, D001

## 實作策略
- 先完成 schema/migration 與商品新增/查詢 API 骨架，逐步補齊編輯、刪除、驗證、權限、測試與文件

---
