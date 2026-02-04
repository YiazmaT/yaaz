import {useTenants} from "../../use-tenants";

export interface FormProps {
  tenants: ReturnType<typeof useTenants>;
  imageSize?: number;
}
