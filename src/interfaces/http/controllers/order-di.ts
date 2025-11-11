import { container } from 'tsyringe';
import { OrderController } from './order-controller';
import { OrderAppService } from '@domains/order/application/service/order-app-service';
import { PrismaOrderRepository } from '@domains/order/infrastructure/repositories/prisma-order-repository';
import { InMemoryDomainEventPublisher } from '@shared/domain/events/domain-event';

// 註冊 repository/service/publisher
container.register('OrderRepository', { useClass: PrismaOrderRepository });
container.register('OrderAppService', { useClass: OrderAppService });
container.register('DomainEventPublisher', { useClass: InMemoryDomainEventPublisher });

// 註冊 controller
container.register('OrderController', {
  useFactory: c => new OrderController(
    c.resolve('OrderAppService'),
    c.resolve('OrderRepository'),
    c.resolve('DomainEventPublisher')
  )
});

export function createOrderController() {
  return container.resolve<OrderController>('OrderController');
}