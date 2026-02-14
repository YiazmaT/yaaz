import moment from "moment";

export function formatDate(date: string | Date, withTime?: boolean) {
  return moment(date).format(withTime ? "DD/MM/YYYY HH:mm:ss" : "DD/MM/YYYY");
}
