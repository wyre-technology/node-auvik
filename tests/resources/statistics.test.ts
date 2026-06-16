import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StatisticsResource } from '../../src/resources/statistics.js';
import { HttpClient } from '../../src/http.js';

// Pins the corrected Auvik statistics endpoints: /stat/{type}/{statId} with
// filter[fromTime] / filter[interval] / filter[thruTime] params (the bare
// /stat/device etc. with unwrapped params returned 404).
describe('StatisticsResource paths', () => {
  let stats: StatisticsResource;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/vnd.api+json' }),
      json: async () => ({ data: [{ id: 's1', type: 'statistic', attributes: {} }], links: {}, meta: {} }),
    });
    const http = new HttpClient({
      baseUrl: 'https://api.example.com/v1',
      username: 'u@example.com', apiKey: 'k', timeout: 5000, maxRetries: 1, fetchImpl: mockFetch,
    });
    stats = new StatisticsResource(async () => http);
  });

  const url = () => String(mockFetch.mock.calls[0][0]);

  it('device -> /stat/device/{statId} with filter[fromTime]/filter[interval]', async () => {
    await stats.getDeviceStatistics({ statId: 'cpuUtilization', fromTime: 'T1', interval: 'hour', thruTime: 'T2' });
    const u = url();
    expect(u.startsWith('https://api.example.com/v1/stat/device/cpuUtilization')).toBe(true);
    expect(u).toContain('filter%5BfromTime%5D=T1');   // filter[fromTime]
    expect(u).toContain('filter%5Binterval%5D=hour'); // filter[interval]
    expect(u).toContain('filter%5BthruTime%5D=T2');
  });

  it('interface -> /stat/interface/{statId}', async () => {
    await stats.getInterfaceStatistics({ statId: 'bandwidth', fromTime: 'T1', interval: 'hour' });
    expect(url().startsWith('https://api.example.com/v1/stat/interface/bandwidth')).toBe(true);
  });

  it('snmpPoller -> /stat/oid/{statId}', async () => {
    await stats.getSnmpPollerStatistics({ statId: 'abc', filters: { 'filter[deviceId]': 'd1' } });
    const u = url();
    expect(u.startsWith('https://api.example.com/v1/stat/oid/abc')).toBe(true);
    expect(u).toContain('filter%5BdeviceId%5D=d1');
  });

  it('passes extra filters through (e.g. filter[deviceId])', async () => {
    await stats.getDeviceStatistics({ statId: 'cpuUtilization', fromTime: 'T1', interval: 'hour', filters: { 'filter[deviceId]': 'dev9' } });
    expect(url()).toContain('filter%5BdeviceId%5D=dev9');
  });
});
