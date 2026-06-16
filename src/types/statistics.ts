export interface StatisticsOptions {
  // Auvik statistics endpoints are /stat/{type}/{statId}; statId selects the
  // specific metric (e.g. 'cpuUtilization', 'bandwidth') and is part of the path.
  statId: string;
  // Time-series stats require filter[fromTime], filter[interval], and
  // filter[thruTime]; thruTime defaults to now when omitted. (OID/SNMP-poller
  // stats don't use these.)
  fromTime?: string;
  interval?: string;
  thruTime?: string;
  // Scope to specific client tenant(s).
  tenants?: string;
  // Extra type-specific filters, already keyed as the API expects
  // (e.g. { 'filter[deviceId]': '...' }).
  filters?: Record<string, string | number>;
  [key: string]: unknown;
}

export interface DeviceStatistics {
  id: string;
  deviceId?: string;
  timestamp?: string;
  cpuUtilization?: number;
  memoryUtilization?: number;
  diskUtilization?: number;
  uptimeSeconds?: number;
  temperature?: number;
  powerConsumption?: number;
}

export interface InterfaceStatistics {
  id: string;
  interfaceId?: string;
  deviceId?: string;
  timestamp?: string;
  rxBytesPerSecond?: number;
  txBytesPerSecond?: number;
  rxPacketsPerSecond?: number;
  txPacketsPerSecond?: number;
  utilization?: number;
  errors?: number;
  discards?: number;
}

export interface ServiceStatistics {
  id: string;
  serviceId?: string;
  deviceId?: string;
  timestamp?: string;
  responseTime?: number;
  availability?: number;
  packetLoss?: number;
}

export interface ComponentStatistics {
  id: string;
  componentId?: string;
  deviceId?: string;
  timestamp?: string;
  status?: string;
  value?: number;
  threshold?: number;
}

export interface SnmpPollerStatistics {
  id: string;
  pollerId?: string;
  deviceId?: string;
  timestamp?: string;
  polledValue?: number;
  oid?: string;
  status?: string;
}