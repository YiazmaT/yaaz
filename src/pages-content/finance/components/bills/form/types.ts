import {useBills} from "../use-bills";

export interface BillFormProps {
  bills: ReturnType<typeof useBills>;
}
