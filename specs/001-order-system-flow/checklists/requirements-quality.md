# 點餐系統流程需求品質檢查清單

> 目的：本清單用於檢查「點餐系統流程」相關規格文件（spec.md、plan.md、tasks.md）之需求撰寫品質，確保其完整性、明確性、一致性、可驗證性與涵蓋性。每一項皆為「需求單元測試」，僅針對規格本身，不檢查實作。
> 
> 建立日期：2025-10-22

---

## Requirement Completeness
- [ ] CHK001 是否明確列出所有主要流程與狀態（用戶點餐、櫃檯確認、廚房接單、製作、取餐、異常處理）？[Completeness, Spec §功能需求]
- [ ] CHK002 是否規範所有狀態轉換規則（正常、異常、例外）？[Completeness, Spec §功能需求]
- [ ] CHK003 是否明確定義用戶、櫃檯、廚房三方角色與權限？[Completeness, Gap]
- [ ] CHK004 是否明確規範資料同步與即時性需求？[Completeness, Spec §功能需求]

## Requirement Clarity
- [ ] CHK005 「即時」、「同步」等詞彙是否有具體定義或量化標準？[Clarity, Ambiguity, Spec §功能需求]
- [ ] CHK006 狀態轉換條件（如何時可取消、重複送單判斷）是否明確？[Clarity, Spec §功能需求]
- [ ] CHK007 「異常」與「例外」情境是否有明確分類與處理方式？[Clarity, Spec §功能需求]

## Requirement Consistency
- [ ] CHK008 各流程描述是否在不同段落間無矛盾（如狀態流、角色權限）？[Consistency, Spec §User Stories]
- [ ] CHK009 權限控管描述是否與 API 設計、測試任務一致？[Consistency, tasks.md]

## Acceptance Criteria Quality
- [ ] CHK010 是否每個 User Story/流程皆有可驗證的驗收條件？[Acceptance Criteria, Spec §User Scenarios]
- [ ] CHK011 驗收條件是否涵蓋正常、異常、邊界（如重複送單、取消、失敗）情境？[Acceptance Criteria, Coverage, Spec §User Scenarios]

## Scenario Coverage
- [ ] CHK012 是否涵蓋用戶、櫃檯、廚房三方互動的主要情境？[Coverage, Spec §User Stories]
- [ ] CHK013 是否涵蓋重複送單、取消、廚房拒單等例外情境？[Coverage, Spec §User Stories]
- [ ] CHK014 是否規範異常/失敗時的回應與限制（如狀態顯示、通知）？[Coverage, Spec §功能需求]

## Edge Case Coverage
- [ ] CHK015 是否明確定義所有異常/邊界條件（如重複送單、取消、廚房拒單、系統錯誤）？[Edge Case, Spec §User Scenarios]

## Non-Functional Requirements
- [ ] CHK016 是否有明確的效能需求（如狀態更新延遲、訂單量上限）？[Non-Functional, Gap]
- [ ] CHK017 是否有資安/權限相關需求（如 API 權限、資料驗證）？[Non-Functional, Gap]

## Dependencies & Assumptions
- [ ] CHK018 是否明確列出外部依賴（如 Line API、Cloudflare D1）？[Dependency, Gap]
- [ ] CHK019 是否有假設條件（如單一門市、用戶唯一性）並明確說明？[Assumption, Gap]

## Ambiguities & Conflicts
- [ ] CHK020 是否有未定義或模糊詞彙（如「即時」、「同步」）需澄清？[Ambiguity, Spec §功能需求]
- [ ] CHK021 是否有潛在需求衝突（如權限描述與 API 設計不一致）？[Conflict, tasks.md]

---

> 本清單僅針對「需求文件」品質進行檢查，每次執行皆產生新檔案，請依需求面向逐項審查。
