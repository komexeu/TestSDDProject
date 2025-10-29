
# 資料模型：後台商品管理

**說明**：本文件由 `/speckit.data-model` 指令自動產生。

**建立日期**：2025-10-22
**分支**：002-admin-product-management

## 實體與欄位

### 商品（Product）
- id: string (UUID)
- name: string（唯一，不可重複）
- description: string
- price: int（新台幣整數，>0）
- createdAt: datetime
- updatedAt: datetime

### 管理員（Admin）
- id: string
- name: string

## 關聯
- 無（本規格不含庫存、訂單等關聯）

## 驗證規則
- Product.name 必須唯一且不可為空
- Product.price 必須為正整數（新台幣元）

## 備註
- 僅管理員可操作商品管理
