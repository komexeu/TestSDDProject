// 推播記錄 Entity
export interface PushLog {
  id: string;
  userId: string;
  orderId: string;
  channel: 'LINE' | 'SMS' | 'EMAIL';
  message: string;
  status: 'SUCCESS' | 'FAILED' | 'RETRYING';
  error?: string;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}
