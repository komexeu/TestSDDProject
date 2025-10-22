import { describe, it, expect } from '@jest/globals';
import { adminAuth } from '../src/middleware/auth';

const mockContext = (role?: string) => ({
  req: { header: (key: string) => (key === 'x-role' ? role : undefined) },
  json: jest.fn(),
});

describe('adminAuth middleware', () => {
  it('允許 x-role=admin 通過', async () => {
    const c: any = mockContext('admin');
    let called = false;
    await adminAuth(c, async () => { called = true; });
    expect(called).toBe(true);
  });

  it('拒絕非 admin', async () => {
    const c: any = mockContext('user');
    const result = await adminAuth(c, jest.fn());
  expect(result).toEqual({ message: '僅限管理員操作' });
  });

  it('拒絕無 x-role', async () => {
    const c: any = mockContext();
    const result = await adminAuth(c, jest.fn());
  expect(result).toEqual({ message: '僅限管理員操作' });
  });
});
