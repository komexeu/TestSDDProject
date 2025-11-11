// 新的 DDD 架構主入口點

import 'reflect-metadata';
import app from './app';

export default app;
export const callback = app.fetch;
