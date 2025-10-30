// 共用的領域事件介面
export interface DomainEvent {
  readonly occurredOn: Date;
  readonly eventType: string;
  readonly aggregateId: string;
}

// 領域事件發布器介面
export interface DomainEventPublisher {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void;
}

// 簡單的記憶體事件發布器實作
export class InMemoryDomainEventPublisher implements DomainEventPublisher {
  private handlers: Map<string, Array<(event: DomainEvent) => Promise<void>>> = new Map();

  async publish(event: DomainEvent): Promise<void> {
    const eventHandlers = this.handlers.get(event.eventType) || [];
    await Promise.all(eventHandlers.map(handler => handler(event)));
  }

  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }
}