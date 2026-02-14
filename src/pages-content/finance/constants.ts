import {useTranslate} from "@/src/contexts/translation-context";
import {BillStatusEnum, RecurrenceIntervalEnum} from "./types";

export function useFinanceConstants() {
  const {translate} = useTranslate();

  const billStatuses = {
    pending: {value: BillStatusEnum.pending, label: translate("finance.bills.statuses.pending"), color: "warning" as const},
    paid: {value: BillStatusEnum.paid, label: translate("finance.bills.statuses.paid"), color: "success" as const},
    overdue: {value: BillStatusEnum.overdue, label: translate("finance.bills.statuses.overdue"), color: "error" as const},
    cancelled: {value: BillStatusEnum.cancelled, label: translate("finance.bills.statuses.cancelled"), color: "default" as const},
  };

  const recurrenceIntervals = {
    weekly: {value: RecurrenceIntervalEnum.weekly, label: translate("finance.bills.intervals.weekly")},
    biweekly: {value: RecurrenceIntervalEnum.biweekly, label: translate("finance.bills.intervals.biweekly")},
    monthly: {value: RecurrenceIntervalEnum.monthly, label: translate("finance.bills.intervals.monthly")},
    bimonthly: {value: RecurrenceIntervalEnum.bimonthly, label: translate("finance.bills.intervals.bimonthly")},
    quarterly: {value: RecurrenceIntervalEnum.quarterly, label: translate("finance.bills.intervals.quarterly")},
    semiannual: {value: RecurrenceIntervalEnum.semiannual, label: translate("finance.bills.intervals.semiannual")},
    annual: {value: RecurrenceIntervalEnum.annual, label: translate("finance.bills.intervals.annual")},
  };

  return {billStatuses, recurrenceIntervals};
}
