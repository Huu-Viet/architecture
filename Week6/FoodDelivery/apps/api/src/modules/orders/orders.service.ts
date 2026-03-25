import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  create(payload: CreateOrderDto): Record<string, unknown> {
    return {
      orderId: `ord-${Date.now()}`,
      restaurantId: payload.restaurantId,
      userId: payload.userId,
      items: payload.items,
      totalAmount: payload.totalAmount,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      note: 'Stub order created in monolith phase.',
    };
  }
}
