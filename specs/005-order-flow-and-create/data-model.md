# 005 合併規格：點餐流程與建立訂單 - 資料模型

## 主要實體
- User（用戶）
  - id, name, contact, lineId, ...
- Order（訂單）
  - id, userId, items, status, createdAt, updatedAt, ...
- Item（餐點/商品）
  - id, name, price, stock, ...
- Status（狀態）
  - value, description, timestamp
- Counter（櫃檯）
  - id, name, ...
- Kitchen（廚房）
  - id, name, ...

## 關聯
- 一個 User 可有多個 Order
- 一個 Order 包含多個 Item
- Order 狀態依流程自動推進

## 參考來源
- specs/001-order-system-flow/data-model.md
- specs/004-create-order/data-model.md

---

> 本文件為 005 合併規格之資料模型，請依實際資料結構補充。
