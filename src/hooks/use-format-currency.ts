import {useTenant} from "@/src/contexts/tenant-context";
import {formatCurrency} from "@/src/utils/format-currency";

export function useFormatCurrency() {
  const {tenant} = useTenant();

  return (value: number | string | null | undefined, maxDecimals: number = 2) => {
    return formatCurrency(value, maxDecimals, tenant?.currency_type);
  };
}
