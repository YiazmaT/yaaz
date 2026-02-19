import {useTranslate} from "@/src/contexts/translation-context";
import {BillStatusEnum} from "./types";

export function useFinanceConstants() {
  const {translate} = useTranslate();

  const billStatuses = {
    pending: {value: BillStatusEnum.pending, label: translate("finance.bills.statuses.pending"), color: "warning" as const},
    paid: {value: BillStatusEnum.paid, label: translate("finance.bills.statuses.paid"), color: "success" as const},
    overdue: {value: BillStatusEnum.overdue, label: translate("finance.bills.statuses.overdue"), color: "error" as const},
  };

  return {billStatuses};
}
