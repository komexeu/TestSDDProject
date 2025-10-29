
# 研究紀錄：後台商品管理

**說明**：本文件由 `/speckit.research` 指令自動產生。

**建立日期**：2025-10-22
**分支**：002-admin-product-management

## 技術選型與未知項目

- 程式語言/版本：TypeScript / Node.js
- 主要相依套件：Express/Hono (API)、Prisma/Drizzle (ORM)、Jest (測試)
- 儲存方式：Cloudflare D1 或 SQLite（僅商品資料）
- 測試工具：Jest
- 目標平台：Cloudflare Workers 或 Node.js API Server

## 研究任務
- 研究 Express/Hono 在 Cloudflare Workers/Node.js 上的可行性
- 研究 Prisma/Drizzle ORM 與 D1/SQLite 整合方式
- 研究商品名稱唯一性驗證最佳實踐
- 研究商品售價整數驗證與本土化處理
- 研究 API 權限控管（僅管理員可操作）

## 決策與理由
- 決策：API 採用 TypeScript + Hono/Express，資料儲存採用 D1/SQLite，ORM 採 Prisma/Drizzle，測試用 Jest。
- 理由：Hono/Express 輕量、易於 Workers/Node.js 部署，D1/SQLite 適合小型商品資料，ORM 提升開發效率，Jest 測試生態成熟。
- 替代方案：
  - ORM 可考慮 TypeORM、Kysely
  - 資料庫可視需求切換至外部 PostgreSQL
  - 權限控管可用 JWT 或 Workers Auth Middleware
