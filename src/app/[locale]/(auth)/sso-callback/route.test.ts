import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({ loginWithTeseSSO: vi.fn() }));
vi.mock('@/lib/data/customer', () => ({
  loginWithTeseSSO: mocks.loginWithTeseSSO,
}));

import { GET } from './route';

const params = () => Promise.resolve({ locale: 'pl' });
const req = (url: string) => new NextRequest(`http://localhost:3000${url}`);

describe('sso-callback route handler', () => {
  beforeEach(() => vi.clearAllMocks());

  it('redirects to login when the key is missing (no exchange attempted)', async () => {
    const res = await GET(req('/pl/sso-callback'), { params: params() });
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain(
      '/pl/login?error=sso_missing_key'
    );
    expect(mocks.loginWithTeseSSO).not.toHaveBeenCalled();
  });

  it('exchanges the key and redirects home on success', async () => {
    mocks.loginWithTeseSSO.mockResolvedValue({ success: true });
    const res = await GET(req('/pl/sso-callback?key=abc'), { params: params() });
    expect(mocks.loginWithTeseSSO).toHaveBeenCalledWith('abc');
    expect(res.headers.get('location')).toBe('http://localhost:3000/pl');
  });

  it('honours the redirect param on success', async () => {
    mocks.loginWithTeseSSO.mockResolvedValue({ success: true });
    const res = await GET(req('/pl/sso-callback?key=abc&redirect=/products/x'), {
      params: params(),
    });
    expect(res.headers.get('location')).toBe(
      'http://localhost:3000/pl/products/x'
    );
  });

  it('redirects to login with sso_failed when the exchange fails', async () => {
    mocks.loginWithTeseSSO.mockResolvedValue({ success: false });
    const res = await GET(req('/pl/sso-callback?key=bad'), { params: params() });
    expect(res.headers.get('location')).toContain('/pl/login?error=sso_failed');
  });
});
