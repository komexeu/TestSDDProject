// 基礎實體抽象類別
import { Id } from '@shared/domain/value-objects/common';
import { DomainEvent } from '@shared/domain/events/domain-event';

export abstract class Entity<TId extends Id> {
  protected readonly _id: TId;
  private _domainEvents: DomainEvent[] = [];

  constructor(id: TId) {
    this._id = id;
  }

  public get id(): TId {
    return this._id;
  }

  public equals(other: Entity<TId>): boolean {
    return this._id.equals(other._id);
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public clearDomainEvents(): void {
    this._domainEvents = [];
  }

  public getDomainEvents(): readonly DomainEvent[] {
    return this._domainEvents;
  }
}

// 聚合根抽象類別
export abstract class AggregateRoot<TId extends Id> extends Entity<TId> {
  constructor(id: TId) {
    super(id);
  }
}