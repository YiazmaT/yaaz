import {useSales} from "../use-sales";

export interface DesktopViewProps {
  sales: ReturnType<typeof useSales>;
}
