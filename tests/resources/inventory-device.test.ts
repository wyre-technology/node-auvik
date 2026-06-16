import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InventoryDeviceResource } from '../../src/resources/inventory-device.js';
import { HttpClient } from '../../src/http.js';

// Pins the corrected device endpoints. Device "details" use the singular
// /inventory/device/detail (Auvik), NOT plural /details (which 404s); single
// info read is /inventory/device/info/{id}.
describe('InventoryDeviceResource paths', () => {
  let devices: InventoryDeviceResource;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/vnd.api+json' }),
      json: async () => ({ data: { id: 'd1', type: 'device', attributes: {} }, links: {}, meta: {} }),
    });
    const http = new HttpClient({
      baseUrl: 'https://api.example.com/v1',
      username: 'u@example.com', apiKey: 'k', timeout: 5000, maxRetries: 1, fetchImpl: mockFetch,
    });
    devices = new InventoryDeviceResource(async () => http);
  });

  const url = () => String(mockFetch.mock.calls[0][0]);

  it('getInfo -> /inventory/device/info/{id}', async () => {
    await devices.getInfo('d1');
    expect(url()).toBe('https://api.example.com/v1/inventory/device/info/d1');
  });

  it('getDetails -> /inventory/device/detail/{id} (singular)', async () => {
    await devices.getDetails('d1');
    expect(url()).toBe('https://api.example.com/v1/inventory/device/detail/d1');
  });

  it('listDetails -> /inventory/device/detail', async () => {
    await devices.listDetails();
    expect(url().startsWith('https://api.example.com/v1/inventory/device/detail')).toBe(true);
    expect(url()).not.toContain('/details');
  });
});
