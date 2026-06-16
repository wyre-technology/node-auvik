import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BillingResource } from '../../src/resources/billing.js';
import { HttpClient } from '../../src/http.js';

// Pins the Auvik billing usage endpoints: client usage is account-level
// (/billing/usage/client) while device usage is per-device
// (/billing/usage/device/{id}, id required in the path). Both filter by DATE
// via filter[fromDate]/filter[thruDate]; tenants is a plain scope param.
describe('BillingResource paths', () => {
  let billing: BillingResource;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/vnd.api+json' }),
      json: async () => ({ data: [{ id: 'b1', type: 'billingUsage', attributes: {} }], links: {}, meta: {} }),
    });
    const http = new HttpClient({
      baseUrl: 'https://api.example.com/v1',
      username: 'u@example.com', apiKey: 'k', timeout: 5000, maxRetries: 1, fetchImpl: mockFetch,
    });
    billing = new BillingResource(async () => http);
  });

  const url = () => String(mockFetch.mock.calls[0][0]);

  it('listUsageClient -> /billing/usage/client with filter[fromDate]/filter[thruDate]', async () => {
    await billing.listUsageClient({ fromDate: '2026-01-01', thruDate: '2026-01-31', tenants: 't1' });
    const u = url();
    expect(u.startsWith('https://api.example.com/v1/billing/usage/client')).toBe(true);
    expect(u).toContain('filter%5BfromDate%5D=2026-01-01');
    expect(u).toContain('filter%5BthruDate%5D=2026-01-31');
    expect(u).toContain('tenants=t1'); // plain scope param, not bracketed
  });

  it('getUsageDevice -> /billing/usage/device/{id} (id in path)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true, status: 200,
      headers: new Headers({ 'content-type': 'application/vnd.api+json' }),
      json: async () => ({ data: { id: 'd1', type: 'billingUsage', attributes: { cost: 5 } }, links: {}, meta: {} }),
    });
    const res = await billing.getUsageDevice('d1', { fromDate: '2026-01-01', thruDate: '2026-01-31' });
    const u = url();
    expect(u.startsWith('https://api.example.com/v1/billing/usage/device/d1')).toBe(true);
    expect(u).toContain('filter%5BfromDate%5D=2026-01-01');
    expect(res.id).toBe('d1');
  });
});
