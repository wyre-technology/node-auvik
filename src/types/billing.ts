export interface BillingUsageClient {
  id: string;
  tenantId?: string;
  tenantName?: string;
  clientName?: string;
  period?: string;
  deviceCount?: number;
  billableDeviceCount?: number;
  networkDeviceCount?: number;
  serverDeviceCount?: number;
  workstationDeviceCount?: number;
  otherDeviceCount?: number;
  totalCost?: number;
}

export interface BillingUsageDevice {
  id: string;
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
  tenantId?: string;
  period?: string;
  billable?: boolean;
  cost?: number;
  lastSeenTime?: string;
}

// Auvik billing usage is queried by a DATE range. fromDate/thruDate are sent as
// the JSON:API params filter[fromDate]/filter[thruDate] (YYYY-MM-DD); tenants is
// a plain scope param.
export interface BillingUsageOptions {
  fromDate?: string;
  thruDate?: string;
  tenants?: string;
  pageSize?: number;
  pageAfter?: string;
}
