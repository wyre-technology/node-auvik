import type { HttpClient } from '../http.js';
import type { JsonApiResponse, Page, PaginationOptions } from '../types/json-api.js';
import type {
  StatisticsOptions,
  DeviceStatistics,
  InterfaceStatistics,
  ServiceStatistics,
  ComponentStatistics,
  SnmpPollerStatistics
} from '../types/statistics.js';

// Auvik statistics endpoints are `/stat/{type}/{statId}`. Time-series stats
// (device/interface/service/component) require `filter[fromTime]`,
// `filter[interval]`, AND `filter[thruTime]` — the API 400s without thruTime —
// so when a window is requested (fromTime present) but thruTime is omitted it
// defaults to now. Extra per-type filters (e.g. `filter[deviceId]`) are passed
// through `options.filters` already keyed as the API expects. `tenants` scopes
// to client tenant(s).
function timeStatParams(options: StatisticsOptions & PaginationOptions): Record<string, unknown> {
  const { fromTime, interval, thruTime, tenants, filters = {}, pageSize, pageAfter } = options;
  const resolvedThruTime = thruTime || (fromTime ? new Date().toISOString() : undefined);
  return {
    ...(fromTime ? { 'filter[fromTime]': fromTime } : {}),
    ...(interval ? { 'filter[interval]': interval } : {}),
    ...(resolvedThruTime ? { 'filter[thruTime]': resolvedThruTime } : {}),
    ...(tenants ? { tenants } : {}),
    ...filters,
    ...(pageSize ? { 'page[first]': pageSize } : {}),
    ...(pageAfter ? { 'page[after]': pageAfter } : {}),
  };
}

function mapPage<T>(response: JsonApiResponse<T>): Page<T> {
  const data = Array.isArray(response.data) ? response.data : [response.data];
  return {
    data: data.map(item => ({ id: item.id, type: item.type, ...item.attributes })) as T[],
    links: response.links || {},
    meta: response.meta || {},
  };
}

export class StatisticsResource {
  constructor(private getClient: () => Promise<HttpClient>) {}

  async getDeviceStatistics(options: StatisticsOptions & PaginationOptions): Promise<Page<DeviceStatistics>> {
    const client = await this.getClient();
    const response = await client.request<JsonApiResponse<DeviceStatistics>>(
      `/stat/device/${options.statId}`,
      { params: timeStatParams(options) }
    );
    return mapPage(response);
  }

  async getInterfaceStatistics(options: StatisticsOptions & PaginationOptions): Promise<Page<InterfaceStatistics>> {
    const client = await this.getClient();
    const response = await client.request<JsonApiResponse<InterfaceStatistics>>(
      `/stat/interface/${options.statId}`,
      { params: timeStatParams(options) }
    );
    return mapPage(response);
  }

  async getServiceStatistics(options: StatisticsOptions & PaginationOptions): Promise<Page<ServiceStatistics>> {
    const client = await this.getClient();
    const response = await client.request<JsonApiResponse<ServiceStatistics>>(
      `/stat/service/${options.statId}`,
      { params: timeStatParams(options) }
    );
    return mapPage(response);
  }

  async getComponentStatistics(
    options: StatisticsOptions & PaginationOptions & { componentType: string }
  ): Promise<Page<ComponentStatistics>> {
    const client = await this.getClient();
    const response = await client.request<JsonApiResponse<ComponentStatistics>>(
      `/stat/component/${options.componentType}/${options.statId}`,
      { params: timeStatParams(options) }
    );
    return mapPage(response);
  }

  // SNMP-poller (OID) statistics live at /stat/oid/{statId} and are filtered by
  // device/OID rather than a fromTime/interval time window.
  async getSnmpPollerStatistics(options: StatisticsOptions & PaginationOptions): Promise<Page<SnmpPollerStatistics>> {
    const { tenants, filters = {}, pageSize, pageAfter } = options;
    const params = {
      ...(tenants ? { tenants } : {}),
      ...filters,
      ...(pageSize ? { 'page[first]': pageSize } : {}),
      ...(pageAfter ? { 'page[after]': pageAfter } : {}),
    };
    const client = await this.getClient();
    const response = await client.request<JsonApiResponse<SnmpPollerStatistics>>(
      `/stat/oid/${options.statId}`,
      { params }
    );
    return mapPage(response);
  }
}
