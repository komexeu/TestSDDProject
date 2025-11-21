// LINE 推播 service interface & 基本實作

import axios from 'axios';

export interface ILinePushService {
  /**
   * 發送 LINE 推播
   * @param userId 用戶 ID
   * @param orderId 訂單 ID
   * @param message 訊息內容
   * @returns Promise<{ success: boolean; error?: string }>
   */
  pushOrderStatus(userId: string, orderId: string, message: string): Promise<{ success: boolean; error?: string }>;
}

// 可擴充多通道推播 service interface
export interface PushService {
  pushOrderStatus(userId: string, orderId: string, message: string, channel: 'LINE' | 'SMS' | 'EMAIL'): Promise<{ success: boolean; error?: string }>;
}

// 預設 LINE 推播 service 實作
export class LinePushService implements ILinePushService {
  private channelAccessToken: string;

  constructor() {
    this.channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
  }

  /**
   * 發送 LINE 推播訊息 (push message)
   * 需先於 LINE Developers 後台將 userId 加入好友
   */
  async pushOrderStatus(userId: string, orderId: string, message: string): Promise<{ success: boolean; error?: string }> {
    if (!this.channelAccessToken) {
      return { success: false, error: 'Missing LINE_CHANNEL_ACCESS_TOKEN' };
    }
    if (!userId) {
      return { success: false, error: 'Missing userId' };
    }
    try {
      const res = await axios.post(
        'https://api.line.me/v2/bot/message/push',
        {
          to: userId,
          messages: [
            {
              type: 'text',
              text: `[訂單通知 #${orderId}]\n${message}`,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.channelAccessToken}`,
          },
        }
      );
      if (res.status === 200) {
        return { success: true };
      } else {
        return { success: false, error: `LINE API status ${res.status}` };
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || 'Unknown error';
      return { success: false, error: errorMsg };
    }
  }
}
