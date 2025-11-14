import { injectable, inject } from 'tsyringe';
import { OrderAppService } from '../../service/order-app-service';
import { OrderStateMachineService } from '@domains/order/domain/services/order-state-mechine-service';
import { OrderStatus, OrderStatusCode } from '@domains/order/domain/value-objects/order-status';
import { BusinessRuleError } from '@shared/application/exceptions';
import { OrderRepository } from '@domains/order/infrastructure/repositories/prisma-order-repository';

@injectable()
export class MoveToNextStatusUseCase {
    constructor(
        @inject('OrderRepository') private readonly orderRepository: OrderRepository,
        @inject('OrderAppService') private readonly orderAppService: OrderAppService,
        @inject('OrderStateMachineService') private readonly stateMachine: OrderStateMachineService
    ) { }

    async execute(orderId: string): Promise<void> {
        // 取得訂單與目前狀態
        const order = await this.orderRepository.findById(orderId);
        if (!order)
            throw new BusinessRuleError('查無此訂單');
        const currentStatus = order.status;
        // 取得所有可轉換狀態，排除「已取消」
        const allowed = OrderStateMachineService.ALLOWED_TRANSITIONS[currentStatus.value] || [];
        const next = allowed.find(s => s !== OrderStatusCode.已取消);
        if (!next)
            throw new BusinessRuleError('無可流轉的下一步狀態');
        const targetStatus = new OrderStatus(next);
        this.stateMachine.validateTransition(order, targetStatus);
        order.transitionTo(targetStatus);
        // 透過 AppService 儲存
        await this.orderAppService.updateStatus(order.id.value, targetStatus.value);
    }
}
