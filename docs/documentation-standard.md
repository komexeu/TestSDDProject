# 文件與註解標準（Documentation & JSDoc）

## 專案文件資料夾結構

```
docs/
  ├─ layering-guidelines.md      # 分層與架構原則
  ├─ testing.md                  # 測試規範與範例
  ├─ documentation-standard.md   # 文件與註解標準
  ├─ cqrs.md                     # CQRS/查詢分離說明
  └─ ...（可依主題擴充）
```

> 每份主題文件聚焦一項設計原則或規範，利於團隊查閱與維護。

## 目標
- 提升可讀性、維護性，降低溝通成本。
- 所有公開 class、method、DTO 必須加上 JSDoc。

## JSDoc 範例
```ts
/**
 * 訂單聚合根
 * @class
 */
export class Order extends AggregateRoot<OrderProps> {
  /**
   * 新增商品到訂單
   * @param item 商品項目
   */
  addItem(item: OrderItem): void { ... }
}
```

## 文件撰寫建議
- 每個模組/資料夾應有 README 或說明文件，描述用途、設計原則、重要流程。
- 重要設計決策、架構圖、流程圖建議放於 docs/ 下，並於主文件連結。

---

> 請持續維護註解與文件，確保團隊知識同步。