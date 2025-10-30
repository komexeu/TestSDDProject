# Implementation Plan: 庫存功能


**Branch**: `003-inventory-feature` | **Date**: 2025-10-22 | **Spec**: [spec.md](./spec.md)
**Input**: 來自 specs/003-inventory-feature/spec.md

## Summary

本功能提供商品即時庫存查詢、手動調整、銷售自動扣庫存，並確保高併發下不可超賣，所有異動皆有紀錄。技術上採用 TypeScript (Node.js)、Hono (API)、Prisma (ORM)、Jest（測試），資料儲存採 SQLite 或 Cloudflare D1，並以資料庫原子操作防止超賣。API 設計遵循 RESTful，所有異動皆寫入 InventoryLog，並強制權限控管。

## Technical Context

**Language/Version**: TypeScript (Node.js)  
**Primary Dependencies**: Hono (Web Framework)、Prisma (ORM)、Vitest (測試框架)  
**Storage**: PostgreSQL（開發與測試環境使用 PostgreSQL，確保資料一致性）  
**Testing**: Vitest（測試框架）與 Prisma Test Environment  
**Architecture**: Domain-Driven Design (DDD) 清潔架構  
**Target Platform**: Node.js API Server  
**Project Type**: 單一專案（API 專案，採用 DDD 分層架構）  
**Performance Goals**: 查詢/異動 API 反應時間 <1 秒，確保併發安全防止超賣  
**Constraints**: 管理員權限控管、商品資料一致性、所有異動需有紀錄、併發安全保證  
**Scale/Scope**: 初期商品數量 <1000，支援併發調整/銷售操作

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 品質門檻（依 constitution 條列）
- 程式碼必須通過靜態分析、具可讀性與註解，所有變更需同儕審查
- 所有功能必須有自動化測試覆蓋（單元+整合），合併前必須通過
- 介面（API）需有一致互動模式與錯誤回饋設計
- 主要功能需符合明確效能指標（API <1 秒），每次發佈前效能驗證
- 技術堆疊、合規、部署政策需遵守專案文件
- 變更需經審查，測試門檻與部署審核流程強制執行
- 憲章優先於其他實務，所有 PR 與審查必須驗證合規

## Project Structure

### Documentation (this feature)


specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── app.ts                          # 應用程式入口點
├── index.ts                        # 主要入口檔案  
├── server.ts                       # 伺服器設定
├── domains/                        # DDD 領域層架構
│   ├── inventory/                  # 庫存領域
│   │   ├── application/            # 應用層
│   │   │   ├── dto/               # 資料傳輸物件
│   │   │   └── use-cases/         # 使用案例（業務邏輯）
│   │   ├── domain/                # 領域層
│   │   │   ├── entities/          # 實體
│   │   │   ├── repositories/      # 儲存庫介面
│   │   │   ├── services/          # 領域服務
│   │   │   └── value-objects/     # 值物件
│   │   └── infrastructure/        # 基礎設施層
│   │       └── repositories/      # 儲存庫實作
│   ├── order/                     # 訂單領域
│   └── product/                   # 商品領域
├── interfaces/                    # 介面層
│   └── http/                     # HTTP 介面
│       ├── controllers/          # 控制器
│       ├── middleware/           # 中介軟體
│       └── routes/               # 路由設定
├── shared/                       # 共用元件
│   ├── application/              # 應用層共用
│   │   ├── exceptions/           # 例外處理
│   │   └── interfaces/           # 介面定義
│   ├── domain/                   # 領域層共用
│   │   ├── entities/             # 基礎實體
│   │   ├── events/               # 領域事件
│   │   └── value-objects/        # 共用值物件
│   └── infrastructure/           # 基礎設施層共用
│       ├── database/             # 資料庫設定
│       └── logger/               # 日誌系統
└── services/                     # 服務層（待重構）

tests-vitest/                     # 測試目錄（使用 Vitest）
├── README.md                     # 測試說明文件
├── vitest.setup.ts              # 測試設定
├── orderCore.test.ts            # 核心訂單測試
├── inventory/                   # 庫存功能測試
│   ├── testUtils.ts            # 測試工具
│   ├── inventory-unit.test.ts   # 單元測試
│   ├── inventory-api.test.ts    # API 測試
│   ├── inventory-auth.test.ts   # 權限測試
│   ├── inventory-concurrency.test.ts  # 併發測試
│   ├── inventory-performance.test.ts  # 效能測試
│   ├── inventory-adjust.test.ts # 調整功能測試
│   ├── inventory-sale.test.ts   # 銷售功能測試
│   ├── inventory-stock.test.ts  # 庫存查詢測試
│   └── inventory-logs.test.ts   # 日誌功能測試
└── models/                      # 模型測試
    └── productValidation.test.ts # 商品驗證測試

prisma/                          # Prisma ORM 相關
├── schema.prisma               # 資料庫 Schema
└── migrations/                 # 資料庫遷移
```

**Structure Decision**: 採用 Domain-Driven Design (DDD) 架構，將庫存功能實作於 `src/domains/inventory/` 下，遵循清潔架構分層：
- **Domain Layer**: 核心業務邏輯與規則
- **Application Layer**: 使用案例與應用服務
- **Infrastructure Layer**: 資料庫存取與外部服務整合
- **Interface Layer**: HTTP API 控制器與路由

測試採用 Vitest 框架，包含完整的單元測試、整合測試、併發測試與效能測試。


