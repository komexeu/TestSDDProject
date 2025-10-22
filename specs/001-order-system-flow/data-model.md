# 資料模型：點餐系統流程

**建立日期**：2025-10-21
**分支**：001-order-system-flow

## 實體與欄位

### 用戶（User）
- id: string (Line userId)
- name: string
- createdAt: datetime

### 訂單（Order）
- id: string (UUID)
- userId: string (User.id)
- status: enum [已點餐, 已確認訂單, 製作中, 可取餐, 已取餐完成, 已取消, 製作失敗, 異常]
- items: Item[]
- createdAt: datetime
- updatedAt: datetime
- canceledBy: enum [user, counter, null]
- errorMsg: string (nullable)

### 餐點（Item）
- id: string (UUID)
- orderId: string (Order.id)
- name: string
- quantity: int
- price: int

### 狀態（Status）
- orderId: string (Order.id)
- status: enum (同 Order.status)
- updatedAt: datetime

### 櫃檯（Counter）
- id: string
- name: string

### 廚房（Kitchen）
- id: string
- name: string

## 關聯
- User 1:N Order
- Order 1:N Item
- Order 1:N Status (狀態歷程)

## 驗證規則
- Order.status 僅允許依規格定義狀態流轉
- Item.quantity > 0
- User.id 必須唯一

## 狀態轉換
- 已點餐 → 已確認訂單 → 製作中 → 可取餐 → 已取餐完成
- 例外：已取消、製作失敗、異常

## 備註
- 所有查詢皆以 D1 為唯一資料來源
- 狀態歷程可用於審計與追蹤
