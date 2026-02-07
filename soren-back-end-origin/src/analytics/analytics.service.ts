import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AnalyticsEvent, Order, Product, User } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEvent)
    private readonly analyticsRepository: Repository<AnalyticsEvent>,
  ) {}

  async trackEvent(params: {
    eventType: string;
    sessionId?: string;
    user?: User;
    product?: Product;
    order?: Order;
    metadata?: Record<string, any>;
  }): Promise<AnalyticsEvent> {
    const event = this.analyticsRepository.create({
      eventType: params.eventType,
      sessionId: params.sessionId,
      user: params.user,
      product: params.product,
      order: params.order,
      metadata: params.metadata,
    });
    return this.analyticsRepository.save(event);
  }

  async listEvents(limit = 50): Promise<AnalyticsEvent[]> {
    return this.analyticsRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
