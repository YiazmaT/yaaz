import moment from "moment";
import {Bill} from "./types";

export function isOverdue(row: Bill) {
  const dueDate = moment.utc(row.due_date).format("YYYY-MM-DD");
  const today = moment().format("YYYY-MM-DD");
  return row.status === "pending" && dueDate < today;
}
