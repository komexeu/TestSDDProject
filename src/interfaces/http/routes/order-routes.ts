import { Hono } from 'hono';
import { OrderController } from '../controllers/order-controller';
import { OrderStatusCode } from '@domains/order/domain/value-objects/order-status';

export function createOrderRoutes(orderController: OrderController): Hono {
    const orderRoutes = new Hono();
    /**
     * 取得所有訂單狀態對應的下一步 map
     * GET /orders/next-status
     * 回傳所有狀態對應的下一步狀態 map，例如 { 1: [2,3], 2: [4,5] }
     * 狀態數字對應
     */
    orderRoutes.get('/orders/next-status', (c) => {
        // 動態 import，避免循環依賴
        const { getNextOrderStatus } = require('../../../domains/order/application/getNextOrderStatus');
        // 從 enum 取得狀態數字對應中文
        const statusNameMap: Record<number, string> = {};
        for (const [key, value] of Object.entries(OrderStatusCode)) {
            if (typeof value === 'number') {
                // 反查 enum: OrderStatusCode[數字] 會得到中文
                statusNameMap[value] = key;
            }
        }
        // 取得所有 OrderStatusCode 的 key
        const statusKeys = Object.values(OrderStatusCode).filter(v => typeof v === 'number');
        const statusMap: Record<number, number[]> = {};
        for (const key of statusKeys) {
            statusMap[key as number] = getNextOrderStatus(key as number);
        }
        return c.json({ statusMap, statusNameMap });
    });

    /**
     * 建立訂單
     * POST /orders
     * 用戶送出訂單資料，建立新訂單
     */
    orderRoutes.post('/orders', (c) => orderController.createOrder(c));

    /**
     * 查詢訂單列表
     * GET /orders/list
     * 支援分頁、依 userId 或狀態查詢
     */
    orderRoutes.get('/orders/list', (c) => orderController.getOrderList(c));

    /**
     * 查詢訂單明細
     * GET /orders/:orderId
     * 取得指定訂單的詳細內容
     */
    orderRoutes.get('/orders/:orderId', (c) => orderController.getOrderDetail(c));

    /**
     * 編輯訂單
     * PUT /orders/:orderId
     * 修改指定訂單內容
     */
    orderRoutes.put('/orders/:orderId', (c) => orderController.editOrder(c));

    /**
     * 查詢訂單狀態
     * GET /orders/:orderId/status
     * 取得指定訂單目前狀態
     */
    orderRoutes.get('/orders/:orderId/status', (c) => orderController.getOrderStatus(c));

    /**
     * 訂單確認
     * POST /orders/:orderId/confirm
     * 櫃檯確認訂單
     */
    orderRoutes.post('/orders/:orderId/confirm', (c) => orderController.confirmOrder(c));

    /**
     * 訂單取消
     * POST /orders/:orderId/cancel
     * 用戶或櫃檯取消訂單
     */
    orderRoutes.post('/orders/:orderId/cancel', (c) => orderController.cancelOrder(c));

    /**
     * 訂單完成
     * POST /orders/:orderId/complete
     * 櫃檯標記餐點完成
     */
    orderRoutes.post('/orders/:orderId/complete', (c) => orderController.completeOrder(c));

    return orderRoutes;
}
