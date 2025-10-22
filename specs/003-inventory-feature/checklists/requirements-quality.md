# 庫存功能需求品質檢查清單

> 目的：本清單用於檢查「庫存功能」相關規格文件（spec.md、plan.md、tasks.md）之需求撰寫品質，確保其完整性、明確性、一致性、可驗證性與涵蓋性。每一項皆為「需求單元測試」，僅針對規格本身，不檢查實作。
> 
> 建立日期：2025-10-22

---

## Requirement Completeness
- [ ] CHK001 是否明確列出所有主要功能需求（查詢、調整、銷售自動扣庫存、異動紀錄）？[Completeness, Spec §Functional Requirements]
- [ ] CHK002 是否針對高併發下「不可超賣」有明確需求描述？[Completeness, Spec §User Story 3]
- [ ] CHK003 是否規範所有異動皆需有操作紀錄（含時間、操作者、前後數量、原因）？[Completeness, Spec §Functional Requirements]
- [ ] CHK004 是否明確定義權限控管需求（哪些角色可查詢/調整/操作）？[Completeness, Gap]

## Requirement Clarity
- [ ] CHK005 「即時」或「高併發」等詞彙是否有具體定義或量化標準？[Clarity, Ambiguity, Spec §User Story 3]
- [ ] CHK006 「不可超賣」的判斷標準是否明確（如同時多單處理時的行為）？[Clarity, Spec §User Story 3]
- [ ] CHK007 「異動紀錄」需包含哪些欄位是否明確列舉？[Clarity, Spec §Functional Requirements]

## Requirement Consistency
- [ ] CHK008 查詢、調整、銷售等需求描述是否在不同段落間無矛盾？[Consistency, Spec §User Stories]
- [ ] CHK009 權限控管描述是否與 API 設計、測試任務一致？[Consistency, tasks.md]

## Acceptance Criteria Quality
- [ ] CHK010 是否每個 User Story/功能皆有可驗證的驗收條件？[Acceptance Criteria, Spec §User Scenarios]
- [ ] CHK011 驗收條件是否涵蓋正常、異常、邊界（如負數、超賣）情境？[Acceptance Criteria, Coverage, Spec §User Scenarios]

## Scenario Coverage
- [ ] CHK012 是否涵蓋多筆同時銷售（高併發）情境？[Coverage, Spec §User Story 3]
- [ ] CHK013 是否涵蓋查無商品、負數調整等例外情境？[Coverage, Spec §User Story 1,2]
- [ ] CHK014 是否規範異常/失敗時的回應與限制（如禁止負庫存、超賣）？[Coverage, Spec §User Story 2,3]

## Edge Case Coverage
- [ ] CHK015 是否明確定義所有異常/邊界條件（如負庫存、查無商品、同時多單）？[Edge Case, Spec §User Scenarios]

## Non-Functional Requirements
- [ ] CHK016 是否有明確的效能需求（如查詢/調整/銷售 API 反應時間、併發量）？[Non-Functional, Gap]
- [ ] CHK017 是否有資安/權限相關需求（如 API 權限、操作紀錄防竄改）？[Non-Functional, Gap]

## Dependencies & Assumptions
- [ ] CHK018 是否明確列出外部依賴（如商品資料來源、認證系統）？[Dependency, Gap]
- [ ] CHK019 是否有假設條件（如資料一致性、時鐘同步）並明確說明？[Assumption, Gap]

## Ambiguities & Conflicts
- [ ] CHK020 是否有未定義或模糊詞彙（如「即時」、「高併發」）需澄清？[Ambiguity, Spec §User Story 3]
- [ ] CHK021 是否有潛在需求衝突（如權限描述與 API 設計不一致）？[Conflict, tasks.md]

---

> 本清單僅針對「需求文件」品質進行檢查，每次執行皆產生新檔案，請依需求面向逐項審查。
