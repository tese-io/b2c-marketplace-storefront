import { beforeEach, describe, expect, it, vi } from 'vitest';

// Hoisted mock fns so the vi.mock factories can reference them.
const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  clientFetch: vi.fn(),
  setAuthToken: vi.fn(),
  getCacheTag: vi.fn(),
  decodeToken: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock('@/lib/config', () => ({
  sdk: {
    auth: { login: mocks.login },
    client: { fetch: mocks.clientFetch },
  },
}));

vi.mock('@/lib/data/cookies', () => ({
  setAuthToken: mocks.setAuthToken,
  getCacheTag: mocks.getCacheTag,
  getAuthHeaders: vi.fn(),
  getCacheOptions: vi.fn(),
  getCartId: vi.fn(),
  removeAuthToken: vi.fn(),
  removeCartId: vi.fn(),
}));

vi.mock('@/lib/helpers/token', () => ({
  decodeToken: mocks.decodeToken,
  isTokenExpired: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidateTag: mocks.revalidateTag }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

import { loginWithTeseSSO } from './customer';

describe('loginWithTeseSSO', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCacheTag.mockResolvedValue('customers');
  });

  it('logs in an existing customer without creating one', async () => {
    mocks.login.mockResolvedValue('existing.session.token');
    mocks.decodeToken.mockReturnValue({ actor_id: 'cus_1' });

    const res = await loginWithTeseSSO('key-123');

    expect(res).toEqual({ success: true });
    expect(mocks.login).toHaveBeenCalledWith('customer', 'tese-sso', {
      sso_key: 'key-123',
    });
    // existing customer => no provisioning / refresh round-trip
    expect(mocks.clientFetch).not.toHaveBeenCalled();
    expect(mocks.setAuthToken).toHaveBeenCalledWith('existing.session.token');
    expect(mocks.revalidateTag).toHaveBeenCalledWith('customers');
  });

  it('provisions + refreshes for a first-time (claimable) identity', async () => {
    mocks.login.mockResolvedValue('registration.token');
    mocks.decodeToken.mockReturnValue({}); // no actor_id yet
    mocks.clientFetch
      .mockResolvedValueOnce({}) // POST /store/customers/tese
      .mockResolvedValueOnce({ token: 'fresh.session.token' }); // /auth/token/refresh

    const res = await loginWithTeseSSO('key-abc');

    expect(res).toEqual({ success: true });
    expect(mocks.clientFetch).toHaveBeenCalledTimes(2);
    expect(mocks.clientFetch.mock.calls[0][0]).toBe('/store/customers/tese');
    expect(mocks.clientFetch.mock.calls[1][0]).toBe('/auth/token/refresh');
    // both calls carry the registration bearer token
    expect(mocks.clientFetch.mock.calls[0][1].headers.authorization).toBe(
      'Bearer registration.token'
    );
    // the refreshed token is what gets persisted
    expect(mocks.setAuthToken).toHaveBeenCalledWith('fresh.session.token');
  });

  it('falls back to the original token if refresh returns none', async () => {
    mocks.login.mockResolvedValue('registration.token');
    mocks.decodeToken.mockReturnValue(null);
    mocks.clientFetch
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({}); // refresh returns no token

    const res = await loginWithTeseSSO('key-abc');

    expect(res).toEqual({ success: true });
    expect(mocks.setAuthToken).toHaveBeenCalledWith('registration.token');
  });

  it('returns failure when the auth response is not a string token', async () => {
    mocks.login.mockResolvedValue({ location: 'https://redirect' } as any);

    const res = await loginWithTeseSSO('key-x');

    expect(res.success).toBe(false);
    expect(mocks.setAuthToken).not.toHaveBeenCalled();
  });

  it('returns a failure message when login throws', async () => {
    mocks.login.mockRejectedValue(new Error('Unauthorized'));

    const res = await loginWithTeseSSO('key-x');

    expect(res.success).toBe(false);
    expect(res.message).toMatch(/Unauthorized/);
    expect(mocks.setAuthToken).not.toHaveBeenCalled();
  });
});
