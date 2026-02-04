import {useSales} from "../use-sales";

export interface MobileViewProps {
  sales: ReturnType<typeof useSales>;
}
