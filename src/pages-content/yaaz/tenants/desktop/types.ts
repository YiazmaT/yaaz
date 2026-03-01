import {Tenant} from "../types";
import {useTenants} from "../use-tenants";

export interface DesktopViewProps {
  tenants: ReturnType<typeof useTenants>;
}

export interface TenantsTableConfigProps {
  onView: (row: Tenant) => void;
  onEdit: (row: Tenant) => void;
  onResendEmail: (row: Tenant) => void;
}
