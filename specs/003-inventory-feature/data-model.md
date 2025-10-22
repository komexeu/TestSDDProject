# 資料模型：庫存功能

## Product（商品）
- id: string (UUID)
- name: string（唯一，不可重複）
- description: string
- price: int（新台幣整數，>0）
- stock: int（庫存數量，>=0）
- createdAt: datetime
- updatedAt: datetime

## InventoryLog（庫存異動紀錄）
- id: string (UUID)
- productId: string（對應商品）
- before: int（異動前庫存）
- after: int（異動後庫存）
- delta: int（異動數量，正為入庫，負為出庫）
- reason: string（如「進貨」、「盤點」、「銷售」等）
- operator: string（操作者識別）
- createdAt: datetime

## 關聯
- Product 1:N InventoryLog

## 驗證規則
- stock 不可為負
- 每次異動必須寫入 InventoryLog
- 商品名稱唯一
- 僅管理員可操作庫存調整
