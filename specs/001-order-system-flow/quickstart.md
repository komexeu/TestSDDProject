
# 快速入門：點餐系統流程

**說明**：本文件由 `/speckit.quickstart` 指令自動產生。

**建立日期**：2025-10-21
**分支**：001-order-system-flow

## 目標
- 讓開發者能於 10 分鐘內啟動本專案 API 並完成一筆訂單流程測試

## 前置需求
- Node.js 18+
- Cloudflare 帳號與 D1 資料庫權限
- LINE Messaging API Channel

## 安裝步驟
1. 下載原始碼
2. 安裝相依套件：
   ```sh
   npm install
   ```
3. 設定 Cloudflare D1 資料庫連線資訊於 .env
4. 設定 LINE Channel Secret 與 Token 於 .env
5. 啟動本地開發伺服器：
   ```sh
   npm run dev
   ```
6. 依 openapi.yaml 測試 API 主要流程（可用 Postman 或 curl）

## 主要 API 測試流程
1. 用戶送出訂單（POST /api/orders）
2. 查詢訂單狀態（GET /api/orders/{orderId}/status）
3. 櫃檯確認訂單（POST /api/orders/{orderId}/confirm）
4. 廚房/櫃檯標記完成（POST /api/orders/{orderId}/complete）
5. 用戶查詢狀態至「可取餐」

## 注意事項
- 所有訂單狀態查詢皆直接查 D1
- 請參考 data-model.md 及 openapi.yaml 進行資料結構與 API 對應
