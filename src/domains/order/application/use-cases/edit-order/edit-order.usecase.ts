import { IOrderRepository } from '../../../domain/repositories/order-repository';
import { Order, OrderId, UserId } from '../../../domain/entities/order';
import { OrderItem } from '../../../domain/value-objects/order-item';
import { BusinessRuleError } from '@shared/application/exceptions';
import { injectable, inject } from 'tsyringe';

export interface EditOrderInput {
  orderId: string;
  userId: string;
  description?: string;
  items?: Array<{
    id: string;
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

@injectable()
export class EditOrderUseCase {
  constructor(@inject('OrderRepository') private readonly orderRepository: IOrderRepository) { }

  async execute(input: EditOrderInput): Promise<void> {
    const order = await this.orderRepository.findById(input.orderId);
    if (!order) {
      throw new BusinessRuleError('訂單不存在');
    }
    if (order.userId.value !== input.userId && input.userId !== 'admin') {
      throw new BusinessRuleError('無權限編輯此訂單');
    }
    // 編輯 description
    if (typeof input.description === 'string') {
      (order as any)._description = input.description;
    }
    // 編輯 items
    if (input.items) {
      if (input.items.length === 0) {
        throw new BusinessRuleError('訂單必須包含至少一項餐點');
      }
      (order as any)._items = input.items.map(
        item => new OrderItem(item.id, item.productId, item.name, item.quantity, item.price)
      );
    }
    (order as any)._updatedAt = new Date();
    await this.orderRepository.edit(order);
  }
}
