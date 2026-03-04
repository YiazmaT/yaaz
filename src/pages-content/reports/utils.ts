import * as yup from "yup";

export function buildDateRangeSchema(today: string, translate: (key: string) => string) {
  return {
    dateFrom: yup
      .string()
      .required(translate("reports.errors.dateRequired"))
      .test("not-future", translate("reports.errors.futureDateNotAllowed"), (value) => {
        if (!value) return true;
        return value <= today;
      })
      .test("from-before-to", translate("reports.errors.dateFromGreaterThanTo"), function (value) {
        const {dateTo} = this.parent;
        if (!value || !dateTo) return true;
        return value <= dateTo;
      }),
    dateTo: yup
      .string()
      .required(translate("reports.errors.dateRequired"))
      .test("not-future", translate("reports.errors.futureDateNotAllowed"), (value) => {
        if (!value) return true;
        return value <= today;
      }),
  };
}
