import { PrismaClient } from '@prisma/client';
import { OrderRepository } from '../../domain/repositories/order-repository';
import { Order, OrderId, UserId } from '../../domain/entities/order';
import { OrderItem } from '../../domain/value-objects/order-item';
import { OrderStatus } from '../../domain/value-objects/order-status';

const prisma = new PrismaClient();

export class PrismaOrderRepository implements OrderRepository {
  async findById(id: OrderId): Promise<Order | null> {
    const data = await prisma.order.findUnique({
      where: { id: id.value },
      include: { items: true },
    });
    if (!data) return null;
    // 將 DB 資料轉成 DDD Order 實體
    const items = data.items.map(
      (item) => new OrderItem(item.productId, item.name, item.quantity, item.price)
    );
    return new Order(
      new OrderId(data.id),
      new UserId(data.userId),
      items,
      new OrderStatus(data.status),
      data.createdAt,
      data.updatedAt
    );
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: true },
    });
    return orders.map((data) => {
      const items = data.items.map(
        (item) => new OrderItem(item.productId, item.name, item.quantity, item.price)
      );
      return new Order(
        new OrderId(data.id),
        new UserId(data.userId),
        items,
        new OrderStatus(data.status),
        data.createdAt,
        data.updatedAt
      );
    });
  }

  async save(order: Order): Promise<void> {
    // upsert 訂單主檔
    await prisma.order.upsert({
      where: { id: order.id.value },
      update: {
        userId: order.userId.value,
        status: order.status.value,
        totalAmount: order.totalAmount,
        updatedAt: new Date(),
      },
      create: {
        id: order.id.value,
        userId: order.userId.value,
        status: order.status.value,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: {
          create: order.items.map((item) => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.totalPrice,
          })),
        },
      },
    });
  }

  async delete(id: OrderId): Promise<void> {
    await prisma.order.delete({ where: { id: id.value } });
  }
}
