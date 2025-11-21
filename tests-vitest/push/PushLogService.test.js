"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const PushLogService_1 = require("@domains/push/application/PushLogService");
(0, vitest_1.describe)('PushLogService', () => {
    const service = new PushLogService_1.PushLogService();
    (0, vitest_1.it)('should throw not implemented for create', async () => {
        await (0, vitest_1.expect)(service.create({
            userId: 'user1',
            orderId: 'order1',
            channel: 'LINE',
            message: 'msg',
            status: 'SUCCESS',
            retryCount: 0,
        })).rejects.toThrow('Not implemented');
    });
    (0, vitest_1.it)('should throw not implemented for findByUser', async () => {
        await (0, vitest_1.expect)(service.findByUser('user1')).rejects.toThrow('Not implemented');
    });
    (0, vitest_1.it)('should throw not implemented for findByOrder', async () => {
        await (0, vitest_1.expect)(service.findByOrder('order1')).rejects.toThrow('Not implemented');
    });
});
//# sourceMappingURL=PushLogService.test.js.map