import * as yup from "yup";
import moment from "moment";
import {AuditActionType, AuditModule} from "../../types";

export interface AuditFilterFormValues {
  module: AuditModule | null;
  action_type: AuditActionType | null;
  date_from: string;
  date_to: string;
}

export function getToday(): string {
  return moment().format("YYYY-MM-DD");
}

export function getOneMonthAgo(): string {
  return moment().subtract(1, "month").format("YYYY-MM-DD");
}

export function getOneYearAgo(): string {
  return moment().subtract(1, "year").format("YYYY-MM-DD");
}

export function useAuditFilterFormConfig() {
  const schema = yup.object({
    module: yup.mixed<AuditModule>().required(),
    action_type: yup.mixed<AuditActionType>().required(),
    date_from: yup.string(),
    date_to: yup.string(),
  });

  const defaultValues: AuditFilterFormValues = {
    module: null,
    action_type: null,
    date_from: getOneMonthAgo(),
    date_to: getToday(),
  };

  return {schema, defaultValues};
}
