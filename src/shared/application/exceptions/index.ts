// 應用程式例外基礎類別
export class ApplicationError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 領域例外
export class DomainError extends ApplicationError {
  constructor(message: string, code?: string) {
    super(message, code);
  }
}

// 驗證例外
export class ValidationError extends ApplicationError {
  constructor(message: string, public readonly field?: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

// 未找到例外
export class NotFoundError extends ApplicationError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND');
  }
}

// 業務規則例外
export class BusinessRuleError extends DomainError {
  constructor(message: string) {
    super(message, 'BUSINESS_RULE_VIOLATION');
  }
}

// 衝突例外
export class ConflictError extends ApplicationError {
  constructor(message: string) {
    super(message, 'CONFLICT');
  }
}