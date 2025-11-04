import { OrderAppService } from '../service/order-app-service';

export class OrderUseCase {
  constructor(
    private readonly orderAppService: OrderAppService,
    private readonly eventBus: { publish: (...args: any[]) => Promise<void> }
  ) {}

  // 範例方法，可依實際需求擴充
  async createOrder(userId: string, items: any[]) {
    // 實際邏輯請依專案需求實作
    return this.orderAppService.createOrder(userId, items);
  }
}
