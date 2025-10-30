// 應用服務介面
export interface UseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}

// 查詢介面
export interface Query<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}

// 命令介面
export interface Command<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}