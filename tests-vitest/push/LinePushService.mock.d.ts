import { LinePushService } from '@domains/push/application/LinePushService';
export declare class LinePushServiceMock implements LinePushService {
    pushOrderStatus(userId: string, orderId: string, message: string): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=LinePushService.mock.d.ts.map