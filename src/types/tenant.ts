
export interface TenantConfig {
  tenantId: string;
  tenantName: string;
  userPoolId: string;
  appClientId: string;
  apiGatewayUrl: string;
  apiKey?: string;
  tenantTier?: string;
  tenantEmail?: string;
  tenantPhone?: string;
  tenantAddress?: string;
  dedicatedTenancy?: string;
}