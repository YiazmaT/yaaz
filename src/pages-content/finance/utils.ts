import moment from "moment";
import {BillInstallment} from "./types";

export function isOverdue(row: BillInstallment) {
  return row.status === "pending" && moment.utc(row.due_date).isBefore(moment(), "day");
}
