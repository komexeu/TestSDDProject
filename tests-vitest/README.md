# Vitest 測試區

這是專案的測試目錄，使用 Vitest 作為測試框架。

## 目錄結構
- `inventory/` - 庫存相關功能測試
- `models/` - 資料模型驗證測試
- `orderCore.test.ts` - 訂單核心邏輯測試
- `vitest.setup.ts` - 測試環境初始化設定

## 執行測試
```bash
npm test          # 執行所有測試
npm run test:watch # 監控模式
npm run test:ui    # UI 界面
```

## 注意事項
- 測試使用 PostgreSQL 資料庫，需要先啟動資料庫服務
- 所有測試會自動清理測試資料，確保測試間互不影響
