# AI自動審查與Git操作指令文件

我現在要提交
請執行以下操作

## Steps

每次提交前，請依下列指令流程操作：

Step 1. 讀取 ARCHITECTURE_RULES 進行 規則審查
Step 2. 必須給我結果，搭配icon顯示所有檢查的檔案通過或不通過，如果有警告標記一下
Step 3. 有結果後，執行：
   - `git add .`
   - 顯示 git diff
   - commit
Step 4. 若審查不通過，回報違規，不執行 commit

## 標準指令範例

```
請依照 AI審查流程，審查依賴規則，通過後 git add .，顯示 diff 並依照 diff內容詳細描述 commit message，不可以偷懶省略
```

## 注意事項
- commit 前必須通過審查
- 違規時會回報檔案與行數，請修正後再執行
- 可直接呼叫本文件內容，AI會自動依流程執行
