"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const LinePushService_1 = require("@domains/push/application/LinePushService");
(0, vitest_1.describe)('LinePushService', () => {
    const service = new LinePushService_1.LinePushService();
    (0, vitest_1.it)('should return not implemented', async () => {
        const result = await service.pushOrderStatus('user1', 'order1', 'msg');
        (0, vitest_1.expect)(result.success).toBe(false);
        (0, vitest_1.expect)(result.error).toBe('Not implemented');
    });
    // TODO: add tests for success, failure, retry, error cases
});
//# sourceMappingURL=LinePushService.test.js.map