import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as net from 'node:net';

type ServiceCheck = {
  host: string;
  port: number;
  status: 'up' | 'down';
};

@Injectable()
export class HealthService {
  constructor(private readonly configService: ConfigService) {}

  async check(): Promise<Record<string, unknown>> {
    const postgres = await this.checkTcp(
      this.configService.get<string>('DATABASE_HOST', 'postgres'),
      Number(this.configService.get<string>('DATABASE_PORT', '5432')),
    );

    const redis = await this.checkTcp(
      this.configService.get<string>('REDIS_HOST', 'redis'),
      Number(this.configService.get<string>('REDIS_PORT', '6379')),
    );

    const rabbitmq = await this.checkTcp(
      this.configService.get<string>('RABBITMQ_HOST', 'rabbitmq'),
      Number(this.configService.get<string>('RABBITMQ_PORT', '5672')),
    );

    const allUp =
      postgres.status === 'up' && redis.status === 'up' && rabbitmq.status === 'up';

    return {
      status: allUp ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        postgres,
        redis,
        rabbitmq,
      },
    };
  }

  private checkTcp(host: string, port: number): Promise<ServiceCheck> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      const timeoutMs = 1200;

      const onFailure = (): void => {
        socket.destroy();
        resolve({ host, port, status: 'down' });
      };

      socket.setTimeout(timeoutMs);
      socket.once('connect', () => {
        socket.destroy();
        resolve({ host, port, status: 'up' });
      });
      socket.once('timeout', onFailure);
      socket.once('error', onFailure);

      socket.connect(port, host);
    });
  }
}
