# Feature Specification: 庫存功能

**Feature Branch**: `003-inventory-feature`  
**Created**: 2025-10-22  
**Status**: Draft  
**Input**: User description: "我要有一個庫存功能"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 商品庫存查詢 (Priority: P1)

作為管理員，我希望能查詢每個商品的即時庫存數量，以便掌握庫存狀態。

**Why this priority**: 查詢是所有庫存管理的基礎，無法查詢則無法進行補貨、銷售等後續動作。

**Independent Test**: 只要能查詢商品庫存，管理員即可獨立驗證庫存數據正確性。

**Acceptance Scenarios**:
1. **Given** 商品存在，**When** 管理員查詢庫存，**Then** 顯示正確庫存數量
2. **Given** 商品不存在，**When** 管理員查詢庫存，**Then** 顯示「查無商品」錯誤

---

### User Story 2 - 商品庫存調整 (Priority: P2)

作為管理員，我希望能手動調整商品庫存（如進貨、盤點），以確保庫存數據正確。

**Why this priority**: 實務上庫存會因進貨、盤點等非銷售行為調整，需有手動調整機制。

**Independent Test**: 只要能針對單一商品調整庫存，並正確反映於查詢，即可驗證。

**Acceptance Scenarios**:
1. **Given** 商品存在，**When** 管理員調整庫存為新數量，**Then** 查詢時顯示新庫存
2. **Given** 商品不存在，**When** 管理員調整庫存，**Then** 顯示「查無商品」錯誤
3. **Given** 輸入負數，**When** 管理員調整庫存，**Then** 顯示「庫存不可為負」錯誤

---

### User Story 3 - 銷售自動扣庫存 (Priority: P3)

作為系統，我希望每次商品銷售時自動扣減庫存，避免超賣。

**Why this priority**: 自動扣庫存可防止超賣，確保庫存數據即時正確。

**Independent Test**: 只要有一筆銷售訂單成立，庫存即自動減少，並可查詢驗證。

**Acceptance Scenarios**:
1. **Given** 商品庫存足夠，**When** 銷售發生，**Then** 庫存自動減少相應數量
2. **Given** 商品庫存不足，**When** 嘗試銷售，**Then** 顯示「庫存不足」錯誤，訂單不成立
3. **Given** 多筆銷售同時發生，**When** 並發請求，**Then** 庫存扣減正確且不可超賣

---

## Functional Requirements

1. 管理員可查詢任一商品的即時庫存數量。
2. 管理員可手動調整商品庫存（僅限非負整數）。
3. 商品銷售時，系統自動扣減對應庫存，並發情境下不可超賣。
4. 當庫存不足時，禁止完成銷售並提示錯誤。
5. 所有庫存異動需有操作紀錄（含時間、操作者、異動前後數量、原因）。

## Success Criteria

- 100% 商品庫存查詢正確率（與實際數據一致）
- 100% 銷售自動扣庫存正確率，並發下不可超賣
- 100% 異常操作（如負庫存、超賣）皆有明確錯誤提示
- 所有庫存異動皆有完整紀錄可查
- 管理員可於 3 秒內查詢/調整庫存

## Key Entities

- 商品（Product）：唯一識別、名稱、描述、售價、庫存數量
- 庫存異動紀錄（InventoryLog）：商品、異動數量、異動前後、操作者、時間、原因

## Assumptions

- 庫存僅針對實體商品，虛擬商品不納入本規格
- 銷售流程已存在，僅需介接庫存自動扣減
- 管理員身份驗證已由現有系統處理
- 高併發下需確保庫存一致性，防止超賣（如採用資料庫鎖定、樂觀鎖、原子操作等）

