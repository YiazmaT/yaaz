import type {ComponentType} from "react";
import type {DataTableColumn} from "@/src/components/data-table/types";
import {User} from "../users/types";

export interface AuditLog {
  id: string;
  type: string;
  create_date: string;
  message: string | null;
  route: string | null;
  source: string;
  module: string;
  content: Record<string, any> | null;
  error: Record<string, any> | null;
  user_id: string | null;
  user: Partial<User>;
  action_type: "create" | "update" | "delete" | "other";
}

export interface AuditFilters {
  module?: string;
  action_type?: string;
  date_from?: string;
  date_to?: string;
}

export interface AuditListResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

export type AuditTranslateFn = (key: string) => string;
export type AuditFormatCurrencyFn = (value: number | string | null | undefined, maxDecimals?: number) => string;

export interface AuditActionOption {
  action: string;
  label: string;
  routes: string[];
  columnsFactory?: (translate: AuditTranslateFn, formatCurrency?: AuditFormatCurrencyFn) => DataTableColumn<AuditLog>[];
  MobileContent?: ComponentType<{content: any}>;
}

export interface AuditModuleOption {
  key: string;
  label: string;
  actions: AuditActionOption[];
}
