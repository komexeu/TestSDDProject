
import { PrismaClient } from '@prisma/client';
import { OrderRepository } from '@domains/order/domain/repositories/order-repository';
import { Order as OrderDomain, OrderId, UserId } from '@domains/order/domain/entities/order';
import { OrderItem } from '@domains/order/domain/value-objects/order-item';

const prisma = new PrismaClient();

export class PrismaOrderRepository implements OrderRepository {

  async findById(id: string): Promise<OrderDomain | null> {
    const order = await prisma.order.findUnique({
      where: { id: id },
      include: { items: true },
    });
    if (!order) return null;
    return this.toDomain(order);
  }

  async findByUserId(userId: string): Promise<OrderDomain[]> {
    const orders = await prisma.order.findMany({
      where: { userId, isDelete: false },
      include: { items: true },
    });
    return orders.map((o) => this.toDomain(o));
  }

  async create(order: OrderDomain): Promise<string> {
    const created = await prisma.order.create({
      data: {
        id: order.id.value,
        userId: order.userId.value,
        description: order.description,
        status: order.status.value,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: {
          create: order.items.map((item: OrderItem) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.totalPrice,
          })),
        },
      },
      select: { id: true },
    });
    return created.id;
  }

  async edit(order: OrderDomain): Promise<void> {
    // 1. 取得現有 order items
    const dbOrder = await prisma.order.findUnique({
      where: { id: order.id.value },
      include: { items: true },
    });
    if (!dbOrder) throw new Error('Order not found');
    const dbItems = dbOrder.items;

    // 2. 比對 items
    const domainItems = order.items;
    const domainItemIds = new Set(domainItems.map(i => i.id));
    const dbItemIds = new Set(dbItems.map(i => i.id));

    // 要刪除的 item（db 有但 domain 沒有）
    const toDelete = dbItems.filter(i => !domainItemIds.has(i.id)).map(i => i.id);
    // 要新增的 item（domain 有但 db 沒有）
    const toCreate = domainItems.filter(i => !dbItemIds.has(i.id));
    // 要更新的 item（id 都有）
    const toUpdate = domainItems.filter(i => dbItemIds.has(i.id));

    // 3. 執行刪除、新增、更新
    await prisma.$transaction([
      // 刪除
      ...(toDelete.length > 0 ? [
        prisma.orderItem.deleteMany({
          where: { id: { in: toDelete } },
        })
      ] : []),
      // 新增
      ...toCreate.map(item =>
        prisma.orderItem.create({
          data: {
            orderId: order.id.value,
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.totalPrice,
          }
        })
      ),
      // 更新
      ...toUpdate.map(item =>
        prisma.orderItem.update({
          where: { id: item.id },
          data: {
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.totalPrice,
            productId: item.productId,
          }
        })
      ),
      // 更新 order 主檔
      prisma.order.update({
        where: { id: order.id.value },
        data: {
          description: order.description,
          status: order.status.value,
          totalAmount: order.totalAmount,
          updatedAt: new Date(),
        }
      })
    ]);
  }

  async delete(id: string): Promise<void> {
    await prisma.order.update({
      where: { id: id },
      data: { isDelete: true },
    });
  }

  // 將 Prisma 資料轉換為 Domain Entity
  private toDomain(order: any): OrderDomain {
    const { id, userId, description, status, items, createdAt, updatedAt } = order;
    const orderDomain = new OrderDomain(
      new OrderId(id),
      { value: userId } as any, // UserId
      items.map((item: any) => new OrderItem(
        item.id,
        item.productId,
        item.name,
        item.quantity,
        item.price
      )),
      description,
      { value: status } as any,
      createdAt,
      updatedAt
    );
    // 補上 isDelete 欄位
    (orderDomain as any).isDelete = order.isDelete;
    return orderDomain;
  }
}
