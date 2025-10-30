import { UseCase } from '../../../../shared/application/interfaces/use-case';
import { GetStockRequest, GetStockResponse } from '../dto/inventory-dto';
import { NotFoundError } from '../../../../shared/application/exceptions';
import { PrismaClient } from '@prisma/client';

export class GetStockUseCase implements UseCase<GetStockRequest, GetStockResponse> {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  async execute(request: GetStockRequest): Promise<GetStockResponse> {
    const product = await this.prisma.product.findUnique({
      where: { id: request.productId },
      select: {
        id: true,
        stock: true,
        updatedAt: true
      }
    });

    if (!product) {
      throw new NotFoundError('Product', request.productId);
    }

    return {
      productId: product.id,
      quantity: product.stock,
      updatedAt: product.updatedAt
    };
  }
}