# 後台商品管理需求品質檢查清單

> 目的：本清單用於檢查「後台商品管理」相關規格文件（spec.md、plan.md、tasks.md）之需求撰寫品質，確保其完整性、明確性、一致性、可驗證性與涵蓋性。每一項皆為「需求單元測試」，僅針對規格本身，不檢查實作。
> 
> 建立日期：2025-10-22

---

## Requirement Completeness
- [ ] CHK001 是否明確列出所有主要功能需求（新增、編輯、刪除、查詢、排序、篩選）？[Completeness, Spec §功能需求]
- [ ] CHK002 是否規範商品資料必填欄位（名稱、描述、售價）？[Completeness, Spec §功能需求]
- [ ] CHK003 是否明確規定商品名稱唯一、售價為新台幣整數且不可為負？[Completeness, Spec §功能需求, 假設]
- [ ] CHK004 是否明確定義權限控管需求（僅管理員可操作）？[Completeness, Gap]

## Requirement Clarity
- [ ] CHK005 「售價」的型別、單位、範圍是否有具體定義？[Clarity, Spec §Clarifications]
- [ ] CHK006 「名稱唯一」的判斷標準是否明確（如全字比對、忽略空白/大小寫）？[Clarity, Gap]
- [ ] CHK007 「排序」、「篩選」的規則是否明確列舉？[Clarity, Gap]

## Requirement Consistency
- [ ] CHK008 新增、編輯、刪除、查詢等需求描述是否在不同段落間無矛盾？[Consistency, Spec §User Stories]
- [ ] CHK009 權限控管描述是否與 API 設計、測試任務一致？[Consistency, tasks.md]

## Acceptance Criteria Quality
- [ ] CHK010 是否每個 User Story/功能皆有可驗證的驗收條件？[Acceptance Criteria, Spec §User Scenarios]
- [ ] CHK011 驗收條件是否涵蓋正常、異常、邊界（如重複名稱、負數售價）情境？[Acceptance Criteria, Coverage, Spec §User Scenarios]

## Scenario Coverage
- [ ] CHK012 是否涵蓋商品新增、編輯、刪除、查詢、排序、篩選等主要情境？[Coverage, Spec §User Stories]
- [ ] CHK013 是否涵蓋重複名稱、負數售價、缺漏欄位等例外情境？[Coverage, Spec §User Stories, 假設]
- [ ] CHK014 是否規範異常/失敗時的回應與限制（如禁止重複名稱、負數售價）？[Coverage, Spec §功能需求]

## Edge Case Coverage
- [ ] CHK015 是否明確定義所有異常/邊界條件（如重複名稱、負數售價、缺漏欄位）？[Edge Case, Spec §User Scenarios]

## Non-Functional Requirements
- [ ] CHK016 是否有明確的效能需求（如查詢/異動 API 反應時間、商品數量上限）？[Non-Functional, Gap]
- [ ] CHK017 是否有資安/權限相關需求（如 API 權限、資料驗證）？[Non-Functional, Gap]

## Dependencies & Assumptions
- [ ] CHK018 是否明確列出外部依賴（如認證系統、資料來源）？[Dependency, Gap]
- [ ] CHK019 是否有假設條件（如僅管理員可操作、商品數量上限）並明確說明？[Assumption, Gap]

## Ambiguities & Conflicts
- [ ] CHK020 是否有未定義或模糊詞彙（如「唯一」、「排序」）需澄清？[Ambiguity, Spec §功能需求]
- [ ] CHK021 是否有潛在需求衝突（如權限描述與 API 設計不一致）？[Conflict, tasks.md]

---

> 本清單僅針對「需求文件」品質進行檢查，每次執行皆產生新檔案，請依需求面向逐項審查。
