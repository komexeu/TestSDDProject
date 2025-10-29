# 實作計畫：[功能名稱]

**分支**：`[###-feature-name]` | **日期**：[日期] | **規格**：[連結]
**輸入**：功能規格來自 `/specs/[###-feature-name]/spec.md`

**說明**：本範本由 `/speckit.plan` 指令自動產生。執行流程請參考 `.specify/templates/commands/plan.md`。

## 摘要

[從功能規格擷取：主要需求＋技術路線（可參考 research）]

## 技術背景

<!--
  請將本區內容替換為專案實際技術細節。
  結構僅供 speckit 產生與迭代時參考。
-->

**語言／版本**：[如 Python 3.11、Swift 5.9、Rust 1.75 或請補充]  
**主要相依套件**：[如 FastAPI、UIKit、LLVM 或請補充]  
**儲存方式**：[如 PostgreSQL、CoreData、檔案或無]  
**測試工具**：[如 pytest、XCTest、cargo test 或請補充]  
**目標平台**：[如 Linux server、iOS 15+、WASM 或請補充]
**專案型態**：[單一／Web／Mobile，決定原始碼結構]  
**效能目標**：[領域專屬，如 1000 req/s、10k lines/sec、60 fps 或請補充]  
**限制條件**：[領域專屬，如 <200ms p95、<100MB 記憶體、離線可用或請補充]  
**規模／範圍**：[領域專屬，如 1 萬用戶、100 萬行程式、50 畫面或請補充]

## 憲章檢查

*GATE：第 0 階段研究前必須通過。第 1 階段設計後需再次檢查。*

[依 constitution 檔案自動產生 Gate 條件]

## 專案結構

### 文件（本功能）

```
specs/[###-feature]/
├── plan.md              # 本檔案（/speckit.plan 指令產出）
├── research.md          # 第 0 階段產出（/speckit.plan 指令）
├── data-model.md        # 第 1 階段產出（/speckit.plan 指令）
├── quickstart.md        # 第 1 階段產出（/speckit.plan 指令）
├── contracts/           # 第 1 階段產出（/speckit.plan 指令）
└── tasks.md             # 第 2 階段產出（/speckit.tasks 指令，非 plan 產生）
```

### 原始碼（repository root）
<!--
  請將下方結構替換為本功能實際目錄樹。
  若有多專案、多 package，請展開具體路徑。
-->

```
src/
```
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

