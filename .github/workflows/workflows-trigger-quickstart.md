
# workflows 觸發條件與用途快速說明

> 本文件統一說明本專案所有 workflow 的觸發條件與主要用途，協助新進同仁快速了解自動化流程何時會被執行。

---


## 1. Auto Test (Vitest)（autotest.yml）

**觸發條件**：
- push 到 `master` 分支
- Pull Request 指向 `master` 分支

**用途**：
- 自動執行 Vitest 測試，確保主分支品質。

**詳細內容**：
此 workflow 會在 Ubuntu 環境下自動完成以下步驟：
1. 啟動 PostgreSQL 15 服務，並設置測試用資料庫（testdb）。
2. 下載專案原始碼（checkout）。
3. 安裝 Node.js 20 環境。
4. 安裝 npm 依賴（npm ci）。
5. 設定測試用資料庫連線字串於 `.env.test`。
6. 執行 `npm run vitest-test:clean`，進行所有 Vitest 測試（含單元、整合、資料庫相關測試）。

**注意事項**：
- 測試過程會自動建立/清空測試資料庫。
- 若測試需額外環境變數，請於 `.env.test` 設定。
- 測試失敗會導致 workflow 失敗，PR 無法合併。

**實際情境舉例**：
- 你在本地開發完成後，將程式碼 push 到 `master`，CI 會自動執行 Auto Test (Vitest)。
- 你從 feature 分支發起 PR 合併到 `master`，CI 也會自動執行 Auto Test (Vitest)，確保合併前測試通過。

---


## 2. Auto Issue Sync（auto-issue.yml）

**觸發條件**：
- push 到 `issue-branch` 分支

**用途**：
- 當 `issue-branch` 有 push 時，自動執行 `scripts/create-issues-from-tasks.cjs`，將 specs 目錄下的任務自動同步為 GitHub Issues。
- 需使用 GitHub Token 權限。

**詳細內容**：
此 workflow 會在 Ubuntu 環境下自動完成以下步驟：
1. 下載專案原始碼（checkout）。
2. 安裝 Node.js 20 環境。
3. 安裝 GitHub CLI（gh）工具。
4. 安裝 npm 依賴（npm ci）。
5. 執行 `scripts/create-issues-from-tasks.cjs` 腳本，將 `specs/` 目錄下的任務自動建立或更新為 GitHub Issues。
6. 腳本執行時會使用 workflow secrets 中的 `GITHUB_TOKEN` 權限。

**注意事項**：
- 僅當 push 到 `issue-branch` 時才會觸發。
- 腳本會根據 `specs/` 目錄內容自動同步 Issue，請確認任務格式正確。
- 若需自訂同步邏輯，請修改 `scripts/create-issues-from-tasks.cjs`。

**關於 remove 標籤**：
- 當 `specs/<feature>/tasks.md` 中的某個子任務（checklist）被移除，對應的 sub-issue 會在下次 workflow 執行時自動加上 `remove` 標籤。
- 這代表該任務已不再存在於 specs 文件，建議後續人工確認是否要關閉或刪除該 Issue。

**實際情境舉例**：
- 你在 `specs/` 目錄下新增或調整任務，push 到 `issue-branch`，CI 會自動建立/更新 GitHub Issues。

---

## 3. 觸發條件調整建議

如需調整觸發條件，請分別修改對應 workflow 的 `on` 區塊：
- `.github/workflows/autotest.yml`
- `.github/workflows/auto-issue.yml`

---

如有新增 workflow，請同步補充本文件。
