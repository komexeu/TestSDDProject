
# 快速入門：商品庫存功能

## 目標
- 10 分鐘內啟動庫存 API，完成查詢、調整、銷售自動扣庫存測試

## 前置需求
- Node.js 18+
- PostgreSQL（本地或 Docker，建議測試時務必使用 PostgreSQL）
- 已有商品資料

## 安裝步驟
1. 下載原始碼
2. 安裝相依套件：
   ```sh
   npm install
   ```
3. 設定 .env 資料庫連線（範例：`DATABASE_URL="postgresql://user:password@localhost:5432/dbname"`）
4. 啟動 PostgreSQL（可用 Docker Compose，指令如下：）
   ```sh
   docker compose up -d postgres-test
   ```
5. 執行 migration 建立資料表：
   ```sh
   npx prisma migrate dev --name init-inventory
   ```
6. 啟動本地伺服器：
   ```sh
   npm run dev
   ```

## API 測試流程
1. 查詢商品庫存：
   - `GET /api/inventory/{productId}`
2. 調整商品庫存：
   - `POST /api/inventory/{productId}/adjust`，body: `{ "newStock": 100, "reason": "進貨" }`
3. 查詢異動紀錄：
   - `GET /api/inventory/{productId}/logs`
4. 銷售自動扣庫存：
   - `POST /api/inventory/sale`，body: `{ "productId": "...", "quantity": 2 }`

## 注意事項
- 所有庫存操作僅限管理員
- 測試與開發時請務必使用 PostgreSQL，確保與正式環境一致
- 銷售時自動防止超賣，高併發下庫存一致
- 每次異動皆有紀錄可查
