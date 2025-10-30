
# 中文 Conventional Commit Message 範例

> 本範例依據 commitlint.config.js 目前設定自動產生，若規則有異動請重新產生本文件以確保同步。
> 
> **注意：若 commitlint.config.js 有更新，請先讓 AI 幫你更新本文件，再依據新規則產生 commit message。**

本文件提供符合 commitlint 設定的中文 commit message 範例，供專案開發者參考。

## 規則摘要
- type 必須為：feat、fix、docs、style、refactor、test、chore
- 冒號後空一格
- subject 必須小寫開頭

## 範例

### 新增功能
feat: 新增商品庫存查詢 API

### 修正錯誤
fix: 修正訂單狀態轉換邏輯錯誤

### 文件
docs: 補充安裝與啟動說明

### 程式碼格式
style: 統一程式碼縮排與格式

### 重構
refactor: 重構庫存服務結構，提升可維護性

### 測試
 test: 新增商品驗證單元測試

### 工具/雜項
chore: 更新依賴套件與建置腳本

---

如需產生 commit message，可在 Copilot Chat 輸入：

/commit.gen 請用中文產生 conventional commit message

即可自動取得符合規範的訊息。
