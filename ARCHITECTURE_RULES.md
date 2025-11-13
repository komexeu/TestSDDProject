# 架構撰寫規則與提交審查流程

## 依賴規則

1. Controller 層
   - 只能直接使用 `xxxService` 或 `xxxUseCase`，不可直接使用 Repository 做資料庫異動，只可以讀取。

2. UseCase 層
   - 只能依賴 `xxxService`
   - 可依賴 `xxxRepository` 但提出警告

3. Service 層
   - 可依賴 `xxxRepository`

## QueryHandler 與 Repository 使用原則

在 CQRS/DDD 架構下，QueryHandler 可以直接注入並使用 Repository 來存取資料。

- QueryHandler 負責處理查詢請求，直接呼叫 Repository 方法（如 find、get、list 等）。
- Repository 負責資料存取邏輯，QueryHandler 不直接操作資料庫。
- 若查詢邏輯複雜，可在 Repository 實作複雜查詢方法，QueryHandler 負責組合結果。

範例：
```typescript
class GetOrderDetailQueryHandler {
   constructor(private orderRepository: OrderRepository) {}

   async execute(query: GetOrderDetailQuery): Promise<OrderDetailDto> {
      const order = await this.orderRepository.findById(query.orderId);
      // ...組合 DTO 或額外查詢
      return order;
   }
}
```

此原則有助於維持責任分離、可測試性與架構一致性。

## 提交前審查流程

1. 所有程式碼提交前，必須執行 AI 架構審查。
2. 檢查 “所有” controller/usecase/service 層內的.ts 的依賴關係，回報違規檔案與行數，不可以亂省略。
3. 若有違規，需修正後再提交。
4. 如果沒問題再重新執行一次檢查驗證，確定真的沒問題才回答
