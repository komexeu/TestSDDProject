# AI自動審查與Git操作指令文件

## 使用方式

每次提交前，請依下列指令流程操作：

1. 依照 ARCHITECTURE_RULES 規則審查
2. 若審查通過，執行：
   - `git add .`
   - 顯示 git diff
   - commit
3. 若審查不通過，回報違規，不執行 commit

## 標準指令範例

```
請依照 AI審查流程，審查依賴規則，通過後 git add .，顯示 diff 並依照 diff內容詳細描述 commit message，不可以偷懶省略
```

## 注意事項
- commit 前必須通過審查
- 違規時會回報檔案與行數，請修正後再執行
- 可直接呼叫本文件內容，AI會自動依流程執行
