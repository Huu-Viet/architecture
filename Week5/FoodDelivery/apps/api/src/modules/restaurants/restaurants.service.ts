import { Injectable } from '@nestjs/common';

@Injectable()
export class RestaurantsService {
  list(): Array<Record<string, unknown>> {
    return [
      {
        id: 'res-001',
        name: 'Pho 24h',
        cuisine: 'Vietnamese',
        isOpen: true,
      },
      {
        id: 'res-002',
        name: 'Burger Station',
        cuisine: 'Fast Food',
        isOpen: true,
      },
    ];
  }
}
