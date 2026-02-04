import {useSales} from "../../use-sales";

export interface FormProps {
  sales: ReturnType<typeof useSales>;
}
