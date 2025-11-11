import axios from 'axios';
import { Context } from 'hono';
import { injectable } from 'tsyringe';

const LINE_CLIENT_ID = process.env.LINE_CLIENT_ID || '';
const LINE_CLIENT_SECRET = process.env.LINE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.LINE_REDIRECT_URI || '';


@injectable()
export class LineAuthController {
    constructor(
    ) { }

    async auth(c: Context) {
        try {
            const { code } = await c.req.json();
            if (!code) {
                return c.json({ error: 'Missing code' }, 400);
            }
            // 1. 取得 access_token
            const tokenRes = await axios.post<{ access_token: string }>(
                'https://api.line.me/oauth2/v2.1/token',
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: REDIRECT_URI,
                    client_id: LINE_CLIENT_ID,
                    client_secret: LINE_CLIENT_SECRET,
                }),
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                }
            );
            const { access_token } = tokenRes.data;

            // 2. 取得用戶 profile
            const profileRes = await axios.get<{
                displayName: string;
                pictureUrl: string;
                userId: string;
                statusMessage?: string;
            }>('https://api.line.me/v2/profile', {
                headers: { Authorization: `Bearer ${access_token}` },
            });
            const { displayName, pictureUrl, userId, statusMessage } = profileRes.data;
            return c.json({ displayName, pictureUrl, userId, statusMessage });
        } catch (err: any) {
            return c.json({ error: err?.response?.data || err.message }, 500);
        }
    }
}
