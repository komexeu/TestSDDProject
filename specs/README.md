# Plan Template 使用指南

## 概述

本專案採用 Domain-Driven Design (DDD) 架構，所有功能規劃都遵循統一的模板格式。

## 模板檔案

- **`PLAN_TEMPLATE.md`** - 完整的 plan.md 模板，適用於新功能開發
- 現有功能的 plan.md 已更新為符合實際專案結構

## 主要更新內容

### 1. 技術背景統一化
- **Framework**: Hono (Web Framework)
- **ORM**: Prisma  
- **Testing**: Vitest
- **Database**: PostgreSQL
- **Architecture**: DDD 清潔架構

### 2. 專案結構標準化
```
src/domains/[domain-name]/
├── application/         # 應用層
│   ├── dto/            # 資料傳輸物件
│   └── use-cases/      # 使用案例
├── domain/             # 領域層
│   ├── entities/       # 實體
│   ├── repositories/   # 儲存庫介面
│   ├── services/       # 領域服務
│   └── value-objects/  # 值物件
└── infrastructure/     # 基礎設施層
    └── repositories/   # 儲存庫實作
```

### 3. 測試架構標準化
```
tests-vitest/[domain]/
├── testUtils.ts                    # 測試工具
├── [domain]-unit.test.ts          # 單元測試
├── [domain]-api.test.ts           # API 測試
├── [domain]-auth.test.ts          # 權限測試
├── [domain]-concurrency.test.ts   # 併發測試
└── [domain]-performance.test.ts   # 效能測試
```

## 使用方式

1. 複製 `PLAN_TEMPLATE.md` 到新的 spec 目錄
2. 重新命名為 `plan.md`
3. 填入具體的功能資訊：
   - 功能名稱與描述
   - 具體的效能指標
   - 功能特定的限制條件
   - 驗收標準
   - 風險評估

## 實作階段

每個功能遵循統一的實作階段：

1. **Phase 0**: Research & Analysis
2. **Phase 1**: Design & Modeling  
3. **Phase 2**: Core Implementation
4. **Phase 3**: Testing & Validation
5. **Phase 4**: Integration & Deployment

## 品質標準

所有功能必須滿足：
- 測試覆蓋率 ≥ 80%
- 符合 DDD 架構原則
- 通過靜態分析檢查
- API 文件完整且最新

## 更新記錄

- **2025-10-30**: 創建統一 plan 模板，更新現有 spec 的 plan.md
- **已更新檔案**:
  - `specs/001-order-system-flow/plan.md`
  - `specs/002-admin-product-management/plan.md`
  - `specs/003-inventory-feature/plan.md`