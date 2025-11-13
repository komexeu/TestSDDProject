# 架構撰寫規則與提交審查流程

## 依賴規則

1. Controller 層
   - 不可直接依賴 `xxxRepository`
   - 只能依賴 `xxxService` 或 `xxxUseCase`

2. UseCase 層
   - 只能依賴 `xxxService`
   - 不可直接依賴 `xxxRepository`

3. Service 層
   - 可依賴 `xxxRepository`

## 提交前審查流程

1. 所有程式碼提交前，必須執行 AI 架構審查。
2. AI 會自動檢查“所有” controller/usecase/service 層的依賴關係，回報違規檔案與行數。
3. 若有違規，需修正後再提交。
