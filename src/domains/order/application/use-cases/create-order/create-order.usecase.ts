import { OrderAppService } from '@domains/order/application/service/order-app-service';
import { DomainEventPublisher } from '@shared/domain/events/domain-event';
import { CreateOrderRequest, CreateOrderResponse } from './create-order.dto';
import { getOrderStatusName } from '@domains/order/domain/value-objects/order-status';
import { injectable, inject } from 'tsyringe';

/**
 * 建立訂單用例
 */
@injectable()
export class CreateOrderUseCase {
	constructor(
		private readonly orderAppService: OrderAppService,
		@inject('DomainEventPublisher') private readonly eventPublisher: DomainEventPublisher
	) { }

	/**
	 * 執行建立訂單流程
	 * @param request 建立訂單請求物件
	 * @returns 建立訂單回應物件
	 */
	async execute(request: CreateOrderRequest): Promise<CreateOrderResponse> {
		// 驗證 request
		if (!request.userId || request.userId.trim().length === 0) {
			throw new Error('User ID is required');
		}
		if (!request.items || request.items.length === 0) {
			throw new Error('Order must have at least one item');
		}
		// 呼叫 Application Service 建立訂單
		const order = await this.orderAppService.createOrder(request.userId, request.items, request.description ?? '');
		// 發佈所有領域事件
		for (const event of order.getDomainEvents()) {
			await this.eventPublisher.publish(event);
		}
		order.clearDomainEvents();
		// 組裝回應 DTO
			return {
				orderId: order.id.value,
				userId: order.userId.value,
				items: order.items.map((item: any) => ({
					id: item.id,
					productId: item.productId,
					name: item.name,
					quantity: item.quantity,
					price: item.price,
				})),
				description: order.description,
				status: getOrderStatusName(order.status.value),
				totalAmount: order.totalAmount,
				createdAt: order.createdAt,
			};
	}
}
