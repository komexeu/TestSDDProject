"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinePushServiceMock = void 0;
class LinePushServiceMock {
    async pushOrderStatus(userId, orderId, message) {
        // 可自訂 mock 行為
        return { success: true };
    }
}
exports.LinePushServiceMock = LinePushServiceMock;
//# sourceMappingURL=LinePushService.mock.js.map