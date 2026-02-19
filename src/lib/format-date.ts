import moment from "moment";

export function formatDate(date: string | Date, withTime?: boolean) {
  if (withTime) return moment(date).format("DD/MM/YYYY HH:mm:ss");
  return moment.utc(date).format("DD/MM/YYYY");
}
