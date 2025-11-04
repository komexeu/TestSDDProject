import { UseCase } from '@shared/application/interfaces/use-case';
import { TransitionOrderStatusRequest, TransitionOrderStatusResponse } from './transition-order-status.dto';
import { OrderRepository } from '@domains/order/domain/repositories/order-repository';
import { OrderStatus } from '@domains/order/domain/value-objects/order-status';
import { OrderStateMachineService } from '@domains/order/domain/services/order-state-mechine-service';
import { DomainEventPublisher } from '@shared/domain/events/domain-event';
import { NotFoundError, ValidationError } from '@shared/application/exceptions';

export class UpdateOrderStatusUseCase implements UseCase<TransitionOrderStatusRequest, TransitionOrderStatusResponse> {
	constructor(
		private readonly orderRepository: OrderRepository,
		private readonly orderStateMachine: OrderStateMachineService,
		private readonly eventPublisher: DomainEventPublisher
	) { }

	async execute(request: TransitionOrderStatusRequest): Promise<TransitionOrderStatusResponse> {
		this.validateRequest(request);
		const order = await this.orderRepository.findById(request.orderId);
		if (!order) {
			throw new NotFoundError('Order', request.orderId);
		}
		const targetStatus = new OrderStatus(request.targetStatus);
		const previousStatus = order.status.value;
		this.orderStateMachine.validateTransition(order, targetStatus);
		order.transitionTo(targetStatus);
		await this.orderRepository.edit(order);
		const domainEvents = order.getDomainEvents();
		for (const event of domainEvents) {
			await this.eventPublisher.publish(event);
		}
		order.clearDomainEvents();
		return {
			orderId: order.id.value,
			previousStatus,
			newStatus: order.status.value,
			updatedAt: order.updatedAt
		};
	}

	private validateRequest(request: TransitionOrderStatusRequest): void {
		if (!request.orderId || request.orderId.trim().length === 0) {
			throw new ValidationError('Order ID is required', 'orderId');
		}
		if (!request.targetStatus || request.targetStatus.trim().length === 0) {
			throw new ValidationError('Target status is required', 'targetStatus');
		}
		const validStatuses = [
			'已點餐', '已確認訂單', '製作中', '可取餐',
			'已取餐完成', '已取消', '製作失敗', '異常'
		];
		if (!validStatuses.includes(request.targetStatus)) {
			throw new ValidationError(`Invalid status: ${request.targetStatus}`, 'targetStatus');
		}
	}
}
