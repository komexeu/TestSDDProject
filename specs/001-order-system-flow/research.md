
# 研究紀錄：點餐系統流程

**說明**：本文件由 `/speckit.research` 指令自動產生。

**建立日期**：2025-10-21
**分支**：001-order-system-flow

## 技術選型與未知項目

- 程式語言/版本：JavaScript (Node.js) / TypeScript
- 主要相依套件：Hono（Cloudflare Workers 友善框架）、Line Messaging API SDK、WebSocket（或 Durable Objects）、Prisma（或 D1 Client）
- 儲存方式：Cloudflare D1（關聯式資料庫，適合訂單、狀態、用戶等結構化資料）
- 測試工具：Jest、Supertest
- 目標平台：Cloudflare Workers（API 伺服器）、Web（櫃檯/廚房）、Line Bot（用戶）

## 研究任務
- 研究 Hono/Express.js 在 Cloudflare Workers 上的可行性與最佳實踐
- 研究 Cloudflare Workers 與 Line Messaging API 整合方式
- 研究 WebSocket 或 Durable Objects 實現即時推播於 Workers
- 研究 Cloudflare D1 作為訂單、狀態、用戶等資料儲存方案
- 研究 Workers 環境下自動化測試與部署流程

## 決策與理由
- 決策：API 伺服器採用 TypeScript + Hono 框架，部署於 Cloudflare Workers，資料儲存採用 Cloudflare D1，WebSocket 以 Durable Objects 實現。
- 理由：Cloudflare Workers 全球部署、低延遲，Hono 框架輕量且相容 Workers，D1 關聯式資料庫適合結構化訂單/狀態/用戶資料，Durable Objects 支援即時狀態同步。
- 替代方案：
  - Express.js 僅適用於 Node.js，若需 Workers 支援建議改用 Hono/itty-router 等框架。
  - 資料庫可視需求切換至外部 PostgreSQL。
  - 即時推播可考慮第三方服務（如 Pusher）或自建 WebSocket Gateway。
