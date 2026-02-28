import {useTenants} from "../use-tenants";

export interface MobileViewProps {
  tenants: ReturnType<typeof useTenants>;
}
