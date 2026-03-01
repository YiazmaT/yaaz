import {AuditFilters} from "../../types";

export interface AuditFiltersProps {
  onApply: (filters: AuditFilters) => void;
  onClear: () => void;
}
