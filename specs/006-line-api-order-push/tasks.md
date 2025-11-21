
# Tasks: LINE 推播服務（006-line-api-order-push）

**Feature 關注點**：僅聚焦於推播服務、推播記錄、推播流程與異常處理，所有訂單/用戶/狀態等皆為外部依賴。

---

## Phase 1: Setup
- [ ] T001 建立推播服務目錄結構於 src/push/
- [ ] T002 初始化 TypeScript、Vitest 於 package.json
- [ ] T003 設定推播記錄 Entity 於 src/push/domain/entities/
- [ ] T004 設計/實作 Prisma schema（僅推播記錄）於 prisma/schema.prisma

## Phase 2: 推播服務設計與實作
- [ ] T005 設計 LINE 推播 service interface 於 src/push/application/LinePushService.ts
- [ ] T006 實作 LINE 推播 service（含訊息組裝、呼叫 LINE API、錯誤處理、重試）於 src/push/application/LinePushService.ts
- [ ] T007 設計推播 service 可擴充為多通道（如 SMS、Email）於 src/push/application/
- [ ] T008 設計推播記錄儲存與查詢於 src/push/application/PushLogService.ts

## Phase 3: 推播流程介接與測試
- [ ] T009 [P] 設計推播 service 的 mock/stub 供外部（如訂單 use case）調用於 tests-vitest/push/
- [ ] T010 [P] 撰寫推播服務單元測試（含成功、失敗、重試、異常）於 tests-vitest/push/LinePushService.test.ts
- [ ] T011 [P] 撰寫推播記錄查詢單元測試於 tests-vitest/push/PushLogService.test.ts
- [ ] T012 [P] 撰寫推播服務 API 介接範例（僅 mock 訂單/用戶/狀態）於 tests-vitest/push/LinePushService.integration.test.ts

## Final Phase: Polish & Cross-Cutting
- [ ] T013 [P] 完善 API 錯誤處理與統一回應格式於 src/push/application/
- [ ] T014 [P] 文件產生與驗證於 specs/006-line-api-order-push/contracts/

---

## Dependencies
- 本 feature 僅依賴訂單/用戶/狀態等外部資料，所有資料來源皆以 mock/stub 處理，不重複設計。

## MVP 建議
- 僅完成 Phase 1~2（推播服務與記錄）即可驗證推播主流程。

## 格式驗證
- 所有任務皆符合 checklist 格式（checkbox, ID, file path）
