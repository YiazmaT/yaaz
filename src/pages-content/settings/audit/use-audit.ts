import {useState} from "react";
import {AUDIT_MODULES} from "./constants";
import {useAuditTableConfig} from "./desktop/table-config";
import {AuditFilters, AuditLog} from "./types";

export const API_ROUTE = "/api/audit/paginated-list";

export function useAudit() {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<AuditFilters | null>(null);

  const showResults = !!(appliedFilters?.module && appliedFilters?.action_type);

  const actionConfig =
    appliedFilters?.module && appliedFilters?.action_type
      ? (AUDIT_MODULES[appliedFilters.module]?.actions.find((a) => a.action === appliedFilters.action_type) ?? null)
      : null;

  const {generateConfig: baseGenerateConfig} = useAuditTableConfig();

  function generateConfig() {
    return baseGenerateConfig(actionConfig?.columnsFactory);
  }

  function handleApply(filters: AuditFilters) {
    setAppliedFilters(filters);
  }

  function handleClear() {
    setAppliedFilters(null);
  }

  function handleViewDetail(log: AuditLog) {
    setSelectedLog(log);
  }

  function handleCloseDetail() {
    setSelectedLog(null);
  }

  function buildFilters(): Record<string, string> {
    const result: Record<string, string> = {};
    if (appliedFilters?.module) result.module = appliedFilters.module;
    if (appliedFilters?.action_type) result.action_type = appliedFilters.action_type;
    if (appliedFilters?.date_from) result.date_from = appliedFilters.date_from;
    if (appliedFilters?.date_to) result.date_to = appliedFilters.date_to;
    return result;
  }

  return {
    showResults,
    appliedFilters,
    MobileContent: actionConfig?.MobileContent ?? null,
    handleApply,
    handleClear,
    selectedLog,
    handleViewDetail,
    handleCloseDetail,
    generateConfig,
    buildFilters,
  };
}

export type UseAuditReturn = ReturnType<typeof useAudit>;
