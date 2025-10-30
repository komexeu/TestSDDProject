import { UseCase } from '../../../../shared/application/interfaces/use-case';
import { CreateOrderRequest, CreateOrderResponse } from '../dto/order-dto';
import { OrderRepository } from '../../domain/repositories/order-repository';
import { Order, UserId } from '../../domain/entities/order';
import { OrderItem } from '../../domain/value-objects/order-item';
import { DomainEventPublisher } from '../../../../shared/domain/events/domain-event';
import { ValidationError } from '../../../../shared/application/exceptions';

export class CreateOrderUseCase implements UseCase<CreateOrderRequest, CreateOrderResponse> {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly eventPublisher: DomainEventPublisher
  ) {}

  async execute(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    // 驗證輸入
    this.validateRequest(request);

    // 建立領域物件
    const userId = new UserId(request.userId);
    const orderItems = request.items.map(item => 
      new OrderItem(item.id, item.name, item.quantity, item.price)
    );

    // 建立訂單聚合
    const order = Order.create(userId, orderItems);

    // 儲存訂單
    await this.orderRepository.save(order);

    // 發布領域事件
    const domainEvents = order.getDomainEvents();
    for (const event of domainEvents) {
      await this.eventPublisher.publish(event);
    }
    order.clearDomainEvents();

    // 回傳結果
    return {
      orderId: order.id.value,
      userId: order.userId.value,
      status: order.status.value,
      items: order.items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice
      })),
      totalAmount: order.totalAmount,
      createdAt: order.createdAt
    };
  }

  private validateRequest(request: CreateOrderRequest): void {
    if (!request.userId || request.userId.trim().length === 0) {
      throw new ValidationError('User ID is required', 'userId');
    }

    if (!request.items || request.items.length === 0) {
      throw new ValidationError('Order must contain at least one item', 'items');
    }

    for (const item of request.items) {
      if (!item.id || item.id.trim().length === 0) {
        throw new ValidationError('Item ID is required', 'items.id');
      }
      if (!item.name || item.name.trim().length === 0) {
        throw new ValidationError('Item name is required', 'items.name');
      }
      if (item.quantity <= 0) {
        throw new ValidationError('Item quantity must be greater than 0', 'items.quantity');
      }
      if (item.price < 0) {
        throw new ValidationError('Item price cannot be negative', 'items.price');
      }
    }
  }
}