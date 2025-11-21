// 推播 service mock/stub for external use case
import { LinePushService } from '@domains/push/application/LinePushService';

export class LinePushServiceMock implements LinePushService {
  async pushOrderStatus(userId: string, orderId: string, message: string) {
    // 可自訂 mock 行為
    return { success: true };
  }
}
