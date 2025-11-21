// LINE Webhook 被動推播處理
import crypto from 'crypto';
import axios from 'axios';

export interface ILineWebhookHandler {
    /**
     * 處理 LINE webhook event
     * @param req HTTP request 物件（可選）
     * @param body webhook 傳入的原始字串
     * @param signature X-Line-Signature header
     */
    handleWebhook(req: any, body: string, signature: string): Promise<{ status: number; body: any }>;
}

export class LineWebhookHandler implements ILineWebhookHandler {
    private channelSecret: string;

    constructor() {
        this.channelSecret = process.env.LINE_CHANNEL_SECRET || '';
    }

    /**
     * 驗證 LINE webhook 簽名
     */
    private verifySignature(body: string, signature: string): boolean {
        if (!this.channelSecret) return false;
        const hash = crypto.createHmac('sha256', this.channelSecret).update(body).digest('base64');
        return hash === signature;
    }

    /**
     * 處理 webhook event
     */
    async handleWebhook(req: any, body: string, signature: string): Promise<{ status: number; body: any }> {
        if (!this.verifySignature(body, signature)) {
            return { status: 401, body: { error: 'Invalid signature' } };
        }
        let events: any[] = [];
        try {
            const parsed = JSON.parse(body);
            events = parsed.events || [];
        } catch (e) {
            return { status: 400, body: { error: 'Invalid JSON' } };
        }
        // 回覆文字訊息或觸發 LIFF Flex Message
        for (const event of events) {
            if (event.type === 'message' && event.message.type === 'text') {
                const text = event.message.text.trim();
                if (text.toLowerCase() === 'liff') {
                    // 這裡請填入你的 LIFF 網址
                    const liffUrl = process.env.LIFF_URL || '';
                    await this.replyLiffMessage(event.replyToken, liffUrl);
                } else {
                    // 自動回覆收到的訊息內容
                    await this.replyMessage(event.replyToken, `您說：「${event.message.text}」`);
                }
            }
        }
        return { status: 200, body: { success: true } };
    }

    /**
     * 回覆訊息給 LINE 使用者
     */
    private async replyMessage(replyToken: string, text: string) {
        const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
        if (!channelAccessToken) return;
        await axios.post(
            'https://api.line.me/v2/bot/message/reply',
            {
                replyToken,
                messages: [
                    {
                        type: 'text',
                        text,
                    },
                ],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${channelAccessToken}`,
                },
            }
        );
    }

    /**
     * 回覆 LIFF Flex Message 給 LINE 使用者
     * @param replyToken 回覆 token
     * @param liffUrl LIFF 應用網址
     * @param altText 替代文字，預設 "請點擊下方按鈕開啟 LIFF 應用"
     */
    private async replyLiffMessage(replyToken: string, liffUrl: string, altText: string = '請點擊下方按鈕開啟 LIFF 應用') {
        const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
        if (!channelAccessToken) return;
        const flexMessage = {
            type: 'flex',
            altText,
            contents: {
                type: 'bubble',
                body: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'text',
                            text: '開啟 LIFF 應用',
                            weight: 'bold',
                            size: 'md',
                            margin: 'md',
                        },
                        {
                            type: 'button',
                            style: 'primary',
                            action: {
                                type: 'uri',
                                label: '點我開啟',
                                uri: liffUrl,
                            },
                            margin: 'lg',
                        },
                    ],
                },
            },
        };
        await axios.post(
            'https://api.line.me/v2/bot/message/reply',
            {
                replyToken,
                messages: [flexMessage],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${channelAccessToken}`,
                },
            }
        );
    }
}
