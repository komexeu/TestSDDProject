
# 實作計畫：後台商品管理

**說明**：本文件由 `/speckit.plan` 指令自動產生。

**分支**：`002-admin-product-management` | **日期**：2025-10-22 | **規格**：[spec.md](./spec.md)
**所有規格、計畫、使用者文件必須以繁體中文（zh-TW）撰寫。**

## 摘要

本計畫針對「後台商品管理」設計，涵蓋商品新增、編輯、刪除、查詢，僅含名稱、描述、售價（新台幣整數），不含庫存。重點在於操作簡便、驗證嚴謹、即時同步。

## 技術背景

**程式語言/版本**：TypeScript (Node.js)  
**主要相依套件**：Hono (Web Framework)、Prisma (ORM)、Vitest (測試框架)  
**儲存方式**：PostgreSQL（開發與測試環境，確保資料一致性）  
**測試工具**：Vitest 與 Prisma Test Environment  
**架構**：Domain-Driven Design (DDD) 清潔架構  
**目標平台**：Node.js API Server  
**專案型態**：單一專案（API 專案，採用 DDD 分層架構）  
**效能目標**：商品查詢/異動 API 反應時間 <1 秒  
**限制條件**：僅管理員可操作、商品名稱唯一性、售價為新台幣整數  
**規模/範疇**：初期商品數量<1000

## 憲章檢查

- 程式碼品質：所有程式碼需經靜態分析與同儕審查。
- 測試標準：所有功能需有自動化測試，合併前必須通過。
- 使用者體驗一致性：所有介面需遵循一致互動模式與錯誤回饋。
- 效能要求：主要功能需符合明確效能指標並驗證。
- 技術堆疊、合規、部署政策需遵守專案文件規範。
- 變更需經審查與合規檢查。

## 專案結構

### 文件（本功能）

```
specs/002-admin-product-management/
├── plan.md              # 本檔案
├── research.md          # 第0階段產出
├── data-model.md        # 第1階段產出
├── quickstart.md        # 第1階段產出
├── contracts/           # 第1階段產出
└── tasks.md             # 第2階段產出
```

### 原始碼（倉庫根目錄）

```
src/
├── app.ts                          # 應用程式入口點
├── index.ts                        # 主要入口檔案  
├── server.ts                       # 伺服器設定
├── domains/                        # DDD 領域層架構
│   ├── product/                    # 商品領域
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
│   └── inventory/                 # 庫存領域
├── interfaces/                    # 介面層
│   └── http/                     # HTTP 介面
│       ├── controllers/          # 控制器
│       ├── middleware/           # 中介軟體（權限驗證）
│       └── routes/               # 路由設定
├── shared/                       # 共用元件
│   ├── application/              # 應用層共用
│   ├── domain/                   # 領域層共用
│   └── infrastructure/           # 基礎設施層共用
└── services/                     # 服務層（待重構為 DDD）

tests-vitest/                     # 測試目錄
├── README.md                     # 測試說明文件
├── vitest.setup.ts              # 測試設定
├── models/                      # 模型測試
│   └── productValidation.test.ts # 商品驗證測試
└── [product]/                   # 商品功能測試（待建立）

prisma/                          # Prisma ORM 相關
├── schema.prisma               # 資料庫 Schema
└── migrations/                 # 資料庫遷移
```

**結構決定**：採用 Domain-Driven Design (DDD) 架構，將商品管理功能實作於 `src/domains/product/` 下，遵循清潔架構分層。管理員權限驗證於中介軟體層實作，確保安全性與職責分離。
