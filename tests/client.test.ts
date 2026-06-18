import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuvikClient } from '../src/client.js';
import { AuvikAuthError } from '../src/errors.js';

describe('AuvikClient', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.clearAllMocks();
  });

  it('should create a client with required config', () => {
    const client = new AuvikClient({
      username: 'test@example.com',
      apiKey: 'test-key',
      fetchImpl: mockFetch,
    });

    expect(client).toBeDefined();
    expect(client.tenants).toBeDefined();
    expect(client.inventoryDevice).toBeDefined();
    expect(client.alerts).toBeDefined();
  });

  it('should use provided region without probing', async () => {
    const client = new AuvikClient({
      username: 'test@example.com',
      apiKey: 'test-key',
      region: 'us1',
      fetchImpl: mockFetch,
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
      headers: new Headers(),
    });

    await client.credentials.verify();

    expect(mockFetch).toHaveBeenCalledWith(
      'https://auvikapi.us1.my.auvik.com/v1/authentication/verify',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('Basic'),
        }),
      })
    );
  });

  it('should use custom base URL when provided', async () => {
    const client = new AuvikClient({
      username: 'test@example.com',
      apiKey: 'test-key',
      baseUrl: 'https://custom.api.example.com/v1',
      fetchImpl: mockFetch,
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
      headers: new Headers(),
    });

    await client.credentials.verify();

    expect(mockFetch).toHaveBeenCalledWith(
      'https://custom.api.example.com/v1/authentication/verify',
      expect.any(Object)
    );
  });

  it('request() performs an arbitrary GET against the region base URL with params', async () => {
    const client = new AuvikClient({
      username: 'test@example.com',
      apiKey: 'test-key',
      region: 'us1',
      fetchImpl: mockFetch,
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: [], links: {}, meta: {} }),
      headers: new Headers({ 'content-type': 'application/vnd.api+json' }),
    });

    await client.request('/alert/history/info', {
      params: { 'filter[detectedTimeAfter]': '2026-06-01', 'page[first]': 50 },
    });

    const calledUrl = String(mockFetch.mock.calls[0][0]);
    expect(calledUrl.startsWith('https://auvikapi.us1.my.auvik.com/v1/alert/history/info')).toBe(true);
    expect(calledUrl).toContain('filter%5BdetectedTimeAfter%5D=2026-06-01');
    expect(calledUrl).toContain('page%5Bfirst%5D=50');
    expect(mockFetch.mock.calls[0][1]).toMatchObject({ method: 'GET' });
  });

  it('request() forwards method and JSON body for POST', async () => {
    const client = new AuvikClient({
      username: 'test@example.com',
      apiKey: 'test-key',
      region: 'us1',
      fetchImpl: mockFetch,
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => ({}),
      headers: new Headers(),
    });

    await client.request('/alert/dismiss/a1', { method: 'POST', body: { reason: 'noise' } });

    expect(String(mockFetch.mock.calls[0][0])).toBe('https://auvikapi.us1.my.auvik.com/v1/alert/dismiss/a1');
    const init = mockFetch.mock.calls[0][1] as { method: string; body?: string };
    expect(init.method).toBe('POST');
    expect(String(init.body)).toContain('reason');
  });
});