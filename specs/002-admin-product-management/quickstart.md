# 快速入門：後台商品管理

**建立日期**：2025-10-22
**分支**：002-admin-product-management

## 目標
- 讓開發者能於 10 分鐘內啟動本專案 API 並完成一筆商品新增/查詢/編輯/刪除測試

## 前置需求
- Node.js 18+
- Cloudflare 帳號（如需 D1）

## 安裝步驟
1. 下載原始碼
2. 安裝相依套件：
   ```sh
   npm install
   ```
3. 設定 D1/SQLite 連線資訊於 .env
4. 啟動本地開發伺服器：
   ```sh
   npm run dev
   ```
5. 依 openapi.yaml 測試 API 主要流程（可用 Postman 或 curl）

## 主要 API 測試流程
1. 新增商品（POST /api/products）
2. 查詢商品列表（GET /api/products）
3. 編輯商品（PUT /api/products/{id}）
4. 刪除商品（DELETE /api/products/{id}）

## 注意事項
- 商品名稱必須唯一
- 售價必須為新台幣正整數
