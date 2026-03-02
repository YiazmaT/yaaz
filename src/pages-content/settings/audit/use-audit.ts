import {useState} from "react";
import {useAuditTableConfig} from "./desktop/table-config";
import {AuditFilters, AuditLog} from "./types";

export const API_ROUTE = "/api/audit/paginated-list";

export function useAudit() {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<AuditFilters | null>(null);

  const showResults = !!(appliedFilters?.module && appliedFilters?.action_type);

  const {generateConfig} = useAuditTableConfig();

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
